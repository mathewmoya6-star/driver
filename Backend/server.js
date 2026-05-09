// =====================
// SERVER.JS - Works on Vercel & Render
// =====================

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// =====================
// HEALTH CHECK ENDPOINTS
// =====================
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "MEI DRIVE AFRICA API RUNNING 🚀",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running properly",
    timestamp: new Date().toISOString()
  });
});

// =====================
// API ENDPOINTS FOR CONTENT
// =====================
app.get("/api/content", (req, res) => {
  res.json({
    content: {
      psvModules: [
        { title: "Passenger Safety & Etiquette", desc: "Loading procedures, door operation, emergency exits" },
        { title: "Route Compliance", desc: "Licensed PSV routes and NTSA regulations" },
        { title: "Driver Hours Management", desc: "Maximum driving hours and mandatory rest periods" }
      ],
      bodaModules: [
        { title: "Helmet & Protective Gear", desc: "NTSA approved helmets and safety equipment" },
        { title: "Lane Discipline", desc: "Safe filtering, signaling, and positioning" },
        { title: "Passenger & Cargo Limits", desc: "Maximum passengers and proper load securing" }
      ],
      schoolModules: [
        { title: "School Bus Safety Protocol", desc: "Child safety zones and loading/unloading procedures" },
        { title: "Emergency Response", desc: "Fire, accident, and medical emergency protocols" }
      ],
      academyCourses: [
        { title: "Defensive Driving Course", desc: "Advanced hazard perception and collision avoidance" },
        { title: "Eco-Driving Techniques", desc: "Fuel efficiency and environmental awareness" }
      ],
      libraryDocs: [
        { title: "Kenya Highway Code (Official)", category: "Regulation", downloads: "4.2k" },
        { title: "PSV Regulations Guide", category: "Legal", downloads: "2.1k" },
        { title: "Motorcycle Safety Handbook", category: "Boda", downloads: "3.5k" }
      ]
    }
  });
});

// =====================
// USER PROGRESS ENDPOINTS (Optional - can use Supabase directly)
// =====================
app.get("/api/progress/:userId", (req, res) => {
  // This is a placeholder - actual progress is handled by Supabase
  // You can implement caching here if needed
  res.json({
    progress: {
      units: {},
      answers: []
    }
  });
});

app.post("/api/progress", (req, res) => {
  // This is a placeholder - actual progress saving is handled by Supabase
  res.json({ success: true, message: "Progress saved to Supabase" });
});

// =====================
// SPA FALLBACK - Serve index.html for all other routes
// =====================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// =====================
// ERROR HANDLER
// =====================
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

// =====================
// START SERVER (Only for local/Render - Vercel uses serverless)
// =====================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ MEI DRIVE AFRICA running on port ${PORT}`);
    console.log(`🔗 Supabase URL: https://fktjmkmzlixlapeyhhyl.supabase.co`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

// Export for Vercel serverless deployment
module.exports = app;
