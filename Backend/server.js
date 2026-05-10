require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

/**
 * MIDDLEWARE
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ROUTES
 */
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api", require("./routes/user.routes"));

/**
 * HEALTH CHECK
 */
app.get("/", (req, res) => {
  res.json({ message: "MEI DRIVE AFRICA API RUNNING" });
});

/**
 * START SERVER
 */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("========================================");
  console.log("SERVER IS RUNNING!");
  console.log(`http://localhost:${PORT}`);
  console.log("========================================");
});
