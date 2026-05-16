const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

// =====================================================
// M-PESA CONFIGURATION
// =====================================================
const axios = require('axios');
const crypto = require('crypto');

// M-Pesa credentials
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE;
const MPESA_ENVIRONMENT = process.env.MPESA_ENVIRONMENT;

let mpesaAccessToken = null;
let tokenExpiry = null;

// Get M-Pesa Access Token
async function getMpesaAccessToken() {
    if (mpesaAccessToken && tokenExpiry > Date.now()) {
        return mpesaAccessToken;
    }

    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    const url = MPESA_ENVIRONMENT === 'production' 
        ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
        : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Basic ${auth}` }
        });
        
        mpesaAccessToken = response.data.access_token;
        tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
        return mpesaAccessToken;
    } catch (error) {
        console.error('Error getting M-Pesa token:', error.response?.data || error.message);
        throw new Error('Failed to get M-Pesa access token');
    }
}

// Generate password for STK push
function generatePassword() {
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
    return { password, timestamp };
}

// STK Push (Lipa Na M-Pesa Online)
async function stkPush(phoneNumber, amount, accountReference, transactionDesc) {
    const token = await getMpesaAccessToken();
    const { password, timestamp } = generatePassword();
    
    // Format phone number (2547XXXXXXXX)
    let formattedPhone = phoneNumber.toString().replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
    }

    const url = MPESA_ENVIRONMENT === 'production'
        ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
        : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const data = {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        return {
            success: true,
            checkoutRequestID: response.data.CheckoutRequestID,
            responseCode: response.data.ResponseCode,
            responseDesc: response.data.ResponseDescription
        };
    } catch (error) {
        console.error('STK Push error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.errorMessage || 'Payment initiation failed'
        };
    }
}

// =====================================================
// API ROUTES
// =====================================================

// Health check
app.get('/', (req, res) => {
    res.json({
        name: 'MEI DRIVE AFRICA API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            mpesa: '/api/mpesa/stkpush',
            courses: '/api/courses',
            webhook: '/api/mpesa/callback'
        }
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Get all courses
app.get('/api/courses', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            data: data,
            count: data.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get single course
app.get('/api/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Initialize M-Pesa payment
app.post('/api/mpesa/stkpush', async (req, res) => {
    try {
        const { phoneNumber, amount, courseId, userId, courseTitle } = req.body;

        // Validation
        if (!phoneNumber || !amount || !courseId || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        if (amount < 1) {
            return res.status(400).json({
                success: false,
                error: 'Amount must be at least 1 KES'
            });
        }

        // Generate unique reference
        const accountReference = `MD${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const transactionDesc = `Payment for ${courseTitle || 'Course'} - MEI DRIVE AFRICA`;

        // Create payment record
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert([{
                user_id: userId,
                course_id: courseId,
                amount: amount,
                payment_method: 'mpesa',
                payment_reference: accountReference,
                status: 'pending',
                metadata: { phoneNumber, courseTitle }
            }])
            .select()
            .single();

        if (paymentError) {
            throw paymentError;
        }

        // Initiate STK push
        const result = await stkPush(phoneNumber, amount, accountReference, transactionDesc);

        if (!result.success) {
            // Update payment status to failed
            await supabase
                .from('payments')
                .update({ status: 'failed' })
                .eq('id', payment.id);
                
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }

        // Update payment with checkout request ID
        await supabase
            .from('payments')
            .update({ 
                payment_reference: result.checkoutRequestID,
                status: 'processing'
            })
            .eq('id', payment.id);

        res.json({
            success: true,
            message: 'STK push sent. Please check your phone for M-Pesa prompt.',
            data: {
                paymentId: payment.id,
                checkoutRequestID: result.checkoutRequestID,
                merchantRequestID: result.merchantRequestID
            }
        });

    } catch (error) {
        console.error('STK Push error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Payment initialization failed'
        });
    }
});

// M-Pesa Callback URL (M-Pesa will call this after payment)
app.post('/api/mpesa/callback', async (req, res) => {
    console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

    try {
        const { Body } = req.body;
        
        if (Body && Body.stkCallback) {
            const {
                ResultCode,
                ResultDesc,
                CheckoutRequestID,
                Amount,
                MpesaReceiptNumber,
                TransactionDate,
                PhoneNumber
            } = Body.stkCallback;

            // Find payment by checkout request ID
            const { data: payment, error: findError } = await supabase
                .from('payments')
                .select('*')
                .eq('payment_reference', CheckoutRequestID)
                .single();

            if (findError) {
                console.error('Payment not found:', CheckoutRequestID);
                return res.json({ ResultCode: 0, ResultDesc: 'Payment not found' });
            }

            if (ResultCode === 0) {
                // Payment successful
                const { error: updateError } = await supabase
                    .from('payments')
                    .update({
                        status: 'completed',
                        mpesa_code: MpesaReceiptNumber,
                        metadata: {
                            ...payment.metadata,
                            transactionDate: TransactionDate,
                            mpesaReceipt: MpesaReceiptNumber,
                            amount: Amount
                        }
                    })
                    .eq('id', payment.id);

                if (!updateError) {
                    // Create enrollment
                    await supabase
                        .from('enrollments')
                        .insert([{
                            user_id: payment.user_id,
                            course_id: payment.course_id,
                            status: 'active',
                            payment_id: payment.id
                        }]);

                    console.log(`Payment successful for user ${payment.user_id}, course ${payment.course_id}`);
                }
            } else {
                // Payment failed
                await supabase
                    .from('payments')
                    .update({
                        status: 'failed',
                        metadata: {
                            ...payment.metadata,
                            errorCode: ResultCode,
                            errorDesc: ResultDesc
                        }
                    })
                    .eq('id', payment.id);

                console.log(`Payment failed: ${ResultDesc}`);
            }
        }

        // Acknowledge receipt to M-Pesa
        res.json({ ResultCode: 0, ResultDesc: 'Success' });

    } catch (error) {
        console.error('Callback error:', error);
        res.json({ ResultCode: 0, ResultDesc: 'Success' });
    }
});

// Check payment status
app.get('/api/payments/status/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;

        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('id', paymentId)
            .single();

        if (error) throw error;

        res.json({
            success: true,
            data: {
                status: data.status,
                mpesaCode: data.mpesa_code,
                amount: data.amount,
                created_at: data.created_at
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create enrollment for free course
app.post('/api/enroll/free', async (req, res) => {
    try {
        const { userId, courseId } = req.body;

        if (!userId || !courseId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Check if already enrolled
        const { data: existing } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Already enrolled in this course'
            });
        }

        // Create enrollment
        const { data, error } = await supabase
            .from('enrollments')
            .insert([{
                user_id: userId,
                course_id: courseId,
                status: 'active'
            }])
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            message: 'Successfully enrolled in course',
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get user enrollments
app.get('/api/enrollments/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('enrollments')
            .select('*, courses(*)')
            .eq('user_id', userId);

        if (error) throw error;

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════════════════════╗
    ║     🚗 MEI DRIVE AFRICA - Backend Server                 ║
    ╠══════════════════════════════════════════════════════════╣
    ║  📍 Port: ${PORT}                                           ║
    ║  🌍 Environment: ${process.env.NODE_ENV || 'development'}     ║
    ║  💳 M-Pesa: ${MPESA_ENVIRONMENT === 'production' ? 'LIVE' : 'SANDBOX'}       ║
    ║  🔗 API: http://localhost:${PORT}                           ║
    ╚══════════════════════════════════════════════════════════╝
    `);
});
