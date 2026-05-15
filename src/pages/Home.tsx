import React from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesData } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const featuredCourses = coursesData.slice(0, 3);

    return (
        <>
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1>Practice Daily.<br /><span>Revise Smarter. Pass with Confidence.</span></h1>
                        <p>For Learners and Experienced Drivers — Refresh Your Skills with MEI DRIVE AFRICA. NTSA-approved courses.</p>
                        <div>
                            <button className="btn btn-primary" onClick={() => navigate('/courses')}>
                                <i className="fas fa-road"></i> Explore Courses
                            </button>
                            <button className="btn btn-outline" onClick={() => user ? navigate('/dashboard') : navigate('/login')}>
                                <i className="fas fa-user-graduate"></i> Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="stats-bar" style={{ background: '#071B3A', padding: '2rem', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem', textAlign: 'center' }}>
                <div><h3 style={{ color: '#00ff88', fontSize: '2rem' }}>10K+</h3><p>Students</p></div>
                <div><h3 style={{ color: '#00ff88', fontSize: '2rem' }}>6</h3><p>Courses</p></div>
                <div><h3 style={{ color: '#00ff88', fontSize: '2rem' }}>98%</h3><p>Pass Rate</p></div>
            </div>

            <div className="container section">
                <h2 className="section-title" style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '2.5rem' }}>
                    Our <span style={{ color: '#00ff88' }}>Courses</span>
                </h2>
                <div className="grid">
                    {featuredCourses.map(course => (
                        <div key={course.id} className="card" onClick={() => navigate(`/courses/${course.id}`)}>
                            <i className={`fas ${course.icon}`} style={{ fontSize: '2rem', color: '#00ff88' }}></i>
                            <h3>{course.name}</h3>
                            <p>{course.description}</p>
                            <div className="module-price" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ff88', margin: '0.8rem 0' }}>
                                {course.price === 0 ? 'FREE' : `KES ${course.price.toLocaleString()}`}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Home;
