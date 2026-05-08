require("dotenv").config();

const express = require("express");
const cors = require("cors");

// ======================
// FIXED IMPORTS (IMPORTANT)
// ======================
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors({
  origin: "*", // change to your frontend domain in production
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
// TEST ROUTE
// ======================
app.get("/", (req, res) => {
  res.send("MEI DRIVE AFRICA API RUNNING 🚀");
});

// ======================
// HANDLE UNKNOWN ROUTES
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
