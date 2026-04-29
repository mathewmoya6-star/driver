const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/valuation", require("./routes/valuation"));
app.use("/api/exam", require("./routes/exam"));

app.get("/", (req, res) => {
  res.send("DriverPrep Kenya API Running 🚗");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
