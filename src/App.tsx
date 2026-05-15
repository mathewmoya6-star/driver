import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './styles/global.css';

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/courses/:id" element={<CourseDetail />} />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Layout>
            </AuthProvider>
        </Router>
    );
};

export default App;
