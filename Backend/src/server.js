require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 🔐 Safety check (prevents silent crashes)
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error("Missing environment variables");
  process.exit(1);
}

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/driver", require("./routes/driver.routes"));
app.use("/api/student", require("./routes/student.routes"));

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    app: "MEI DRIVE AFRICA"
  });
});

// 🚀 Render-safe server binding
const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
