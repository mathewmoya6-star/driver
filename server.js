const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api", require("./routes/me.routes"));
app.use("/api", require("./routes/admin.routes"));

app.get("/", (req, res) => {
  res.json({ message: "MEI DRIVE AFRICA API RUNNING" });
});

// ONLY RUN LOCALLY / RENDER
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log("Server running on", PORT);
  });
}

module.exports = app;
