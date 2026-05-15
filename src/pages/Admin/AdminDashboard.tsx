import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface DashboardStats {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
    pendingPayments: number;
    completedCourses: number;
    activeUsers: number;
    monthlyGrowth: number;
}

interface RecentActivity {
    id: string;
    action: string;
    admin_email: string;
    created_at: string;
    details: any;
}

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalCourses: 0,
        totalEnrollments: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        completedCourses: 0,
        activeUsers: 0,
        monthlyGrowth: 0
    });
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
        loadRecentActivity();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Get total users
            const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // Get total courses
            const { count: courseCount } = await supabase
                .from('courses')
                .select('*', { count: 'exact', head: true });

            // Get total enrollments
            const { count: enrollmentCount } = await supabase
                .from('enrollments')
                .select('*', { count: 'exact', head: true });

            // Get total revenue
            const { data: payments } = await supabase
                .from('payments')
                .select('amount')
                .eq('status', 'completed');

            const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

            // Get pending payments
            const { count: pendingPayments } = await supabase
                .from('payments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // Get completed courses
            const { count: completedCourses } = await supabase
                .from('enrollments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'completed');

            // Get active users (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const { count: activeUsers } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('last_login', thirtyDaysAgo.toISOString());

            setStats({
                totalUsers: userCount || 0,
                totalCourses: courseCount || 0,
                totalEnrollments: enrollmentCount || 0,
                totalRevenue,
                pendingPayments: pendingPayments || 0,
                completedCourses: completedCourses || 0,
                activeUsers: activeUsers || 0,
                monthlyGrowth: 12.5 // Calculate from previous month
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
            toast.error('Failed to load dashboard data');
        }
    };

    const loadRecentActivity = async () => {
        try {
            const { data, error } = await supabase
                .from('admin_activity_log')
                .select('*, admin:profiles(email)')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            setRecentActivity(data || []);
        } catch (error) {
            console.error('Error loading activity:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, color, link }: any) => (
        <Link to={link} className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
            <div className="stat-icon" style={{ color }}>
                <i className={`fas fa-${icon}`}></i>
            </div>
            <div className="stat-info">
                <h3>{title}</h3>
                <p className="stat-value">{value.toLocaleString()}</p>
            </div>
        </Link>
    );

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <div className="container">
                    <h1>
                        <i className="fas fa-crown"></i> 
                        Admin Dashboard
                    </h1>
                    <p>Welcome back, {user?.full_name || user?.email}</p>
                </div>
            </div>

            <div className="container">
                <div className="stats-grid">
                    <StatCard 
                        title="Total Users" 
                        value={stats.totalUsers} 
                        icon="users" 
                        color="#00ff88"
                        link="/admin/users"
                    />
                    <StatCard 
                        title="Total Courses" 
                        value={stats.totalCourses} 
                        icon="book" 
                        color="#2196f3"
                        link="/admin/courses"
                    />
                    <StatCard 
                        title="Enrollments" 
                        value={stats.totalEnrollments} 
                        icon="graduation-cap" 
                        color="#ff9800"
                        link="/admin/enrollments"
                    />
                    <StatCard 
                        title="Revenue (KES)" 
                        value={stats.totalRevenue} 
                        icon="money-bill" 
                        color="#ffc107"
                        link="/admin/payments"
                    />
                    <StatCard 
                        title="Pending Payments" 
                        value={stats.pendingPayments} 
                        icon="clock" 
                        color="#ff4444"
                        link="/admin/payments?status=pending"
                    />
                    <StatCard 
                        title="Completed Courses" 
                        value={stats.completedCourses} 
                        icon="check-circle" 
                        color="#4caf50"
                        link="/admin/enrollments?status=completed"
                    />
                    <StatCard 
                        title="Active Users" 
                        value={stats.activeUsers} 
                        icon="user-check" 
                        color="#9c27b0"
                        link="/admin/users?active=true"
                    />
                    <StatCard 
                        title="Growth" 
                        value={`+${stats.monthlyGrowth}%`} 
                        icon="chart-line" 
                        color="#00bcd4"
                        link="/admin/analytics"
                    />
                </div>

                <div className="admin-grid">
                    {/* Recent Activity */}
                    <div className="admin-card">
                        <h2>
                            <i className="fas fa-history"></i>
                            Recent Activity
                        </h2>
                        {loading ? (
                            <div className="loading-spinner"></div>
                        ) : (
                            <div className="activity-list">
                                {recentActivity.map(activity => (
                                    <div key={activity.id} className="activity-item">
                                        <div className="activity-icon">
                                            <i className="fas fa-user-circle"></i>
                                        </div>
                                        <div className="activity-details">
                                            <p className="activity-action">{activity.action}</p>
                                            <p className="activity-meta">
                                                By {activity.admin?.email || 'Unknown'} • 
                                                {new Date(activity.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="admin-card">
                        <h2>
                            <i className="fas fa-bolt"></i>
                            Quick Actions
                        </h2>
                        <div className="quick-actions">
                            <button className="action-btn" onClick={() => window.location.href = '/admin/users/new'}>
                                <i className="fas fa-user-plus"></i>
                                Add User
                            </button>
                            <button className="action-btn" onClick={() => window.location.href = '/admin/courses/new'}>
                                <i className="fas fa-plus-circle"></i>
                                Add Course
                            </button>
                            <button className="action-btn" onClick={() => window.location.href = '/admin/announcements'}>
                                <i className="fas fa-bullhorn"></i>
                                Announcement
                            </button>
                            <button className="action-btn" onClick={() => window.location.href = '/admin/export'}>
                                <i className="fas fa-download"></i>
                                Export Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="admin-card full-width">
                    <h2>
                        <i className="fas fa-chart-line"></i>
                        Revenue Overview
                    </h2>
                    <div className="chart-container">
                        <canvas id="revenueChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
