const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(bodyParser.json());

// CRITICAL FIX: absolute static path
app.use(express.static(path.join(__dirname, "public")));

/* ================= DATABASE ================= */
const db = new sqlite3.Database("db.sqlite");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phone TEXT,
      password TEXT,
      status TEXT DEFAULT 'inactive'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT,
      question TEXT,
      a TEXT,
      b TEXT,
      c TEXT,
      d TEXT,
      answer TEXT
    )
  `);
});

/* ================= API ROUTES ================= */

app.post("/api/register", (req, res) => {
  const { name, phone, password } = req.body;

  db.run(
    "INSERT INTO users(name,phone,password) VALUES (?,?,?)",
    [name, phone, password],
    () => res.json({ success: true })
  );
});

app.post("/api/login", (req, res) => {
  const { phone, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE phone=? AND password=?",
    [phone, password],
    (err, user) => {
      if (!user) return res.json({ success: false });
      res.json({ success: true, user });
    }
  );
});

app.get("/api/questions", (req, res) => {
  db.all("SELECT * FROM questions", (err, rows) => {
    res.json(rows);
  });
});

app.post("/api/pay", (req, res) => {
  const { userId } = req.body;

  db.run("UPDATE users SET status='active' WHERE id=?", [userId]);

  res.json({ success: true });
});

/* ================= CRITICAL FIX: ROUTING ================= */

// FIX 404 for login.html, dashboard.html, etc.
app.get("/:page", (req, res) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, "public", page);

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("Page not found");
    }
  });
});

// DEFAULT ROUTE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("DriverPrep PRO running on port " + PORT);
});
