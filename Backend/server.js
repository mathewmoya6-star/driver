const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Initialize data files
function initDataFiles() {
    // Default users
    const defaultUsers = [
        { id: 1, name: "Admin User", email: "admin@meidrive.com", password: "admin123", role: "admin", modules: ["learner", "psv", "boda", "school", "academy", "library"], status: "active", createdAt: new Date().toISOString() },
        { id: 2, name: "John Learner", email: "john@example.com", password: "pass123", role: "learner", modules: ["learner", "library"], status: "active", createdAt: new Date().toISOString() },
        { id: 3, name: "Peter PSV", email: "peter@psv.com", password: "psv123", role: "psv_driver", modules: ["psv", "learner", "library"], status: "active", createdAt: new Date().toISOString() },
        { id: 4, name: "Mary Boda", email: "mary@boda.com", password: "boda123", role: "boda_rider", modules: ["boda", "learner", "library"], status: "active", createdAt: new Date().toISOString() },
        { id: 5, name: "James Instructor", email: "james@academy.com", password: "instructor123", role: "instructor", modules: ["learner", "psv", "boda", "school", "academy", "library"], status: "active", createdAt: new Date().toISOString() }
    ];
    
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
    }
    
    if (!fs.existsSync(PROGRESS_FILE)) {
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify({}, null, 2));
    }
}

// Read users from file
function readUsers() {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
}

// Write users to file
function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Read progress data
function readProgress() {
    const data = fs.readFileSync(PROGRESS_FILE, 'utf8');
    return JSON.parse(data);
}

// Write progress data
function writeProgress(progress) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Initialize
initDataFiles();

// ============ API ROUTES ============

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});

// ============ AUTH ROUTES ============

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.email === email && u.password === password && u.status === 'active');
    
    if (user) {
        const { password, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// ============ USER ROUTES (Admin only) ============

// Get all users (admin only)
app.get('/api/users', (req, res) => {
    const { adminEmail } = req.headers;
    const users = readUsers();
    const admin = users.find(u => u.email === adminEmail && u.role === 'admin');
    
    if (admin) {
        const usersWithoutPasswords = users.map(({ password, ...user }) => user);
        res.json({ success: true, users: usersWithoutPasswords });
    } else {
        res.status(403).json({ success: false, message: 'Admin access required' });
    }
});

// Add new user (admin only)
app.post('/api/users', (req, res) => {
    const { adminEmail, name, email, password, role, modules } = req.body;
    const users = readUsers();
    const admin = users.find(u => u.email === adminEmail && u.role === 'admin');
    
    if (!admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    const newUser = {
        id: users.length + 1,
        name,
        email,
        password: password || 'pass123',
        role,
        modules: modules || ['library'],
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    writeUsers(users);
    
    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ success: true, user: userWithoutPassword });
});

// Update user (admin only)
app.put('/api/users/:id', (req, res) => {
    const { adminEmail } = req.body;
    const { id } = req.params;
    const { name, email, role, modules, status } = req.body;
    const users = readUsers();
    const admin = users.find(u => u.email === adminEmail && u.role === 'admin');
    
    if (!admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    users[userIndex] = { ...users[userIndex], name, email, role, modules, status };
    writeUsers(users);
    
    const { password: _, ...userWithoutPassword } = users[userIndex];
    res.json({ success: true, user: userWithoutPassword });
});

// Delete user (admin only)
app.delete('/api/users/:id', (req, res) => {
    const { adminEmail } = req.headers;
    const { id } = req.params;
    const users = readUsers();
    const admin = users.find(u => u.email === adminEmail && u.role === 'admin');
    
    if (!admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const filteredUsers = users.filter(u => u.id !== parseInt(id));
    if (filteredUsers.length === users.length) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    writeUsers(filteredUsers);
    res.json({ success: true, message: 'User deleted' });
});

// ============ PROGRESS ROUTES ============

// Get user progress
app.get('/api/progress/:userId', (req, res) => {
    const { userId } = req.params;
    const progress = readProgress();
    res.json({ success: true, progress: progress[userId] || { units: {}, answers: [] } });
});

// Update user progress
app.post('/api/progress', (req, res) => {
    const { userId, unitId, completed, answers } = req.body;
    const progress = readProgress();
    
    if (!progress[userId]) {
        progress[userId] = { units: {}, answers: [] };
    }
    
    if (unitId && completed !== undefined) {
        progress[userId].units[unitId] = completed;
    }
    
    if (answers) {
        progress[userId].answers = answers;
    }
    
    writeProgress(progress);
    res.json({ success: true, progress: progress[userId] });
});

// ============ CONTENT ROUTES ============

// Get all content (questions, modules, etc.)
app.get('/api/content', (req, res) => {
    const content = {
        learnerUnits: [
            { id: 1, title: "Introduction to Kenyan Driving", desc: "Overview of Kenya's driving laws and licensing requirements" },
            { id: 2, title: "The Kenya Highway Code", desc: "Complete study of the official Kenya Highway Code" },
            { id: 3, title: "Kenyan Road Signs & Markings", desc: "All regulatory, warning, and information signs" },
            { id: 4, title: "Vehicle Controls & Instruments", desc: "Understanding your vehicle controls" },
            { id: 5, title: "Observation & Anticipation", desc: "Developing hazard perception skills" },
            { id: 6, title: "Speed Management", desc: "Kenyan speed limits for different roads" },
            { id: 7, title: "Space Management & Positioning", desc: "Lane discipline and following distances" },
            { id: 8, title: "Emergency Procedures", desc: "What to do in emergencies" },
            { id: 9, title: "Night Driving Techniques", desc: "Safe night driving practices" },
            { id: 10, title: "Driving in Bad Weather", desc: "Techniques for adverse weather" },
            { id: 11, title: "Defensive Driving Strategies", desc: "Advanced safety techniques" },
            { id: 12, title: "Basic Vehicle Maintenance", desc: "Daily checks and maintenance" },
            { id: 13, title: "First Aid for Drivers", desc: "Essential first aid skills" },
            { id: 14, title: "PSV Specific Regulations", desc: "Rules for Public Service Vehicles" },
            { id: 15, title: "Boda Boda Safety", desc: "Motorcycle safety regulations" },
            { id: 16, title: "School Transport Safety", desc: "Rules for transporting children" },
            { id: 17, title: "Highway Code Review", desc: "Comprehensive review" },
            { id: 18, title: "NTSA Rules & Penalties", desc: "Latest NTSA regulations" },
            { id: 19, title: "Mock Theory Test 1", desc: "Practice test - Part 1" },
            { id: 20, title: "Mock Theory Test 2", desc: "Practice test - Part 2" },
            { id: 21, title: "Final Certification Assessment", desc: "Final assessment" }
        ],
        psvModules: [
            { title: "NTSA PSV Licensing & Compliance", desc: "License requirements and regulations" },
            { title: "Passenger Safety & Conduct", desc: "Ensuring passenger safety" },
            { title: "Driver Working Hours & Rest", desc: "Managing fatigue" },
            { title: "Vehicle Inspection Standards", desc: "Daily safety checks" },
            { title: "Emergency Response for PSV", desc: "Handling accidents" },
            { title: "Customer Service Excellence", desc: "Professional conduct" },
            { title: "Fare Management & Receipts", desc: "Proper fare collection" },
            { title: "Defensive Driving for PSV", desc: "Advanced safety techniques" }
        ],
        bodaModules: [
            { title: "Helmet Safety & PPE", desc: "Proper helmet use" },
            { title: "Urban Riding Techniques", desc: "City traffic navigation" },
            { title: "Hazard Perception", desc: "Identifying dangers" },
            { title: "Passenger Safety", desc: "Safe transport" },
            { title: "Night Riding Safety", desc: "Visibility at night" },
            { title: "Defensive Riding", desc: "Anticipating others" },
            { title: "Motorcycle Maintenance", desc: "Keeping bike safe" },
            { title: "Road Ethics & Professionalism", desc: "Professional conduct" }
        ],
        schoolModules: [
            { title: "School Bus Safety Standards", desc: "Safe operation" },
            { title: "Child Safety Protocols", desc: "Protecting children" },
            { title: "School Zone Driving", desc: "School areas" },
            { title: "Emergency Evacuation", desc: "Evacuation procedures" },
            { title: "Safe Loading & Unloading", desc: "Boarding procedures" }
        ],
        academyCourses: [
            { title: "Basic Driver Training Course", desc: "40-hour foundation" },
            { title: "Advanced Defensive Driving", desc: "20-hour expert" },
            { title: "Fleet Management Certification", desc: "30-hour course" },
            { title: "Driving Instructor Certification", desc: "Become instructor" },
            { title: "Eco-Driving Techniques", desc: "Fuel efficiency" },
            { title: "Risk Management for Transport", desc: "Advanced safety" }
        ],
        libraryDocs: [
            { title: "Kenya Highway Code (Official)", category: "Official", downloads: "45k+" },
            { title: "NTSA Learner Driver Handbook 2026", category: "Official", downloads: "38k+" },
            { title: "Complete Kenyan Road Signs Reference", category: "Reference", downloads: "28k+" },
            { title: "Defensive Driving Manual - Kenyan Edition", category: "Training", downloads: "22k+" },
            { title: "Emergency First Aid for Motorists", category: "Safety", downloads: "18k+" }
        ],
        questions: []
    };
    
    // Generate 100 questions
    const questionData = [
        { text: "What is the minimum age for a learner driver in Kenya?", options: ["16 years", "17 years", "18 years", "21 years"], correct: 2, category: "Licensing" },
        { text: "What does a red traffic light mean?", options: ["Go", "Slow down", "Stop and wait", "Proceed with caution"], correct: 2, category: "Rules" },
        { text: "What is the shape of a warning sign?", options: ["Circle", "Triangle", "Rectangle", "Square"], correct: 1, category: "Signs" },
        { text: "What is the urban speed limit for cars in Kenya?", options: ["30 km/h", "50 km/h", "70 km/h", "80 km/h"], correct: 1, category: "Speed" },
        { text: "What is the safe following distance in dry conditions?", options: ["1 second", "2 seconds", "3 seconds", "4 seconds"], correct: 1, category: "Safety" }
    ];
    
    for(let i = 0; i < 100; i++) {
        const q = questionData[i % questionData.length];
        content.questions.push({
            id: i + 1,
            text: q.text,
            options: q.options,
            correct: q.correct,
            category: q.category
        });
    }
    
    res.json({ success: true, content });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log(`Admin Panel: http://localhost:${PORT}/admin.html`);
    console.log(`API: http://localhost:${PORT}/api/health`);
});
