// ============================================
// SUPABASE CLIENT CONFIGURATION
// MEI DRIVE AFRICA - NTSA Driver Training Platform
// ============================================

// Supabase credentials (from your project)
const SUPABASE_URL = 'https://jeksrwrzzrczamxijvwl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impla3Nyd3J6enJjemFteGlqdndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzYyMjAsImV4cCI6MjA5NDI1MjIyMH0.1poYpJKNFEVe2NTBkXBTH2bIHGk2yT8aqCU-OlJc4vs';

// ============================================
// SUPABASE CLIENT INITIALIZATION
// ============================================
let supabaseClient = null;

async function initSupabase() {
    if (typeof supabase === 'undefined') {
        await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient;
}

// ============================================
// AUTHENTICATION SERVICES
// ============================================
const AuthService = {
    // Get current session
    async getSession() {
        const client = await initSupabase();
        const { data: { session }, error } = await client.auth.getSession();
        if (error) throw error;
        return session;
    },
    
    // Get current user
    async getCurrentUser() {
        const session = await this.getSession();
        return session?.user || null;
    },
    
    // Sign up new user
    async signUp(email, password, fullName, phone = null) {
        const client = await initSupabase();
        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                    role: 'user'
                }
            }
        });
        if (error) throw error;
        
        // Create user profile
        if (data.user) {
            await this.createUserProfile(data.user.id, email, fullName, phone);
        }
        return data;
    },
    
    // Sign in user
    async signIn(email, password) {
        const client = await initSupabase();
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },
    
    // Sign out
    async signOut() {
        const client = await initSupabase();
        const { error } = await client.auth.signOut();
        if (error) throw error;
    },
    
    // Reset password
    async resetPassword(email) {
        const client = await initSupabase();
        const { error } = await client.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`
        });
        if (error) throw error;
        return true;
    },
    
    // Update password
    async updatePassword(newPassword) {
        const client = await initSupabase();
        const { error } = await client.auth.updateUser({ password: newPassword });
        if (error) throw error;
        return true;
    },
    
    // Create user profile
    async createUserProfile(userId, email, fullName, phone = null) {
        const client = await initSupabase();
        const { error } = await client.from('user_profiles').insert({
            id: userId,
            email: email,
            full_name: fullName,
            phone: phone,
            is_admin: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
        return true;
    },
    
    // Check if user is admin
    async isAdmin(userId = null) {
        const client = await initSupabase();
        const uid = userId || (await this.getCurrentUser())?.id;
        if (!uid) return false;
        
        try {
            // Try RPC first
            const { data: rpcResult, error: rpcError } = await client.rpc('is_admin_user', { user_id: uid });
            if (!rpcError && rpcResult !== undefined) return rpcResult;
            
            // Fallback to profile query
            const { data: profile, error } = await client
                .from('user_profiles')
                .select('is_admin')
                .eq('id', uid)
                .single();
            
            if (error) throw error;
            return profile?.is_admin === true;
        } catch (err) {
            console.error('Admin check error:', err);
            return false;
        }
    },
    
    // Subscribe to auth changes
    onAuthStateChange(callback) {
        const client = supabaseClient;
        if (!client) {
            initSupabase().then(c => {
                c.auth.onAuthStateChange(callback);
            });
        } else {
            client.auth.onAuthStateChange(callback);
        }
    }
};

// ============================================
// COURSE SERVICES
// ============================================
const CourseService = {
    // Get all courses
    async getAllCourses() {
        const client = await initSupabase();
        const { data, error } = await client
            .from('courses')
            .select('*')
            .order('id', { ascending: true });
        if (error) throw error;
        return data || [];
    },
    
    // Get course by ID
    async getCourseById(courseId) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();
        if (error) throw error;
        return data;
    },
    
    // Get course by type
    async getCourseByType(type) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('courses')
            .select('*')
            .eq('type', type)
            .single();
        if (error) throw error;
        return data;
    },
    
    // Create new course (admin only)
    async createCourse(courseData) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('courses')
            .insert({
                ...courseData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    // Update course (admin only)
    async updateCourse(courseId, updates) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('courses')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', courseId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    // Delete course (admin only)
    async deleteCourse(courseId) {
        const client = await initSupabase();
        const { error } = await client
            .from('courses')
            .delete()
            .eq('id', courseId);
        if (error) throw error;
        return true;
    },
    
    // Get lessons for a course
    async getCourseLessons(courseId) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('order', { ascending: true });
        if (error) throw error;
        return data || [];
    },
    
    // Get single lesson
    async getLesson(lessonId) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .single();
        if (error) throw error;
        return data;
    },
    
    // Create lesson (admin only)
    async createLesson(lessonData) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('lessons')
            .insert({
                ...lessonData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    // Update lesson (admin only)
    async updateLesson(lessonId, updates) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('lessons')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', lessonId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    // Delete lesson (admin only)
    async deleteLesson(lessonId) {
        const client = await initSupabase();
        const { error } = await client
            .from('lessons')
            .delete()
            .eq('id', lessonId);
        if (error) throw error;
        return true;
    }
};

// ============================================
// ENROLLMENT & PROGRESS SERVICES
// ============================================
const EnrollmentService = {
    // Enroll user in course
    async enrollUser(userId, courseId, amount = 0) {
        const client = await initSupabase();
        
        // Check if already enrolled
        const { data: existing } = await client
            .from('enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .maybeSingle();
        
        if (existing) {
            return { alreadyEnrolled: true, enrollment: existing };
        }
        
        const { data, error } = await client
            .from('enrollments')
            .insert({
                user_id: userId,
                course_id: courseId,
                amount_paid: amount,
                payment_status: amount === 0 ? 'verified' : 'pending',
                enrolled_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) throw error;
        return { enrollment: data, alreadyEnrolled: false };
    },
    
    // Verify payment (admin only)
    async verifyPayment(enrollmentId) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('enrollments')
            .update({
                payment_status: 'verified',
                updated_at: new Date().toISOString()
            })
            .eq('id', enrollmentId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    // Get user enrollments
    async getUserEnrollments(userId) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('enrollments')
            .select('*, courses(*)')
            .eq('user_id', userId)
            .eq('payment_status', 'verified')
            .order('enrolled_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },
    
    // Check if user is enrolled in course
    async isEnrolled(userId, courseId) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .eq('payment_status', 'verified')
            .maybeSingle();
        if (error) throw error;
        return !!data;
    },
    
    // Update lesson progress
    async updateProgress(userId, courseId, lessonId, progressPercent) {
        const client = await initSupabase();
        
        // Get or create progress record
        const { data: existing } = await client
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .maybeSingle();
        
        if (existing) {
            const { data, error } = await client
                .from('user_progress')
                .update({
                    progress_percentage: progressPercent,
                    last_lesson_id: lessonId,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await client
                .from('user_progress')
                .insert({
                    user_id: userId,
                    course_id: courseId,
                    progress_percentage: progressPercent,
                    last_lesson_id: lessonId,
                    started_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    },
    
    // Get user progress for a course
    async getCourseProgress(userId, courseId) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .maybeSingle();
        if (error) throw error;
        return data || { progress_percentage: 0 };
    },
    
    // Get all user progress
    async getAllUserProgress(userId) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('user_progress')
            .select('*, courses(name)')
            .eq('user_id', userId);
        if (error) throw error;
        return data || [];
    },
    
    // Get user statistics
    async getUserStats(userId) {
        const client = await initSupabase();
        
        const [progress, enrollments, quizzes] = await Promise.all([
            client.from('user_progress').select('progress_percentage').eq('user_id', userId),
            client.from('enrollments').select('id').eq('user_id', userId).eq('payment_status', 'verified'),
            client.from('quiz_attempts').select('score').eq('user_id', userId).order('id', { ascending: false }).limit(1)
        ]);
        
        const totalProgress = progress.data?.length 
            ? Math.round(progress.data.reduce((a, p) => a + (p.progress_percentage || 0), 0) / progress.data.length)
            : 0;
        
        return {
            totalProgress,
            completedCourses: enrollments.data?.length || 0,
            bestQuizScore: quizzes.data?.[0]?.score || 0,
            enrolledCoursesCount: enrollments.data?.length || 0
        };
    }
};

// ============================================
// QUIZ SERVICES
// ============================================
const QuizService = {
    // Get random questions
    async getRandomQuestions(category = null, limit = 20) {
        const client = await initSupabase();
        let query = client.from('questions').select('*');
        
        if (category && category !== 'All') {
            query = query.eq('category', category);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        if (!data || data.length === 0) return [];
        
        // Shuffle and limit
        const shuffled = [...data];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled.slice(0, limit);
    },
    
    // Get all question categories
    async getCategories() {
        const client = await initSupabase();
        const { data, error } = await client
            .from('questions')
            .select('category')
            .not('category', 'is', null);
        
        if (error) throw error;
        
        const categories = [...new Set(data.map(q => q.category).filter(Boolean))];
        return ['All', ...categories];
    },
    
    // Save quiz attempt
    async saveQuizAttempt(userId, score, totalQuestions, category = null) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('quiz_attempts')
            .insert({
                user_id: userId,
                score: Math.round((score / totalQuestions) * 100),
                total_questions: totalQuestions,
                category: category,
                completed_at: new Date().toISOString()
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    // Get user quiz history
    async getUserQuizHistory(userId, limit = 10) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('quiz_attempts')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(limit);
        if (error) throw error;
        return data || [];
    },
    
    // Get user best score
    async getUserBestScore(userId) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('quiz_attempts')
            .select('score')
            .eq('user_id', userId)
            .order('score', { ascending: false })
            .limit(1);
        if (error) throw error;
        return data?.[0]?.score || 0;
    },
    
    // Admin: Create question
    async createQuestion(questionData) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('questions')
            .insert({
                ...questionData,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    // Admin: Update question
    async updateQuestion(questionId, updates) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('questions')
            .update(updates)
            .eq('id', questionId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    // Admin: Delete question
    async deleteQuestion(questionId) {
        const client = await initSupabase();
        const { error } = await client
            .from('questions')
            .delete()
            .eq('id', questionId);
        if (error) throw error;
        return true;
    },
    
    // Admin: Get all questions (paginated)
    async getAllQuestions(page = 1, limit = 50) {
        const client = await initSupabase();
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        
        const { data, error, count } = await client
            .from('questions')
            .select('*', { count: 'exact' })
            .order('id')
            .range(from, to);
        
        if (error) throw error;
        return { data: data || [], total: count || 0, page, limit };
    }
};

// ============================================
// LIBRARY SERVICES
// ============================================
const LibraryService = {
    // Get all resources
    async getAllResources() {
        const client = await initSupabase();
        const { data, error } = await client
            .from('library_resources')
            .select('*')
            .order('id');
        if (error) throw error;
        return data || [];
    },
    
    // Get resource by ID
    async getResourceById(id) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('library_resources')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },
    
    // Search resources
    async searchResources(query) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('library_resources')
            .select('*')
            .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);
        if (error) throw error;
        return data || [];
    },
    
    // Get resources by category
    async getResourcesByCategory(category) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('library_resources')
            .select('*')
            .eq('category', category);
        if (error) throw error;
        return data || [];
    },
    
    // Admin: Create resource
    async createResource(resourceData) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('library_resources')
            .insert({
                ...resourceData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    // Admin: Update resource
    async updateResource(id, updates) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('library_resources')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    // Admin: Delete resource
    async deleteResource(id) {
        const client = await initSupabase();
        const { error } = await client
            .from('library_resources')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    }
};

// ============================================
// ADMIN SERVICES
// ============================================
const AdminService = {
    // Get all users (admin only)
    async getAllUsers(page = 1, limit = 50) {
        const client = await initSupabase();
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        
        const { data, error, count } = await client
            .from('user_profiles')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);
        
        if (error) throw error;
        return { data: data || [], total: count || 0, page, limit };
    },
    
    // Get user by ID
    async getUserById(userId) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data;
    },
    
    // Update user role
    async updateUserRole(userId, isAdmin) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('user_profiles')
            .update({ is_admin: isAdmin, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    // Delete user (admin only)
    async deleteUser(userId) {
        const client = await initSupabase();
        
        // Delete related records first
        await client.from('enrollments').delete().eq('user_id', userId);
        await client.from('user_progress').delete().eq('user_id', userId);
        await client.from('quiz_attempts').delete().eq('user_id', userId);
        
        // Delete profile
        const { error } = await client
            .from('user_profiles')
            .delete()
            .eq('id', userId);
        
        if (error) throw error;
        
        // Delete auth user (requires admin rights)
        const { error: authError } = await client.auth.admin.deleteUser(userId);
        if (authError) console.warn('Auth user deletion failed:', authError);
        
        return true;
    },
    
    // Get dashboard stats
    async getDashboardStats() {
        const client = await initSupabase();
        
        const [
            usersCount,
            coursesCount,
            enrollmentsCount,
            revenue,
            quizAvg
        ] = await Promise.all([
            client.from('user_profiles').select('id', { count: 'exact', head: true }),
            client.from('courses').select('id', { count: 'exact', head: true }),
            client.from('enrollments').select('id', { count: 'exact', head: true }).eq('payment_status', 'verified'),
            client.from('enrollments').select('amount_paid').eq('payment_status', 'verified'),
            client.from('quiz_attempts').select('score')
        ]);
        
        const totalRevenue = revenue.data?.reduce((sum, r) => sum + (r.amount_paid || 0), 0) || 0;
        const avgQuizScore = quizAvg.data?.length 
            ? Math.round(quizAvg.data.reduce((a, q) => a + q.score, 0) / quizAvg.data.length)
            : 0;
        
        return {
            totalUsers: usersCount.count || 0,
            totalCourses: coursesCount.count || 0,
            totalEnrollments: enrollmentsCount.count || 0,
            totalRevenue: totalRevenue,
            averageQuizScore: avgQuizScore
        };
    },
    
    // Get all enrollments with details
    async getAllEnrollments(limit = 100) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('enrollments')
            .select('*, user_profiles(full_name, email), courses(name, type)')
            .order('enrolled_at', { ascending: false })
            .limit(limit);
        if (error) throw error;
        return data || [];
    },
    
    // Get revenue analytics
    async getRevenueAnalytics(period = 'month') {
        const client = await initSupabase();
        const { data, error } = await client
            .from('enrollments')
            .select('amount_paid, enrolled_at')
            .eq('payment_status', 'verified');
        
        if (error) throw error;
        
        // Group by date
        const grouped = {};
        data?.forEach(item => {
            const date = new Date(item.enrolled_at);
            let key;
            if (period === 'day') key = date.toISOString().split('T')[0];
            else if (period === 'week') key = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
            else key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            
            grouped[key] = (grouped[key] || 0) + (item.amount_paid || 0);
        });
        
        return grouped;
    }
};

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================
class RealtimeSubscription {
    constructor() {
        this.subscriptions = new Map();
    }
    
    async subscribeTo(table, filter, callback) {
        const client = await initSupabase();
        const channel = client.channel(`${table}-changes`);
        
        channel.on('postgres_changes', 
            { event: '*', schema: 'public', table: table, filter: filter },
            (payload) => callback(payload)
        ).subscribe();
        
        const key = `${table}-${Date.now()}`;
        this.subscriptions.set(key, channel);
        return key;
    }
    
    unsubscribe(key) {
        const channel = this.subscriptions.get(key);
        if (channel) {
            channel.unsubscribe();
            this.subscriptions.delete(key);
        }
    }
    
    unsubscribeAll() {
        this.subscriptions.forEach((channel) => channel.unsubscribe());
        this.subscriptions.clear();
    }
}

// ============================================
// CERTIFICATE SERVICE
// ============================================
const CertificateService = {
    async generateCertificate(userId, courseId) {
        const client = await initSupabase();
        
        // Verify completion
        const { data: progress } = await client
            .from('user_progress')
            .select('progress_percentage')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();
        
        if (!progress || progress.progress_percentage < 100) {
            throw new Error('Course not completed. Progress must be 100%');
        }
        
        // Get user and course details
        const [user, course] = await Promise.all([
            client.from('user_profiles').select('*').eq('id', userId).single(),
            client.from('courses').select('*').eq('id', courseId).single()
        ]);
        
        // Record certificate issuance
        const { data: cert, error } = await client
            .from('certificates')
            .insert({
                user_id: userId,
                course_id: courseId,
                certificate_number: `MEI-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                issued_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single();
        
        if (error) throw error;
        
        return {
            certificate: cert,
            user: user.data,
            course: course.data
        };
    },
    
    async verifyCertificate(certificateNumber) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('certificates')
            .select('*, user_profiles(full_name), courses(name)')
            .eq('certificate_number', certificateNumber)
            .single();
        
        if (error) throw error;
        return data;
    },
    
    async getUserCertificates(userId) {
        const client = await initSupabase();
        const { data, error } = await client
            .from('certificates')
            .select('*, courses(name)')
            .eq('user_id', userId)
            .order('issued_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    }
};

// ============================================
// EXPORT ALL SERVICES
// ============================================
window.MEIDriveAPI = {
    init: initSupabase,
    auth: AuthService,
    courses: CourseService,
    enrollment: EnrollmentService,
    quiz: QuizService,
    library: LibraryService,
    admin: AdminService,
    realtime: new RealtimeSubscription(),
    certificate: CertificateService,
    
    // Utility function to check connection
    async healthCheck() {
        try {
            const client = await initSupabase();
            const { data, error } = await client.from('courses').select('id').limit(1);
            return !error;
        } catch {
            return false;
        }
    }
};

// Auto-initialize on load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.MEIDriveAPI.init().catch(console.error);
    });
}
