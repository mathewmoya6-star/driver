const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("MEI DRIVE AFRICA API RUNNING 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    time: new Date()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Local server running on http://localhost:${PORT}`);
});
