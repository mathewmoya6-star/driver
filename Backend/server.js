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
    message: "MEI DRIVE AFRICA API RUNNING",
    status: "OK",
  });
});

/**
 * ROUTES (IMPORTANT - THIS FIXES YOUR ERROR)
 */
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/me", require("./routes/me.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

/**
 * Static frontend (optional)
 */
app.use(express.static(path.join(__dirname, "frontend")));

/**
 * PORT (Render + local safe)
 */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("========================================");
  console.log("SERVER IS RUNNING!");
  console.log(`http://localhost:${PORT}`);
  console.log("========================================");
});
