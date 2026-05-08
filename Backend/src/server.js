require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors({
  origin: "*", // change to your frontend URL in production
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ======================
// ROUTES
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// ======================
// HEALTH CHECK
// ======================
app.get("/", (req, res) => {
  res.status(200).send("MEI DRIVE AFRICA API RUNNING 🚀");
});

// ======================
// ERROR HANDLING (optional but good)
// ======================
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
