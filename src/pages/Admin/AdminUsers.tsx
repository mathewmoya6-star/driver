import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';

interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
    last_login: string;
}

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        loadUsers();
    }, [search, roleFilter]);

    const loadUsers = async () => {
        try {
            let query = supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (search) {
                query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
            }

            if (roleFilter !== 'all') {
                query = query.eq('role', roleFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            toast.success('User role updated');
            loadUsers();
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update role');
        }
    };

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_active: !currentStatus })
                .eq('id', userId);

            if (error) throw error;

            toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
            loadUsers();
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="admin-users">
            <div className="admin-header">
                <div className="container">
                    <h1>
                        <i className="fas fa-users"></i>
                        User Management
                    </h1>
                    <p>Manage all users on the platform</p>
                </div>
            </div>

            <div className="container">
                <div className="filters-bar">
                    <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="all">All Roles</option>
                        <option value="student">Students</option>
                        <option value="instructor">Instructors</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>

                {loading ? (
                    <div className="loading-spinner"></div>
                ) : (
                    <div className="users-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-avatar">
                                                    {user.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <strong>{user.full_name || 'N/A'}</strong>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <select 
                                                value={user.role}
                                                onChange={(e) => updateUserRole(user.id, e.target.value)}
                                                className="role-select"
                                            >
                                                <option value="student">Student</option>
                                                <option value="instructor">Instructor</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <button 
                                                className="action-icon"
                                                onClick={() => toggleUserStatus(user.id, user.is_active)}
                                                title={user.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                <i className={`fas ${user.is_active ? 'fa-ban' : 'fa-check-circle'}`}></i>
                                            </button>
                                            <button 
                                                className="action-icon"
                                                onClick={() => window.location.href = `/admin/users/${user.id}`}
                                                title="View Details"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
