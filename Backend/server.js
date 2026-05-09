const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ================= HEALTH CHECK =================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "MEI DRIVE AFRICA backend running",
    timestamp: new Date().toISOString()
  });
});

// ================= TEST CONTENT =================
app.get("/api/content", (req, res) => {
  res.json({
    content: {
      learnerUnits: [
        { id: 1, title: "Road Signs", desc: "Learn all road signs" },
        { id: 2, title: "Traffic Rules", desc: "Understand traffic laws" }
      ],
      questions: [
        {
          id: 1,
          text: "What does a red light mean?",
          options: ["Stop", "Go", "Speed up", "Honk"],
          correct: 0,
          category: "Signs"
        }
      ]
    }
  });
});

// ================= SERVER START =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("========================================");
  console.log("SERVER RUNNING ON PORT", PORT);
  console.log("========================================");
});
