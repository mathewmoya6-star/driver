const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ================= SUPABASE CLIENT =================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ================= AUTH MIDDLEWARE =================
async function requireAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const role = data.user.user_metadata?.role;

    if (role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ error: "Authentication error" });
  }
}

// ================= HEALTH CHECK =================
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ================= AUTH ENDPOINTS =================
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  res.json({
    success: true,
    user: data.user,
    session: data.session
  });
});

app.post("/api/logout", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (token) {
    await supabase.auth.admin.signOut(token);
  }
  
  res.json({ success: true });
});

// ================= CONTENT ENDPOINTS =================
app.get("/api/content", async (req, res) => {
  try {
    // Load content from Supabase or return default structure
    const { data: units, error } = await supabase
      .from("learner_units")
      .select("*")
      .order("id", { ascending: true });
    
    if (error) {
      // Fallback to static content if table doesn't exist
      return res.json({
        content: {
          learnerUnits: [
            { id: 1, title: "Introduction to Driving in Kenya", desc: "Licensing categories, NTSA roles" },
            { id: 2, title: "The Highway Code & Traffic Signs", desc: "Regulatory, warning signs, road markings" },
            { id: 3, title: "Road User Behaviour & Etiquette", desc: "Responsibilities towards pedestrians" },
            { id: 4, title: "Speed Limits & Safe Following Distances", desc: "Urban/rural limits, two-second rule" },
            { id: 5, title: "Overtaking, Lane Discipline & Merging", desc: "Safe overtaking techniques" },
            { id: 6, title: "Junctions, Intersections & U-Turns", desc: "T-junctions, crossroads, priority rules" },
            { id: 7, title: "Pedestrian Crossings & School Zones", desc: "Zebra crossings, school safety" },
            { id: 8, title: "Parking, Reversing & Turning", desc: "Parallel parking, three-point turn" },
            { id: 9, title: "Vehicle Controls & Cockpit Drill", desc: "Pre-drive checks, clutch control" },
            { id: 10, title: "Night Driving & Adverse Weather", desc: "Headlight usage, fog, rain" },
            { id: 11, title: "Emergency Procedures & Breakdowns", desc: "Accident reporting, warning triangle" },
            { id: 12, title: "Alcohol, Drugs & Driver Fitness", desc: "Legal limits, fatigue" },
            { id: 13, title: "Practical Driving Test Guidelines", desc: "What examiners check" },
            { id: 14, title: "Road Safety & Environmental Awareness", desc: "Eco-driving, emissions" }
          ],
          psvModules: [
            { title: "PSV Licensing & Route Compliance", desc: "Renewal, route charts, insurance" },
            { title: "Passenger Safety & Crowd Management", desc: "Boarding/alighting safely" },
            { title: "Tachograph & Hours of Service", desc: "Driver fatigue management" }
          ],
          bodaModules: [
            { title: "Compulsory Helmet & Reflectors", desc: "NTSA standard helmets" },
            { title: "Rider Balance & Load Carrying", desc: "Safe passenger limits" },
            { title: "Navigating Nairobi & County Streets", desc: "Boda-boda lanes" }
          ],
          schoolModules: [
            { title: "Child Embarkation Safety", desc: "Monitors & signage" },
            { title: "Speed Management Near Schools", desc: "20km/h zones" }
          ],
          academyCourses: [
            { title: "Eco-Driving Professional", desc: "Reduce fuel costs & emissions" },
            { title: "Defensive Driving Instructor", desc: "Advanced hazard perception" }
          ],
          libraryDocs: [
            { title: "Kenya Highway Code 2025", category: "Official", downloads: "2.3k" },
            { title: "NTSA Driving Schools Manual", category: "Guide", downloads: "1.1k" }
          ],
          questions: [
            { id: 1, text: "Maximum speed limit for a private car inside a built-up area?", options: ["40 km/h", "50 km/h", "60 km/h", "70 km/h"], correct: 1, category: "Speed Limits" },
            { id: 2, text: "At a zebra crossing, you should:", options: ["Honk", "Stop if pedestrian is crossing", "Slow and stop if necessary", "Accelerate"], correct: 2, category: "Pedestrian" },
            { id: 3, text: "Flashing amber traffic light means:", options: ["Stop", "Prepare to stop", "Proceed with caution", "Emergency only"], correct: 2, category: "Signals" },
            { id: 4, text: "Legal blood alcohol limit for PSV driver in Kenya?", options: ["0.00 mg", "0.05 mg", "0.08 mg", "0.1 mg"], correct: 0, category: "Alcohol" },
            { id: 5, text: "Safe following distance in dry conditions:", options: ["1 sec", "2 sec", "3 sec", "4 sec"], correct: 1, category: "Safe Distance" },
            { id: 6, text: "At an uncontrolled junction, who has right of way?", options: ["Left", "Right", "Largest vehicle", "First to arrive"], correct: 1, category: "Junctions" },
            { id: 7, text: "Before reversing, you should:", options: ["Check mirror only", "Turn head and check blind spots", "Sound horn", "Hazards on"], correct: 1, category: "Maneuvers" },
            { id: 8, text: "What does a STOP sign require?", options: ["Slow down", "Stop completely then proceed", "Yield left", "Continue if clear"], correct: 1, category: "Signs" }
          ]
        }
      });
    }
    
    res.json({ content: units });
  } catch (err) {
    console.error("Content error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= PROGRESS ENDPOINTS =================
app.get("/api/progress/:userId", async (req, res) => {
  const { userId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (error && error.code !== "PGRST116") throw error;
    
    res.json({
      progress: data ? {
        units: data.progress_data?.units || {},
        answers: data.progress_data?.answers || []
      } : { units: {}, answers: [] }
    });
  } catch (err) {
    console.error("Progress error:", err);
    res.json({ progress: { units: {}, answers: [] } });
  }
});

app.post("/api/progress", async (req, res) => {
  const { userId, unitId, completed, answers } = req.body;
  
  try {
    // Get existing progress
    const { data: existing } = await supabase
      .from("user_progress")
      .select("progress_data")
      .eq("user_id", userId)
      .maybeSingle();
    
    let progressData = existing?.progress_data || { units: {}, answers: [] };
    
    if (unitId !== undefined && completed !== undefined) {
      progressData.units[unitId] = completed;
    }
    
    if (answers) {
      progressData.answers = answers;
    }
    
    const { error } = await supabase
      .from("user_progress")
      .upsert({
        user_id: userId,
        progress_data: progressData,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (err) {
    console.error("Save progress error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= ADMIN ENDPOINTS =================
app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select("*");
    
    if (error) throw error;
    
    const totalUsers = new Set(data?.map(u => u.user_id)).size;
    const totalCompletions = data?.reduce((sum, u) => {
      const completed = Object.values(u.progress_data?.units || {}).filter(v => v === 100).length;
      return sum + completed;
    }, 0) || 0;
    
    res.json({
      totalUsers,
      students: Math.floor(totalUsers * 0.6),
      drivers: Math.floor(totalUsers * 0.3),
      totalCompletions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/users", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .order("updated_at", { ascending: false });
    
    if (error) throw error;
    
    const users = data.map(u => ({
      id: u.user_id,
      name: u.user_name || u.user_id.substring(0, 15),
      email: u.user_email || `${u.user_id}@learner.mei`,
      role: u.user_role || "learner",
      progress: Object.values(u.progress_data?.units || {}).filter(v => v === 100).length,
      totalUnits: 14
    }));
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/users", requireAdmin, async (req, res) => {
  const { user_id, name, email, role } = req.body;
  
  try {
    const { error } = await supabase
      .from("user_progress")
      .upsert({
        user_id: user_id || email,
        user_name: name,
        user_email: email,
        user_role: role || "learner",
        progress_data: { units: {}, answers: [] },
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const { error } = await supabase
      .from("user_progress")
      .delete()
      .eq("user_id", id);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SERVE FRONTEND =================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ================= START SERVER =================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Admin dashboard: http://localhost:${PORT}/admin.html`);
});
