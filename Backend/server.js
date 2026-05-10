require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api", require("./routes/user.routes"));
app.use("/api", require("./routes/admin.routes"));

app.get("/", (req, res) => {
  res.json({ message: "API RUNNING" });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("SERVER RUNNING ON", PORT);
});
