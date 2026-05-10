// server.js - CommonJS syntax (works immediately)
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

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log("🚀 MEI Drive Africa Server Starting...");
console.log(`📁 Public directory: ${path.join(__dirname, "public")}`);

// ====================== AUTH MIDDLEWARE ======================
async function requireAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid token" });
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

// ====================== HEALTH CHECK ======================
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), message: "Server is running!" });
});

// ====================== AUTH ENDPOINTS ======================
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({ 
      success: true, 
      user: data.user, 
      session: data.session 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== CONTENT ENDPOINTS ======================
app.get("/api/content", async (req, res) => {
  try {
    // Return complete content structure
    const contentData = {
      learnerUnits: [
        { id: 1, title: "Introduction to Driving in Kenya", description: "Licensing categories, NTSA roles, legal requirements", icon: "fa-id-card" },
        { id: 2, title: "The Highway Code & Traffic Signs", description: "Regulatory, warning signs, road markings", icon: "fa-signs-post" },
        { id: 3, title: "Road User Behaviour & Etiquette", description: "Responsibilities towards pedestrians and other users", icon: "fa-hand-peace" },
        { id: 4, title: "Speed Limits & Safe Following Distances", description: "Urban/rural limits, two-second rule", icon: "fa-tachometer-alt" },
        { id: 5, title: "Overtaking, Lane Discipline & Merging", description: "Safe overtaking techniques, roundabouts", icon: "fa-exchange-alt" },
        { id: 6, title: "Junctions, Intersections & U-Turns", description: "T-junctions, crossroads, priority rules", icon: "fa-code-branch" },
        { id: 7, title: "Pedestrian Crossings & School Zones", description: "Zebra crossings, school safety", icon: "fa-child" },
        { id: 8, title: "Parking, Reversing & Turning", description: "Parallel parking, three-point turn", icon: "fa-parking" },
        { id: 9, title: "Vehicle Controls & Cockpit Drill", description: "Pre-drive checks, clutch control", icon: "fa-car" },
        { id: 10, title: "Night Driving & Adverse Weather", description: "Headlight usage, fog, rain", icon: "fa-cloud-moon" },
        { id: 11, title: "Emergency Procedures & Breakdowns", description: "Accident reporting, warning triangle", icon: "fa-tools" },
        { id: 12, title: "Alcohol, Drugs & Driver Fitness", description: "Legal limits, fatigue management", icon: "fa-wine-bottle" },
        { id: 13, title: "Practical Driving Test Guidelines", description: "What examiners check", icon: "fa-clipboard-list" },
        { id: 14, title: "Road Safety & Environmental Awareness", description: "Eco-driving, emissions reduction", icon: "fa-leaf" }
      ],
      psvModules: [
        { id: 1, title: "PSV Licensing & Compliance", description: "Route charts, insurance, PSV badge requirements", duration: "2 hours", level: "Core" },
        { id: 2, title: "Passenger Safety Management", description: "Boarding/alighting, load limits, emergency exits", duration: "3 hours", level: "Core" },
        { id: 3, title: "Driver Hours & Fatigue Management", description: "Tachograph rules, rest periods, record keeping", duration: "2 hours", level: "Advanced" },
        { id: 4, title: "Defensive Driving for PSV", description: "Hazard perception, avoiding collisions", duration: "4 hours", level: "Advanced" }
      ],
      bodaModules: [
        { id: 1, title: "Compulsory Helmet & Safety Gear", description: "NTSA standard helmets, reflective vests", duration: "1 hour", level: "Beginner" },
        { id: 2, title: "Rider Balance & Load Carrying", description: "Safe passenger limits, luggage rules", duration: "2 hours", level: "Beginner" },
        { id: 3, title: "Urban Navigation & Lane Splitting", description: "Boda-boda lanes, defensive tactics", duration: "3 hours", level: "Intermediate" },
        { id: 4, title: "Night Riding & Weather Safety", description: "Proper lighting, reflective gear, hazard awareness", duration: "2 hours", level: "Advanced" }
      ],
      schoolModules: [
        { id: 1, title: "Child Embarkation Safety", description: "Safe boarding procedures, monitors, signage", duration: "2 hours", level: "Core" },
        { id: 2, title: "Speed Management Near Schools", description: "20km/h zones, speed bumps, crossing guards", duration: "1 hour", level: "Core" },
        { id: 3, title: "School Bus Emergency Evacuation", description: "Drills, emergency exits, communication protocols", duration: "3 hours", level: "Advanced" }
      ],
      academyCourses: [
        { id: 1, title: "Eco-Driving Professional", description: "Reduce fuel costs & emissions by 20%", duration: "2 days", price: "KSH 5,000", level: "Professional" },
        { id: 2, title: "Defensive Driving Instructor", description: "Advanced hazard perception & skid recovery", duration: "5 days", price: "KSH 15,000", level: "Master" },
        { id: 3, title: "Fleet Management Certification", description: "Route planning, maintenance scheduling", duration: "3 days", price: "KSH 10,000", level: "Professional" },
        { id: 4, title: "First Aid & Emergency Response", description: "Accident scene management, basic life support", duration: "2 days", price: "KSH 6,000", level: "Core" }
      ],
      libraryDocs: [
        { id: 1, title: "Kenya Highway Code 2025", category: "Official", downloads: "2.3k", type: "PDF", size: "4.2 MB" },
        { id: 2, title: "NTSA Driving Schools Manual", category: "Guide", downloads: "1.1k", type: "PDF", size: "2.8 MB" },
        { id: 3, title: "PSV Safety Handbook", category: "PSV", downloads: "850", type: "PDF", size: "3.1 MB" },
        { id: 4, title: "Boda Boda Safety Guidelines", category: "Boda", downloads: "620", type: "PDF", size: "1.9 MB" },
        { id: 5, title: "School Transport Best Practices", category: "School", downloads: "450", type: "PDF", size: "2.5 MB" },
        { id: 6, title: "Defensive Driving Techniques", category: "Advanced", downloads: "1.2k", type: "PDF", size: "3.5 MB" }
      ],
      questions: [
        { id: 1, text: "What is the maximum speed limit for a private car inside a built-up area in Kenya?", options: ["40 km/h", "50 km/h", "60 km/h", "70 km/h"], correct: 1, category: "Speed Limits" },
        { id: 2, text: "When approaching a zebra crossing with pedestrians waiting, you should:", options: ["Honk to alert them", "Stop only if they are crossing", "Slow down and stop if necessary", "Accelerate to clear quickly"], correct: 2, category: "Pedestrian" },
        { id: 3, text: "What does a flashing amber traffic light indicate?", options: ["Stop immediately", "Prepare to stop", "Proceed with caution", "Emergency vehicles only"], correct: 2, category: "Signals" },
        { id: 4, text: "What is the legal blood alcohol limit for a professional PSV driver in Kenya?", options: ["0.00 mg/100ml", "0.05 mg/100ml", "0.08 mg/100ml", "0.1 mg/100ml"], correct: 0, category: "Alcohol" },
        { id: 5, text: "What is the recommended minimum following distance in dry conditions?", options: ["1 second", "2 seconds", "3 seconds", "4 seconds"], correct: 1, category: "Safe Distance" },
        { id: 6, text: "At an uncontrolled junction, who has the right of way?", options: ["Vehicle from left", "Vehicle from right", "Largest vehicle", "First to arrive"], correct: 1, category: "Junctions" },
        { id: 7, text: "Before reversing, you should:", options: ["Check mirror only", "Turn head and check blind spots", "Sound horn", "Use hazards"], correct: 1, category: "Maneuvers" }
      ]
    };

    res.json({ content: contentData });
  } catch (err) {
    console.error("Content error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ====================== PROGRESS ENDPOINTS ======================
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
      progress: data ? data.progress_data : { units: {}, answers: [] }
    });
  } catch (err) {
    console.error("Progress error:", err);
    res.json({ progress: { units: {}, answers: [] } });
  }
});

app.post("/api/progress", async (req, res) => {
  const { userId, unitId, completed, answers } = req.body;
  
  try {
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

// ====================== ADMIN ENDPOINTS ======================
app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from("user_progress").select("*");
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
    
    const users = (data || []).map(u => ({
      id: u.user_id,
      user_id: u.user_id,
      user_name: u.user_name || u.user_id.substring(0, 15),
      user_email: u.user_email || `${u.user_id}@learner.mei`,
      user_role: u.user_role || "learner",
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

// ====================== SERVE FRONTEND ======================
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ====================== START SERVER ======================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running successfully!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔧 Admin: http://localhost:${PORT}/admin`);
  console.log(`📁 Public directory: ${path.join(__dirname, "public")}`);
});
