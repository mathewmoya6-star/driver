import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { verifyToken, requireRole } from './middleware/auth.js';
import { apiLimiter } from './middleware/rateLimit.js';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// GET /api/materials - Public access for published materials
router.get('/', apiLimiter, async (req, res) => {
  try {
    const { module_type, page = 1, limit = 12 } = req.query;
    const start = (page - 1) * limit;
    
    let query = supabase
      .from('materials')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('unit_number', { ascending: true })
      .range(start, start + limit - 1);
    
    if (module_type) query = query.eq('module_type', module_type);
    
    const { data, error, count } = await query;
    if (error) throw error;
    
    // Sanitize content before sending
    const sanitized = data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      module_type: item.module_type,
      unit_number: item.unit_number,
      difficulty: item.difficulty,
      image_url: item.image_url,
      thumbnail_url: item.thumbnail_url,
      estimated_minutes: item.estimated_minutes,
      tags: item.tags
    }));
    
    res.json({
      success: true,
      data: sanitized,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: count }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/materials/:id - Get single material
router.get('/:id', apiLimiter, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (data.status !== 'published' && !req.user) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/materials - Admin only
router.post('/', verifyToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { title, description, content, module_type, unit_number, difficulty, image_url, video_url, estimated_minutes, tags } = req.body;
    
    const { data, error } = await supabase
      .from('materials')
      .insert({
        title, description, content, module_type, unit_number,
        difficulty, image_url, video_url, estimated_minutes, tags,
        status: 'published',
        created_by: req.user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/materials/:id - Admin only
router.put('/:id', verifyToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('materials')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/materials/:id - Admin only
router.delete('/:id', verifyToken, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('materials')
      .update({ status: 'deleted', deleted_at: new Date().toISOString() })
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
