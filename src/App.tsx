// Add these imports
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminCourses from './pages/Admin/AdminCourses';

// Add these routes inside the Routes component
<Route path="/admin" element={
    <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
    </ProtectedRoute>
} />
<Route path="/admin/dashboard" element={
    <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
    </ProtectedRoute>
} />
<Route path="/admin/users" element={
    <ProtectedRoute requiredRole="admin">
        <AdminUsers />
    </ProtectedRoute>
} />
<Route path="/admin/courses" element={
    <ProtectedRoute requiredRole="admin">
        <AdminCourses />
    </ProtectedRoute>
} />
