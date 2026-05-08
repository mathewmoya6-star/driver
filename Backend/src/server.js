const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ================= FRONTEND =================

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Admin page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// ================= HEALTH CHECK =================

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    app: "MEI DRIVE AFRICA",
    message: "Server running successfully",
    timestamp: new Date()
  });
});

// ================= DASHBOARD STATS =================

app.get("/api/admin/stats", (req, res) => {
  res.json({
    users: 2450,
    courses: 18,
    questions: 1250,
    revenue: 485000
  });
});

// ================= USERS =================

let users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Student"
  },
  {
    id: 2,
    name: "Admin User",
    email: "admin@example.com",
    role: "Admin"
  }
];

app.get("/api/admin/users", (req, res) => {
  res.json(users);
});

app.delete("/api/admin/users/:id", (req, res) => {
  users = users.filter(user => user.id != req.params.id);

  res.json({
    success: true,
    message: "User deleted"
  });
});

// ================= COURSES =================

let courses = [
  {
    id: 1,
    title: "PSV Safety Training",
    description: "Professional PSV safety course"
  },
  {
    id: 2,
    title: "Boda Boda Rider Safety",
    description: "Motorcycle safety training"
  }
];

app.get("/api/admin/courses", (req, res) => {
  res.json(courses);
});

app.post("/api/admin/courses", (req, res) => {
  const newCourse = {
    id: Date.now(),
    title: req.body.title,
    description: req.body.description
  };

  courses.push(newCourse);

  res.json({
    success: true,
    course: newCourse
  });
});

app.delete("/api/admin/courses/:id", (req, res) => {
  courses = courses.filter(course => course.id != req.params.id);

  res.json({
    success: true,
    message: "Course deleted"
  });
});

// ================= QUESTIONS =================

let questions = [
  {
    id: 1,
    question: "What is the speed limit in school zones?",
    category: "Road Safety"
  },
  {
    id: 2,
    question: "When should seat belts be worn?",
    category: "Traffic Rules"
  }
];

app.get("/api/admin/questions", (req, res) => {
  res.json(questions);
});

app.post("/api/admin/questions", (req, res) => {
  const newQuestion = {
    id: Date.now(),
    question: req.body.question,
    category: req.body.category
  };

  questions.push(newQuestion);

  res.json({
    success: true,
    question: newQuestion
  });
});

app.delete("/api/admin/questions/:id", (req, res) => {
  questions = questions.filter(q => q.id != req.params.id);

  res.json({
    success: true,
    message: "Question deleted"
  });
});

// ================= PAYMENTS =================

const payments = [
  {
    user: "John Doe",
    course: "PSV Training",
    amount: 5000,
    status: "Paid"
  },
  {
    user: "Jane Smith",
    course: "Boda Safety",
    amount: 3000,
    status: "Pending"
  }
];

app.get("/api/admin/payments", (req, res) => {
  res.json(payments);
});

// ================= SETTINGS =================

let settings = {
  siteName: "MEI DRIVE AFRICA",
  supportEmail: "support@meidriveafrica.com"
};

app.get("/api/admin/settings", (req, res) => {
  res.json(settings);
});

app.post("/api/admin/settings", (req, res) => {
  settings = {
    ...settings,
    ...req.body
  };

  res.json({
    success: true,
    settings
  });
});

// ================= LOGIN =================

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (
    email === "admin@example.com" &&
    password === "pass123"
  ) {
    return res.json({
      success: true,
      user: {
        id: 1,
        name: "Admin User",
        email,
        role: "Admin"
      }
    });
  }

  res.status(401).json({
    success: false,
    message: "Invalid credentials"
  });
});

// ================= PORT =================

const PORT = process.env.PORT || 10000;

// Start server
app.listen(PORT, () => {
  console.log(`MEI DRIVE AFRICA running on port ${PORT}`);
});
