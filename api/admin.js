import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { verifyToken, requireRole } from './middleware/auth.js';
import { apiLimiter } from './middleware/rateLimit.js';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// GET /api/admin/users - Get all users (admin only)
router.get('/users', verifyToken, requireRole('admin', 'super_admin'), apiLimiter, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const start = (page - 1) * limit;
    
    let query = supabase
      .from('users')
      .select('id, email, role, status, created_at, last_login', { count: 'exact' });
    
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(start, start + limit - 1);
    
    if (error) throw error;
    res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total: count } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/users/:id/role - Update user role (admin only)
router.put('/users/:id/role', verifyToken, requireRole('admin', 'super_admin'), apiLimiter, async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['user', 'learner', 'driver', 'admin', 'super_admin'];
    
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const { data, error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/stats - Get platform statistics (admin only)
router.get('/stats', verifyToken, requireRole('admin', 'super_admin'), apiLimiter, async (req, res) => {
  try {
    const [users, materials, progress, certificates] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('materials').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('user_progress').select('*', { count: 'exact', head: true }).eq('progress_percentage', 100),
      supabase.from('certificates').select('*', { count: 'exact', head: true })
    ]);
    
    const { data: recentUsers } = await supabase
      .from('users')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    const { data: popularMaterials } = await supabase
      .from('user_progress')
      .select('material_id, count', { count: 'exact' })
      .eq('progress_percentage', 100)
      .group('material_id')
      .order('count', { ascending: false })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        totalUsers: users.count,
        totalMaterials: materials.count,
        totalCompletions: progress.count,
        totalCertificates: certificates.count,
        recentUsers,
        popularMaterials
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
