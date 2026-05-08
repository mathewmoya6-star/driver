const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running!' });
});

app.post('/auth/register', (req, res) => {
    res.json({ user: { id: 1, email: req.body.email }, token: 'test' });
});

app.post('/auth/login', (req, res) => {
    res.json({ user: { id: 1, email: req.body.email }, token: 'test' });
});

app.get('/profile/:userId', (req, res) => {
    res.json({ name: '', phone: '' });
});

app.post('/profile', (req, res) => {
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});
