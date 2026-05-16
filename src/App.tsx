import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase } from './services/supabase';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://meidriveafrica-backend.onrender.com';

// ============================================
// MAIN APP COMPONENT
// ============================================
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/course/:id" element={<CourseDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin-login" element={<AdminLogin />} />
            </Routes>
        </Router>
    );
}

// ============================================
// HOME PAGE
// ============================================
function Home() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadCourses();
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
    }

    async function loadCourses() {
        try {
            const response = await fetch(`${API_URL}/api/courses`);
            const data = await response.json();
            if (data.success) {
                setCourses(data.data.slice(0, 3));
            }
        } catch (error) {
            console.error('Error loading courses:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="app">
            <Navbar user={user} />
            
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1>Practice Daily.<br /><span>Revise Smarter. Pass with Confidence.</span></h1>
                        <p>For Learners and Experienced Drivers — Refresh Your Skills with MEI DRIVE AFRICA. NTSA-approved courses.</p>
                        <div className="hero-buttons">
                            <Link to="/courses" className="btn btn-primary">
                                Explore Courses
                            </Link>
                            {!user && (
                                <Link to="/login" className="btn btn-outline">
                                    Get Started
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div className="stats-bar">
                <div className="stat-item"><h3>10K+</h3><p>Students</p></div>
                <div className="stat-item"><h3>6</h3><p>Courses</p></div>
                <div className="stat-item"><h3>98%</h3><p>Pass Rate</p></div>
            </div>

            <div className="container section">
                <h2 className="section-title">Our <span>Courses</span></h2>
                {loading ? (
                    <div className="loading-spinner"></div>
                ) : (
                    <div className="grid">
                        {courses.map(course => (
                            <CourseCard key={course.id} course={course} user={user} />
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

// ============================================
// COURSES PAGE
// ============================================
function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadCourses();
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
    }

    async function loadCourses() {
        try {
            const response = await fetch(`${API_URL}/api/courses`);
            const data = await response.json();
            if (data.success) {
                setCourses(data.data);
            }
        } catch (error) {
            console.error('Error loading courses:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Navbar user={user} />
            <div className="container" style={{ paddingTop: '100px' }}>
                <h2 className="section-title">All <span>Courses</span></h2>
                {loading ? (
                    <div className="loading-spinner"></div>
                ) : (
                    <div className="grid">
                        {courses.map(course => (
                            <CourseCard key={course.id} course={course} user={user} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

// ============================================
// COURSE DETAIL PAGE
// ============================================
function CourseDetail() {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    const courseId = window.location.pathname.split('/').pop();

    useEffect(() => {
        loadCourse();
        checkUser();
        checkEnrollment();
    }, []);

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
    }

    async function loadCourse() {
        try {
            const response = await fetch(`${API_URL}/api/courses/${courseId}`);
            const data = await response.json();
            if (data.success) {
                setCourse(data.data);
            }
        } catch (error) {
            console.error('Error loading course:', error);
        } finally {
            setLoading(false);
        }
    }

    async function checkEnrollment() {
        if (!user) return;
        try {
            const response = await fetch(`${API_URL}/api/enrollments/${user.id}`);
            const data = await response.json();
            if (data.success) {
                const enrolled = data.data.some(e => e.course_id === courseId);
                setIsEnrolled(enrolled);
            }
        } catch (error) {
            console.error('Error checking enrollment:', error);
        }
    }

    async function handleFreeEnroll() {
        if (!user) {
            navigate('/login');
            return;
        }

        setProcessing(true);
        try {
            const response = await fetch(`${API_URL}/api/enroll/free`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    courseId: courseId
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('Successfully enrolled in course!');
                setIsEnrolled(true);
            } else {
                alert(data.error || 'Enrollment failed');
            }
        } catch (error) {
            alert('Error enrolling in course');
        } finally {
            setProcessing(false);
        }
    }

    async function handleMpesaPayment() {
        if (!phoneNumber) {
            alert('Please enter your phone number');
            return;
        }

        setProcessing(true);
        try {
            const response = await fetch(`${API_URL}/api/mpesa/stkpush`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: phoneNumber,
                    amount: course.price,
                    courseId: course.id,
                    userId: user.id,
                    courseTitle: course.title
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('STK Push sent! Please check your phone and enter PIN.');
                setShowPayment(false);
                
                pollPaymentStatus(data.data.paymentId);
            } else {
                alert(data.error || 'Payment initiation failed');
            }
        } catch (error) {
            alert('Error initiating payment');
        } finally {
            setProcessing(false);
        }
    }

    async function pollPaymentStatus(paymentId) {
        let attempts = 0;
        const interval = setInterval(async () => {
            attempts++;
            try {
                const response = await fetch(`${API_URL}/api/payments/status/${paymentId}`);
                const data = await response.json();
                
                if (data.success && data.data.status === 'completed') {
                    clearInterval(interval);
                    alert('Payment successful! You are now enrolled.');
                    setIsEnrolled(true);
                } else if (attempts > 30) {
                    clearInterval(interval);
                    alert('Payment confirmation timeout. Please check your email for status.');
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
            }
        }, 3000);
    }

    if (loading) return <div className="loading-spinner"></div>;
    if (!course) return <div>Course not found</div>;

    return (
        <div>
            <Navbar user={user} />
            <div className="container" style={{ paddingTop: '100px' }}>
                <div className="course-detail-card">
                    <h1>{course.title}</h1>
                    <p className="course-description">{course.description}</p>
                    
                    <div className="course-info">
                        <div className="info-item">
                            <span>Duration: {course.duration || '4 weeks'}</span>
                        </div>
                        <div className="info-item">
                            <span>Level: {course.level || 'Beginner'}</span>
                        </div>
                        <div className="info-item">
                            <span className={course.type === 'free' ? 'price-free' : 'price-premium'}>
                                {course.type === 'free' ? 'FREE' : `KES ${course.price?.toLocaleString()}`}
                            </span>
                        </div>
                    </div>

                    {isEnrolled ? (
                        <div className="enrolled-badge">
                            You are enrolled in this course!
                        </div>
                    ) : (
                        <div className="enrollment-section">
                            {course.type === 'free' ? (
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleFreeEnroll}
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Enroll for Free'}
                                </button>
                            ) : (
                                <div>
                                    {!showPayment ? (
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => setShowPayment(true)}
                                        >
                                            Pay KES {course.price?.toLocaleString()} via M-Pesa
                                        </button>
                                    ) : (
                                        <div className="payment-form">
                                            <h3>M-Pesa Payment</h3>
                                            <input
                                                type="tel"
                                                placeholder="Enter M-Pesa phone number (e.g., 0712345678)"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                            />
                                            <div className="payment-buttons">
                                                <button 
                                                    className="btn btn-primary"
                                                    onClick={handleMpesaPayment}
                                                    disabled={processing}
                                                >
                                                    {processing ? 'Processing...' : 'Pay Now'}
                                                </button>
                                                <button 
                                                    className="btn btn-outline"
                                                    onClick={() => setShowPayment(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

// ============================================
// LOGIN PAGE
// ============================================
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            alert(error.message);
        } else {
            navigate('/dashboard');
        }
        setLoading(false);
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}

// ============================================
// REGISTER PAGE
// ============================================
function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
        });
        
        if (error) {
            alert(error.message);
        } else {
            alert('Account created! Please check your email for verification.');
            navigate('/login');
        }
        setLoading(false);
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>
                <p className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

// ============================================
// DASHBOARD PAGE
// ============================================
function Dashboard() {
    const [user, setUser] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login');
            return;
        }
        setUser(session.user);
        await loadEnrollments(session.user.id);
    }

    async function loadEnrollments(userId) {
        try {
            const response = await fetch(`${API_URL}/api/enrollments/${userId}`);
            const data = await response.json();
            if (data.success) {
                setEnrollments(data.data);
            }
        } catch (error) {
            console.error('Error loading enrollments:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        navigate('/');
    }

    return (
        <div>
            <Navbar user={user} onLogout={handleLogout} />
            <div className="container" style={{ paddingTop: '100px' }}>
                <h2 className="section-title">My <span>Dashboard</span></h2>
                
                <div className="dashboard-stats">
                    <div className="stat-card">
                        <h3>{enrollments.length}</h3>
                        <p>Enrolled Courses</p>
                    </div>
                    <div className="stat-card">
                        <h3>{enrollments.filter(e => e.progress === 100).length}</h3>
                        <p>Completed</p>
                    </div>
                </div>

                <h3>My Courses</h3>
                {loading ? (
                    <div className="loading-spinner"></div>
                ) : enrollments.length === 0 ? (
                    <div className="empty-state">
                        <p>You haven't enrolled in any courses yet.</p>
                        <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
                    </div>
                ) : (
                    <div className="grid">
                        {enrollments.map(enrollment => (
                            <div key={enrollment.id} className="course-card">
                                <h3>{enrollment.courses?.title || 'Course'}</h3>
                                <div className="progress-bar">
                                    <div className="progress" style={{ width: `${enrollment.progress || 0}%` }}></div>
                                </div>
                                <p>Progress: {enrollment.progress || 0}%</p>
                                <Link to={`/course/${enrollment.course_id}`} className="btn btn-primary">
                                    Continue Learning
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

// ============================================
// ADMIN LOGIN PAGE (NEW - WORKING VERSION)
// ============================================
function AdminLogin() {
    const [email, setEmail] = useState('admin@meidrive.com');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // First try to authenticate with Supabase
            const { data, error: authError } = await supabase.auth.signInWithPassword({ 
                email, 
                password 
            });

            if (authError) {
                setError('Invalid credentials');
                setLoading(false);
                return;
            }

            if (data.user) {
                // Check if user has admin role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                if (profile?.role === 'admin') {
                    navigate('/admin');
                } else {
                    setError('This login is for administrators only.');
                    await supabase.auth.signOut();
                }
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            fontFamily: 'Segoe UI, sans-serif',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: 0,
            padding: 0
        }}>
            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '10px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                width: '400px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚗</div>
                <h2 style={{ color: '#333', marginBottom: '10px' }}>MEI DRIVE AFRICA</h2>
                <div style={{
                    background: '#667eea',
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    display: 'inline-block',
                    marginBottom: '20px'
                }}>Administrator Panel</div>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Admin Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            margin: '10px 0',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            margin: '10px 0',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Login as Admin'}
                    </button>
                </form>
                {error && <div style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>{error}</div>}
            </div>
        </div>
    );
}

// ============================================
// ADMIN DASHBOARD
// ============================================
function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        checkAdmin();
    }, []);

    async function checkAdmin() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/admin-login');
            return;
        }
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
        if (profile?.role !== 'admin') {
            navigate('/');
            return;
        }
        
        setUser(session.user);
        loadStats();
    }

    async function loadStats() {
        try {
            const coursesRes = await fetch(`${API_URL}/api/courses`);
            const coursesData = await coursesRes.json();
            
            setStats({
                totalCourses: coursesData.data?.length || 0
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        navigate('/');
    }

    return (
        <div>
            <Navbar user={user} onLogout={handleLogout} />
            <div className="container" style={{ paddingTop: '100px' }}>
                <h2 className="section-title">Admin <span>Dashboard</span></h2>
                <div className="dashboard-stats">
                    <div className="stat-card">
                        <h3>{stats.totalCourses || 0}</h3>
                        <p>Total Courses</p>
                    </div>
                    <div className="stat-card">
                        <h3>0</h3>
                        <p>Total Users</p>
                    </div>
                    <div className="stat-card">
                        <h3>KES 0</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

// ============================================
// COURSE CARD COMPONENT
// ============================================
function CourseCard({ course, user }) {
    const navigate = useNavigate();

    return (
        <div className="card" onClick={() => navigate(`/course/${course.id}`)} style={{ cursor: 'pointer' }}>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <div className="price">
                {course.type === 'free' ? 'FREE' : `KES ${course.price?.toLocaleString()}`}
            </div>
            <button className="btn btn-primary">
                {course.type === 'free' ? 'Enroll Now' : 'Purchase'}
            </button>
        </div>
    );
}

// ============================================
// NAVBAR COMPONENT
// ============================================
function Navbar({ user, onLogout }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            checkAdminStatus();
        }
    }, [user]);

    async function checkAdminStatus() {
        const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        setIsAdmin(data?.role === 'admin');
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        if (onLogout) onLogout();
        navigate('/');
    }

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    MEI DRIVE AFRICA
                </div>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/courses">Courses</Link>
                    {user && <Link to="/dashboard">Dashboard</Link>}
                    {isAdmin && <Link to="/admin">Admin</Link>}
                    {user ? (
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

// ============================================
// FOOTER COMPONENT
// ============================================
function Footer() {
    return (
        <footer>
            <div className="container">
                <p>© 2024 MEI DRIVE AFRICA | NTSA Approved Driver Training</p>
            </div>
        </footer>
    );
}

export default App;
