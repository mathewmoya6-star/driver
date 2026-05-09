const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));
app.use(express.json());

// Health check endpoint (required for Render)
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API endpoint to get content (optional)
app.get('/api/content', (req, res) => {
    res.json({
        content: {
            psvModules: [
                { title: "Passenger Safety", desc: "Loading procedures and emergency exits" },
                { title: "Route Compliance", desc: "Licensed PSV routes" }
            ],
            bodaModules: [
                { title: "Helmet Safety", desc: "NTSA approved helmets" },
                { title: "Lane Discipline", desc: "Safe filtering" }
            ],
            schoolModules: [
                { title: "School Bus Safety", desc: "Child safety protocols" }
            ],
            academyCourses: [
                { title: "Defensive Driving", desc: "Advanced techniques" }
            ],
            libraryDocs: [
                { title: "Highway Code", category: "Official", downloads: "4.2k" }
            ]
        }
    });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ MEI DRIVE AFRICA running on port ${PORT}`);
    console.log(`🔗 Supabase URL: https://fktjmkmzlixlapeyhhyl.supabase.co`);
});
