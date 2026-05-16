import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running on Render!' });
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@meidrive.com' && password === 'admin123') {
    res.json({
      success: true,
      token: 'admin-token-' + Date.now(),
      admin: { name: 'Super Admin', email: email, role: 'admin' }
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

app.get('/api/courses', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, title: 'Beginner Driving Course', description: 'Learn driving basics', type: 'premium', price: 5000 },
      { id: 2, title: 'Defensive Driving', description: 'Advanced safety techniques', type: 'premium', price: 7500 },
      { id: 3, title: 'Refresher Course', description: 'Refresh your skills', type: 'free', price: 0 }
    ]
  });
});

app.get('/api/admin/stats', (req, res) => {
  res.json({
    success: true,
    totalCourses: 12,
    totalStudents: 1234,
    totalRevenue: 45678,
    completionRate: 78
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Health check: /api/health`);
});
