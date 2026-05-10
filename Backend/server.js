require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

/**
 * Middleware
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "MEI DRIVE AFRICA API RUNNING",
  });
});

/**
 * ROUTES (FIXED PATHS)
 * IMPORTANT: These must match your folder structure
 */
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/me", require("./routes/me.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/user", require("./routes/user.routes"));
app.use("/api/ai", require("./routes/ai"));

/**
 * Frontend (optional)
 */
app.use(express.static(path.join(__dirname, "frontend")));

/**
 * PORT
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("========================================");
  console.log("SERVER IS RUNNING!");
  console.log(`http://localhost:${PORT}`);
  console.log("========================================");
});
