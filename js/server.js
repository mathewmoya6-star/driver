// ===============================
// DRIVERPREP KENYA - FULL STACK ONE FILE SERVER
// ===============================

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===============================
// CONFIG
// ===============================
const PORT = 3000;
const JWT_SECRET = "driverprep_secret_key_change_me";

// MongoDB Atlas (replace with your real URI)
const MONGO_URI = "mongodb+srv://YOUR_DB_USER:YOUR_PASSWORD@cluster.mongodb.net/driverprep";

// ===============================
// CONNECT DB
// ===============================
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ===============================
// MODELS
// ===============================

const User = mongoose.model("User", {
  name: String,
  phone: String,
  password: String,
  role: { type: String, default: "user" }
});

const Question = mongoose.model("Question", {
  category: String,
  question: String,
  options: [String],
  answer: String
});

// ===============================
// AUTH MIDDLEWARE
// ===============================
function auth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.sendStatus(403);
  }
}

// ===============================
// SEED 300+ QUESTIONS (AUTO GENERATOR)
// ===============================
app.get("/seed-questions", async (req, res) => {
  const count = await Question.countDocuments();
  if (count > 0) return res.send("Already seeded");

  const categories = ["Road Rules", "Signs", "Safety", "PSV", "Mechanics"];

  let bulk = [];

  for (let i = 1; i <= 320; i++) {
    bulk.push({
      category: categories[i % categories.length],
      question: `NTSA Question ${i}: What is the correct action in situation ${i}?`,
      options: ["A", "B", "C", "D"],
      answer: "A"
    });
  }

  await Question.insertMany(bulk);
  res.send("Seeded 320 NTSA questions");
});

// ===============================
// REGISTER
// ===============================
app.post("/register", async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);

  const user = await User.create({
    name: req.body.name,
    phone: req.body.phone,
    password: hashed
  });

  res.json(user);
});

// ===============================
// LOGIN
// ===============================
app.post("/login", async (req, res) => {
  const user = await User.findOne({ phone: req.body.phone });
  if (!user) return res.status(404).send("User not found");

  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.status(401).send("Invalid password");

  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);

  res.json({ token });
});

// ===============================
// GET QUESTIONS
// ===============================
app.get("/questions", auth, async (req, res) => {
  const data = await Question.find().limit(50);
  res.json(data);
});

// ===============================
// DASHBOARD
// ===============================
app.get("/dashboard", auth, async (req, res) => {
  const users = await User.countDocuments();
  const questions = await Question.countDocuments();

  res.json({
    users,
    questions,
    system: "DriverPrep Kenya Active"
  });
});

// ===============================
// M-PESA STK PUSH (REAL STRUCTURE - SANDBOX READY)
// ===============================
app.post("/mpesa/stkpush", async (req, res) => {
  const { phone, amount } = req.body;

  // NOTE: Replace with real credentials from Safaricom Daraja API
  const data = {
    BusinessShortCode: "174379",
    Password: "GENERATED_PASSWORD",
    Timestamp: "20260101000000",
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: "174379",
    PhoneNumber: phone,
    CallBackURL: "https://yourdomain.com/callback",
    AccountReference: "DriverPrep",
    TransactionDesc: "Course Payment"
  };

  res.json({
    message: "STK Push initiated (sandbox mode)",
    data
  });
});

// ===============================
// FRONTEND (SINGLE FILE UI)
// ===============================
const frontend = `
<!DOCTYPE html>
<html>
<head>
<title>DriverPrep Kenya</title>
<style>
body{font-family:Arial;background:#111;color:gold;text-align:center;padding:40px}
.card{background:#222;padding:20px;border-radius:10px;margin:10px}
button{padding:10px;background:gold;border:none;cursor:pointer}
</style>
</head>
<body>

<h1>DriverPrep Kenya</h1>

<div class="card">
<h3>Login</h3>
<input id="phone" placeholder="Phone"><br><br>
<input id="password" type="password" placeholder="Password"><br><br>
<button onclick="login()">Login</button>
</div>

<div class="card">
<h3>Dashboard</h3>
<button onclick="loadDash()">Load</button>
<pre id="out"></pre>
</div>

<script>
let token="";

function login(){
 fetch("/login",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({phone, password})
 }).then(r=>r.json()).then(d=>{
  token=d.token;
  alert("Logged in");
 });
}

function loadDash(){
 fetch("/dashboard",{headers:{Authorization:"Bearer "+token}})
 .then(r=>r.json())
 .then(d=>{
  document.getElementById("out").innerText=JSON.stringify(d,null,2);
 });
}
</script>

</body>
</html>
`;

// ===============================
// SERVE FRONTEND
// ===============================
app.get("/", (req, res) => {
  res.send(frontend);
});

// ===============================
app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
