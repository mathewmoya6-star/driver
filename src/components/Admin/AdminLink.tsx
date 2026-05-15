import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

export const AdminLink: React.FC = () => {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdminMenu, setShowAdminMenu] = useState(false);

    useEffect(() => {
        if (user) {
            checkAdminStatus();
        }
    }, [user]);

    const checkAdminStatus = async () => {
        const { data, error } = await supabase
            .rpc('is_admin');
        
        if (!error && data) {
            setIsAdmin(true);
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="admin-link-container">
            <button 
                className="admin-link-btn"
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                title="Admin Panel"
            >
                <i className="fas fa-crown"></i>
                <span>Admin</span>
            </button>
            
            {showAdminMenu && (
                <div className="admin-dropdown">
                    <Link to="/admin/dashboard" onClick={() => setShowAdminMenu(false)}>
                        <i className="fas fa-chart-line"></i> Dashboard
                    </Link>
                    <Link to="/admin/users" onClick={() => setShowAdminMenu(false)}>
                        <i className="fas fa-users"></i> Users
                    </Link>
                    <Link to="/admin/courses" onClick={() => setShowAdminMenu(false)}>
                        <i className="fas fa-book"></i> Courses
                    </Link>
                    <Link to="/admin/payments" onClick={() => setShowAdminMenu(false)}>
                        <i className="fas fa-credit-card"></i> Payments
                    </Link>
                    <Link to="/admin/analytics" onClick={() => setShowAdminMenu(false)}>
                        <i className="fas fa-chart-bar"></i> Analytics
                    </Link>
                    <Link to="/admin/settings" onClick={() => setShowAdminMenu(false)}>
                        <i className="fas fa-cog"></i> Settings
                    </Link>
                </div>
            )}
        </div>
    );
};
