const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", require("./backend/routes/auth.routes"));
app.use("/api", require("./backend/routes/me.routes"));
app.use("/api", require("./backend/routes/admin.routes"));

app.get("/", (req, res) => {
  res.json({ message: "MEI DRIVE AFRICA API RUNNING" });
});

// ONLY for Render / local
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
