import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'MEI Drive Africa API is running', timestamp: new Date().toISOString() });
});

// ==================== AUTHENTICATION ====================
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) throw error;
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
        
        res.json({
            success: true,
            token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                role: profile?.role || 'learner'
            }
        });
    } catch (error) {
        res.status(401).json({ success: false, error: error.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { email, password, full_name } = req.body;
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name } }
        });
        
        if (error) throw error;
        
        // Create profile
        await supabase.from('profiles').insert({
            id: data.user.id,
            full_name,
            email,
            role: 'learner',
            created_at: new Date().toISOString()
        });
        
        res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ==================== COURSES ====================
app.get('/api/courses', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('id, title, description, type, price, duration, level, unit_number')
            .order('unit_number');
        
        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/courses/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(404).json({ success: false, error: 'Course not found' });
    }
});

// ==================== ENROLLMENTS ====================
app.post('/api/enroll', async (req, res) => {
    const { user_id, course_id, payment_id } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .insert({
                user_id,
                course_id,
                payment_id,
                enrolled_at: new Date().toISOString(),
                progress: 0,
                status: 'active'
            })
            .select();
        
        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/enrollments/:user_id', async (req, res) => {
    const { user_id } = req.params;
    
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
                *,
                courses:course_id (
                    id, title, description, type, price, duration
                )
            `)
            .eq('user_id', user_id);
        
        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== ADMIN ====================
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) throw error;
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
        
        if (profile?.role !== 'admin') {
            await supabase.auth.signOut();
            return res.status(403).json({ success: false, error: 'Not authorized as admin' });
        }
        
        res.json({
            success: true,
            token: data.session.access_token,
            admin: { name: email, email, role: 'admin' }
        });
    } catch (error) {
        res.status(401).json({ success: false, error: error.message });
    }
});

app.get('/api/admin/stats', async (req, res) => {
    try {
        const { count: totalCourses } = await supabase.from('courses').select('*', { count: 'exact', head: true });
        const { count: totalStudents } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { data: payments } = await supabase.from('payments').select('amount');
        
        const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        
        res.json({
            success: true,
            stats: {
                totalCourses: totalCourses || 0,
                totalStudents: totalStudents || 0,
                totalRevenue,
                completionRate: 78
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== M-PESA PAYMENT ====================
app.post('/api/mpesa/stkpush', async (req, res) => {
    const { phoneNumber, amount, courseId, userId, courseTitle } = req.body;
    
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
    
    const requestBody = {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.VERCEL_URL || 'https://meidriveafrica.vercel.app'}/api/mpesa/callback`,
        AccountReference: `COURSE-${courseId}`,
        TransactionDesc: `Payment for ${courseTitle}`
    };
    
    try {
        const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
        
        const tokenRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            method: 'GET',
            headers: { Authorization: `Basic ${auth}` }
        });
        
        const { access_token } = await tokenRes.json();
        
        const stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        const data = await stkRes.json();
        
        // Save payment record
        await supabase.from('payments').insert({
            user_id: userId,
            course_id: courseId,
            amount,
            mpesa_receipt: data.CheckoutRequestID,
            status: 'pending',
            created_at: new Date().toISOString()
        });
        
        res.json({ success: true, data: { paymentId: data.CheckoutRequestID } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/mpesa/callback', async (req, res) => {
    const { Body } = req.body;
    
    if (Body?.stkCallback?.ResultCode === 0) {
        const { CheckoutRequestID, Amount, MpesaReceiptNumber } = Body.stkCallback;
        
        await supabase
            .from('payments')
            .update({
                status: 'completed',
                mpesa_receipt: MpesaReceiptNumber,
                updated_at: new Date().toISOString()
            })
            .eq('mpesa_receipt', CheckoutRequestID);
    }
    
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
});

// ==================== USER PROFILE ====================
app.get('/api/profile/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(404).json({ success: false, error: 'Profile not found' });
    }
});

app.put('/api/profile/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select();
        
        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== PROGRESS TRACKING ====================
app.post('/api/progress', async (req, res) => {
    const { enrollment_id, progress, completed_lessons } = req.body;
    
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .update({ progress, completed_lessons, updated_at: new Date().toISOString() })
            .eq('id', enrollment_id)
            .select();
        
        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== CERTIFICATES ====================
app.post('/api/certificate/generate', async (req, res) => {
    const { enrollment_id, user_id, course_id } = req.body;
    const certificateId = `MEI-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    try {
        const { data, error } = await supabase
            .from('certificates')
            .insert({
                enrollment_id,
                user_id,
                course_id,
                certificate_id: certificateId,
                issued_at: new Date().toISOString()
            })
            .select();
        
        if (error) throw error;
        res.json({ success: true, data: { certificate_id: certificateId } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ MEI Drive Africa API running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/api/health`);
});

export default app;
