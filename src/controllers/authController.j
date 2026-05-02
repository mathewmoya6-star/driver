const { supabase, supabaseAdmin } = require('../config/supabase');

// ============================================
// COMPLETE AUTHENTICATION SYSTEM
// ============================================

// Register new user with validation
const register = async (req, res) => {
    try {
        const { email, password, fullName, phone, ntsaId } = req.body;

        // Comprehensive validation
        const errors = [];
        if (!email) errors.push('Email is required');
        if (!password) errors.push('Password is required');
        if (!fullName) errors.push('Full name is required');
        if (password && password.length < 6) errors.push('Password must be at least 6 characters');
        if (email && !email.includes('@')) errors.push('Invalid email format');
        
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Check if user already exists in database
        const { data: existingUser } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(409).json({ error: 'User already exists with this email' });
        }

        // Register with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone || null,
                    role: 'user'
                }
            }
        });

        if (authError) {
            console.error('Auth error:', authError);
            return res.status(400).json({ error: authError.message });
        }

        // Create user profile in database
        const { data: userData, error: dbError } = await supabase
            .from('users')
            .insert([{
                auth_id: authData.user.id,
                email: email.toLowerCase(),
                full_name: fullName,
                phone: phone || null,
                ntsa_id: ntsaId || null,
                role: 'user',
                subscription_plan: 'free',
                subscription_start: new Date().toISOString().split('T')[0],
                subscription_end: null,
                auto_renew: false,
                created_at: new Date(),
                last_login: new Date()
            }])
            .select()
            .single();

        if (dbError) {
            // Rollback - delete auth user if profile creation fails
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            console.error('DB error:', dbError);
            return res.status(500).json({ error: 'Failed to create user profile' });
        }

        // Create initial progress record
        await supabase
            .from('user_progress')
            .insert([{
                user_id: userData.id,
                topics_completed: [],
                total_quiz_score: 0,
                quizzes_taken: 0,
                created_at: new Date(),
                updated_at: new Date()
            }]);

        // Create course progress entries for all course types
        const courseTypes = ['learner', 'psv', 'boda', 'school', 'academy'];
        for (const courseType of courseTypes) {
            await supabase
                .from('course_progress')
                .insert([{
                    user_id: userData.id,
                    course_type: courseType,
                    current_topic: 0,
                    completed_topics: [],
                    certificate_issued: false,
                    last_accessed: new Date()
                }]);
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please verify your email.',
            user: {
                id: userData.id,
                email: userData.email,
                fullName: userData.full_name,
                phone: userData.phone,
                role: userData.role,
                subscription: userData.subscription_plan
            },
            session: authData.session
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
};

// Login user with session management
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase(),
            password
        });

        if (authError) {
            console.error('Auth login error:', authError);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Get user from database
        let { data: userData, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', authData.user.id)
            .single();

        // If user not found in DB but exists in auth, create profile
        if (dbError || !userData) {
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([{
                    auth_id: authData.user.id,
                    email: authData.user.email,
                    full_name: authData.user.user_metadata?.full_name || authData.user.email,
                    role: 'user',
                    subscription_plan: 'free',
                    created_at: new Date(),
                    last_login: new Date()
                }])
                .select()
                .single();

            if (createError) {
                return res.status(500).json({ error: 'Failed to sync user profile' });
            }
            userData = newUser;
        }

        // Update last login timestamp
        await supabase
            .from('users')
            .update({ last_login: new Date() })
            .eq('id', userData.id);

        // Get user progress
        const { data: progress } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userData.id)
            .single();

        // Get certificates
        const { data: certificates } = await supabase
            .from('certificates')
            .select('*')
            .eq('user_id', userData.id)
            .eq('is_valid', true);

        // Get recent valuations
        const { data: recentValuations } = await supabase
            .from('valuations')
            .select('*')
            .eq('user_id', userData.id)
            .order('created_at', { ascending: false })
            .limit(5);

        res.json({
            success: true,
            message: 'Login successful!',
            user: {
                id: userData.id,
                email: userData.email,
                fullName: userData.full_name,
                phone: userData.phone,
                ntsaId: userData.ntsa_id,
                role: userData.role,
                subscription: {
                    plan: userData.subscription_plan,
                    startDate: userData.subscription_start,
                    endDate: userData.subscription_end,
                    autoRenew: userData.auto_renew
                },
                progress: {
                    topicsCompleted: progress?.topics_completed || [],
                    totalScore: progress?.total_quiz_score || 0,
                    quizzesTaken: progress?.quizzes_taken || 0
                },
                certificates: certificates || [],
                recentValuations: recentValuations || []
            },
            session: {
                access_token: authData.session.access_token,
                refresh_token: authData.session.refresh_token,
                expires_at: authData.session.expires_at
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
};

// Get current authenticated user with full profile
const getCurrentUser = async (req, res) => {
    try {
        const user = req.user;
        
        // Get progress
        const { data: progress } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // Get certificates
        const { data: certificates } = await supabase
            .from('certificates')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_valid', true)
            .order('issue_date', { ascending: false });

        // Get course progress
        const { data: courseProgress } = await supabase
            .from('course_progress')
            .select('*')
            .eq('user_id', user.id);

        // Get quiz stats
        const { data: quizStats } = await supabase
            .from('quiz_results')
            .select('topic_id, score')
            .eq('user_id', user.id);

        const averageScore = quizStats && quizStats.length > 0 
            ? quizStats.reduce((sum, q) => sum + q.score, 0) / quizStats.length 
            : 0;

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                phone: user.phone,
                ntsaId: user.ntsa_id,
                role: user.role,
                subscription: {
                    plan: user.subscription_plan,
                    startDate: user.subscription_start,
                    endDate: user.subscription_end
                },
                stats: {
                    topicsCompleted: progress?.topics_completed?.length || 0,
                    totalTopics: 21,
                    quizzesTaken: progress?.quizzes_taken || 0,
                    averageScore: Math.round(averageScore),
                    certificatesIssued: certificates?.length || 0
                },
                progress: {
                    topicsCompleted: progress?.topics_completed || [],
                    quizScores: quizStats || []
                },
                certificates: certificates || [],
                courseProgress: courseProgress || []
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { fullName, phone, ntsaId } = req.body;
        const userId = req.user.id;

        const updates = {};
        if (fullName) updates.full_name = fullName;
        if (phone) updates.phone = phone;
        if (ntsaId) updates.ntsa_id = ntsaId;

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: data
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both current and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        // Update password via Supabase Auth
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};

// Reset password (send reset email)
const resetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL}/reset-password`
        });

        if (error) throw error;

        res.json({
            success: true,
            message: 'Password reset email sent. Check your inbox.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to send reset email' });
    }
};

// Logout
const logout = async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
};

// Delete account
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const authId = req.user.auth_id;

        // Delete user from database (cascade will handle related records)
        const { error: dbError } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (dbError) throw dbError;

        // Delete from Supabase Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(authId);
        
        if (authError) console.error('Auth delete error:', authError);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};

module.exports = { 
    register, 
    login, 
    getCurrentUser, 
    updateProfile,
    changePassword,
    resetPassword,
    logout, 
    deleteAccount 
};
