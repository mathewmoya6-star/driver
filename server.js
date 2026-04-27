const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const db = new sqlite3.Database("db.sqlite");

/* ---------------- DATABASE ---------------- */
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
      answer TEXT,
      image TEXT
    )
  `);

  db.run(`
    INSERT INTO questions (category, question, a, b, c, d, answer)
    VALUES ('Road Signs', 'What does STOP sign mean?', 'Go', 'Stop', 'Wait', 'Speed', 'Stop')
  `);
});

/* ---------------- AUTH ---------------- */
app.post("/api/register", (req, res) => {
  const { name, phone, password } = req.body;

  db.run(
    "INSERT INTO users (name, phone, password) VALUES (?, ?, ?)",
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

/* ---------------- QUESTIONS ---------------- */
app.get("/api/questions", (req, res) => {
  db.all("SELECT * FROM questions", (err, rows) => {
    res.json(rows);
  });
});

/* ---------------- PAYMENT (MOCK) ---------------- */
app.post("/api/pay", (req, res) => {
  const { userId } = req.body;

  db.run("UPDATE users SET status='active' WHERE id=?", [userId]);

  res.json({ success: true });
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("DriverPrep running on port " + PORT);
});
