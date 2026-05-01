const express = require('express');
const { query } = require('../utils/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all questions (paginated)
router.get('/', authenticate, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const category = req.query.category;
    const difficulty = req.query.difficulty;

    try {
        let sql = 'SELECT * FROM ntsa_questions WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (category) {
            sql += ` AND category = $${paramIndex++}`;
            params.push(category);
        }
        if (difficulty) {
            sql += ` AND difficulty = $${paramIndex++}`;
            params.push(difficulty);
        }

        sql += ` ORDER BY id LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(limit, offset);

        const result = await query(sql, params);
        const countResult = await query('SELECT COUNT(*) FROM ntsa_questions');
        
        res.json({
            questions: result.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].count),
                totalPages: Math.ceil(countResult.rows[0].count / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Get random questions for quiz
router.get('/random', authenticate, async (req, res) => {
    const count = Math.min(parseInt(req.query.count) || 20, 100);
    
    try {
        const result = await query(
            'SELECT id, question_text, option_a, option_b, option_c, option_d, category, difficulty FROM ntsa_questions ORDER BY RANDOM() LIMIT $1',
            [count]
        );
        res.json({ questions: result.rows, count: result.rows.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch random questions' });
    }
});

// Submit quiz answers
router.post('/submit', authenticate, async (req, res) => {
    const { answers, session_id } = req.body;
    const userId = req.user.id;

    try {
        let score = 0;
        const results = [];

        for (const answer of answers) {
            const questionResult = await query(
                'SELECT correct_answer FROM ntsa_questions WHERE id = $1',
                [answer.question_id]
            );
            
            const isCorrect = questionResult.rows[0]?.correct_answer === answer.selected;
            if (isCorrect) score++;

            // Save progress
            await query(
                `INSERT INTO user_progress (user_id, question_id, is_correct, answer_chosen, time_taken)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (user_id, question_id) 
                 DO UPDATE SET is_correct = $3, answer_chosen = $4, answered_at = NOW()`,
                [userId, answer.question_id, isCorrect, answer.selected, answer.time_taken || null]
            );
            
            results.push({ question_id: answer.question_id, is_correct: isCorrect });
        }

        const percentage = (score / answers.length) * 100;
        
        // Save quiz session
        const sessionResult = await query(
            `UPDATE quiz_sessions 
             SET score = $1, percentage = $2, completed_at = NOW(), status = 'completed'
             WHERE session_token = $3 AND user_id = $4
             RETURNING id`,
            [score, percentage, session_id, userId]
        );

        res.json({
            score,
            total: answers.length,
            percentage,
            results,
            message: percentage >= 70 ? 'Congratulations! You passed!' : 'Keep practicing!'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit answers' });
    }
});

// Get user progress
router.get('/progress', authenticate, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await query(
            `SELECT 
                COUNT(DISTINCT question_id) as total_answered,
                SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
                ROUND(AVG(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100, 2) as accuracy
             FROM user_progress
             WHERE user_id = $1`,
            [userId]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

module.exports = router;
