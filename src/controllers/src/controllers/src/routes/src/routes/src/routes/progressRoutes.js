const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { supabase } = require('../config/supabase');

// Submit quiz result
router.post('/quiz', authenticateUser, async (req, res) => {
    try {
        const { topicId, score, answers } = req.body;
        const userId = req.user.id;
        
        // Validate
        if (topicId === undefined || score === undefined) {
            return res.status(400).json({ error: 'Topic ID and score are required' });
        }
        
        if (score < 0 || score > 100) {
            return res.status(400).json({ error: 'Score must be between 0 and 100' });
        }
        
        // Save quiz result
        const { data, error } = await supabase
            .from('quiz_results')
            .insert([{
                user_id: userId,
                topic_id: topicId,
                score: score,
                answers: answers || [],
                completed_at: new Date()
            }])
            .select()
            .single();
        
        if (error) throw error;
        
        // Update user progress if score >= 70
        if (score >= 70) {
            const { data: progress } = await supabase
                .from('user_progress')
                .select('topics_completed')
                .eq('user_id', userId)
                .single();
            
            let topicsCompleted = progress?.topics_completed || [];
            if (!topicsCompleted.includes(topicId)) {
                topicsCompleted.push(topicId);
                
                await supabase
                    .from('user_progress')
                    .upsert({
                        user_id: userId,
                        topics_completed: topicsCompleted,
                        total_quiz_score: supabase.raw('total_quiz_score + ?', [score]),
                        quizzes_taken: supabase.raw('quizzes_taken + 1'),
                        updated_at: new Date()
                    });
            }
        }
        
        // Get updated stats
        const { data: allQuizzes } = await supabase
            .from('quiz_results')
            .select('topic_id')
            .eq('user_id', userId);
        
        const completedTopics = [...new Set(allQuizzes?.map(q => q.topic_id) || [])];
        
        res.json({
            success: true,
            message: score >= 70 ? 'Quiz passed! Great job!' : 'Quiz completed. Review and try again.',
            score: score,
            passed: score >= 70,
            topicsCompleted: completedTopics.length,
            totalTopics: 21,
            allCompleted: completedTopics.length >= 21
        });
        
    } catch (error) {
        console.error('Quiz submission error:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
});

// Get user progress
router.get('/', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get progress summary
        const { data: progress } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        // Get all quiz results
        const { data: quizzes } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false });
        
        // Get certificates
        const { data: certificates } = await supabase
            .from('certificates')
            .select('*')
            .eq('user_id', userId)
            .eq('is_valid', true);
        
        // Calculate statistics
        const averageScore = quizzes && quizzes.length > 0
            ? quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length
            : 0;
        
        const uniqueTopics = [...new Set(quizzes?.map(q => q.topic_id) || [])];
        
        res.json({
            success: true,
            progress: {
                topicsCompleted: progress?.topics_completed || [],
                totalTopics: 21,
                percentageComplete: Math.round((uniqueTopics.length / 21) * 100),
                quizzesTaken: progress?.quizzes_taken || 0,
                totalScore: progress?.total_quiz_score || 0,
                averageScore: Math.round(averageScore)
            },
            recentQuizzes: quizzes?.slice(0, 10) || [],
            certificates: certificates || [],
            nextTopics: getNextTopics(uniqueTopics)
        });
        
    } catch (error) {
        console.error('Progress fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// Helper function to get next recommended topics
function getNextTopics(completedTopics) {
    const allTopics = Array.from({ length: 21 }, (_, i) => i);
    const remainingTopics = allTopics.filter(t => !completedTopics.includes(t));
    return remainingTopics.slice(0, 3);
}

module.exports = { router };
