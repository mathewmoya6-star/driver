const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Supabase Admin Client (Service Role - for backend operations)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ====================== AUTH MIDDLEWARE ======================
async function authenticateUser(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: "Auth error" });
  }
}

async function requireAdmin(req, res, next) {
  await authenticateUser(req, res, () => {
    const role = req.user.user_metadata?.role;
    if (role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
}

// ====================== HEALTH CHECK ======================
app.get("/api/health", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from("units").select("count", { count: "exact", head: true });
    if (error) throw error;
    res.json({ status: "ok", timestamp: new Date().toISOString(), database: "connected" });
  } catch (err) {
    res.json({ status: "ok", timestamp: new Date().toISOString(), database: "error", message: err.message });
  }
});

// ====================== AUTH ENDPOINTS ======================
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, name, role = "learner" } = req.body;

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role }
    });

    if (error) throw error;

    // Create user profile
    await supabaseAdmin.from("user_profiles").insert({
      user_id: data.user.id,
      name,
      email,
      role,
      created_at: new Date().toISOString()
    });

    res.json({ success: true, user: data.user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.json({
      success: true,
      user: data.user,
      session: data.session
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.post("/api/auth/logout", authenticateUser, async (req, res) => {
  try {
    await supabaseAdmin.auth.admin.signOut(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== CONTENT ENDPOINTS ======================
app.get("/api/content/units", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("units")
      .select("*, lessons(*)")
      .order("order_number");

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/content/questions", async (req, res) => {
  try {
    const { category, limit = 50 } = req.query;
    let query = supabaseAdmin.from("questions").select("*");

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data, error } = await query.limit(parseInt(limit));
    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== EXAM ENGINE ======================
app.post("/api/exam/generate", authenticateUser, async (req, res) => {
  const { mode, category, questionCount } = req.body;

  try {
    let query = supabaseAdmin.from("questions").select("*");

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data: allQuestions, error } = await query;
    if (error) throw error;

    // Random selection based on mode
    let count = questionCount || (mode === "mock" ? 30 : mode === "timed" ? 20 : 10);
    const shuffled = [...allQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selectedQuestions = shuffled.slice(0, Math.min(count, shuffled.length));

    // Create exam session
    const examSession = {
      user_id: req.user.id,
      mode,
      questions: selectedQuestions.map(q => ({ id: q.id, text: q.text, options: q.options, correct: q.correct })),
      start_time: new Date().toISOString(),
      status: "in_progress"
    };

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("exam_sessions")
      .insert(examSession)
      .select()
      .single();

    if (sessionError) throw sessionError;

    res.json({
      session_id: session.id,
      questions: selectedQuestions.map(q => ({
        id: q.id,
        text: q.text,
        options: q.options
      })),
      time_limit: mode === "mock" ? 1800 : mode === "timed" ? 1800 : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/exam/submit", authenticateUser, async (req, res) => {
  const { session_id, answers } = req.body;

  try {
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("exam_sessions")
      .select("*")
      .eq("id", session_id)
      .eq("user_id", req.user.id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: "Exam session not found" });
    }

    let correctCount = 0;
    const questionResults = [];

    for (const answer of answers) {
      const question = session.questions.find(q => q.id === answer.question_id);
      const isCorrect = question && question.correct === answer.selected;
      if (isCorrect) correctCount++;
      questionResults.push({
        question_id: answer.question_id,
        selected: answer.selected,
        is_correct: isCorrect
      });
    }

    const score = (correctCount / session.questions.length) * 100;
    const passed = score >= 70;
    const endTime = new Date();
    const startTime = new Date(session.start_time);
    const timeSpent = Math.floor((endTime - startTime) / 1000);

    const { error: updateError } = await supabaseAdmin
      .from("exam_sessions")
      .update({
        answers: questionResults,
        score,
        passed,
        time_spent: timeSpent,
        status: "completed",
        end_time: endTime.toISOString()
      })
      .eq("id", session_id);

    if (updateError) throw updateError;

    // Update user progress
    await supabaseAdmin.rpc("update_user_stats", {
      p_user_id: req.user.id,
      p_exam_score: score,
      p_exam_passed: passed
    });

    res.json({
      success: true,
      score,
      passed,
      correct: correctCount,
      total: session.questions.length,
      time_spent: timeSpent
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== PROGRESS ENDPOINTS ======================
app.get("/api/progress", authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_progress")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    res.json(data || { units: {}, answers: [], exam_history: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/progress", authenticateUser, async (req, res) => {
  const { unit_id, completed, lesson_id, quiz_score } = req.body;

  try {
    const { data: existing } = await supabaseAdmin
      .from("user_progress")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    let progressData = existing?.progress_data || { units: {}, answers: [], completed_lessons: [] };

    if (unit_id && completed !== undefined) {
      if (!progressData.units[unit_id]) progressData.units[unit_id] = { lessons: [], score: 0 };
      progressData.units[unit_id].completed = completed;
    }

    if (lesson_id) {
      if (!progressData.completed_lessons.includes(lesson_id)) {
        progressData.completed_lessons.push(lesson_id);
      }
    }

    if (quiz_score !== undefined) {
      if (!progressData.quiz_scores) progressData.quiz_scores = [];
      progressData.quiz_scores.push({ lesson_id, score: quiz_score, date: new Date().toISOString() });
    }

    const { error } = await supabaseAdmin
      .from("user_progress")
      .upsert({
        user_id: req.user.id,
        progress_data: progressData,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== ADMIN ENDPOINTS ======================
app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  try {
    const { count: userCount } = await supabaseAdmin.from("user_profiles").select("*", { count: "exact", head: true });
    const { data: examStats } = await supabaseAdmin.from("exam_sessions").select("score, passed");
    
    const avgScore = examStats?.reduce((sum, e) => sum + (e.score || 0), 0) / (examStats?.length || 1);
    const passRate = examStats?.filter(e => e.passed).length / (examStats?.length || 1) * 100;

    res.json({
      total_users: userCount || 0,
      avg_score: Math.round(avgScore || 0),
      pass_rate: Math.round(passRate || 0),
      total_exams: examStats?.length || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/users", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== SERVE FRONTEND ======================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
