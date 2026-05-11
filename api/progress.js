import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from './middleware/auth.js';
import { apiLimiter } from './middleware/rateLimit.js';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// GET /api/progress - Get user's progress
router.get('/', verifyToken, apiLimiter, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', req.user.id);
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/progress - Update progress for a material
router.post('/', verifyToken, apiLimiter, async (req, res) => {
  try {
    const { material_id, progress_percentage, status, time_spent_seconds } = req.body;
    
    // Validate progress percentage
    if (progress_percentage < 0 || progress_percentage > 100) {
      return res.status(400).json({ error: 'Invalid progress percentage' });
    }
    
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: req.user.id,
        material_id,
        progress_percentage,
        status: status || (progress_percentage === 100 ? 'completed' : 'in_progress'),
        time_spent_seconds,
        last_accessed_at: new Date().toISOString(),
        completed_at: progress_percentage === 100 ? new Date().toISOString() : null
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Check if user completed all materials in module
    if (progress_percentage === 100) {
      const { data: moduleMaterials } = await supabase
        .from('materials')
        .select('id')
        .eq('module_type', (await supabase.from('materials').select('module_type').eq('id', material_id).single()).data.module_type);
      
      const { data: userProgress } = await supabase
        .from('user_progress')
        .select('material_id')
        .eq('user_id', req.user.id)
        .eq('progress_percentage', 100);
      
      const completedIds = userProgress.map(p => p.material_id);
      const allCompleted = moduleMaterials.every(m => completedIds.includes(m.id));
      
      if (allCompleted) {
        // Generate certificate
        const certificateNumber = `MEI-${Date.now()}-${req.user.id.slice(0, 8)}`;
        await supabase.from('certificates').insert({
          user_id: req.user.id,
          certificate_number: certificateNumber,
          module_type: (await supabase.from('materials').select('module_type').eq('id', material_id).single()).data.module_type,
          issued_at: new Date().toISOString()
        });
      }
    }
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/progress/stats - Get user's overall progress stats
router.get('/stats', verifyToken, apiLimiter, async (req, res) => {
  try {
    const { data: materials } = await supabase
      .from('materials')
      .select('module_type, id')
      .eq('status', 'published');
    
    const { data: progress } = await supabase
      .from('user_progress')
      .select('material_id, progress_percentage')
      .eq('user_id', req.user.id);
    
    const moduleStats = {};
    materials.forEach(m => {
      if (!moduleStats[m.module_type]) {
        moduleStats[m.module_type] = { total: 0, completed: 0 };
      }
      moduleStats[m.module_type].total++;
    });
    
    progress.forEach(p => {
      const material = materials.find(m => m.id === p.material_id);
      if (material && p.progress_percentage === 100) {
        moduleStats[material.module_type].completed++;
      }
    });
    
    Object.keys(moduleStats).forEach(module => {
      moduleStats[module].percentage = Math.round((moduleStats[module].completed / moduleStats[module].total) * 100);
    });
    
    res.json({ success: true, data: moduleStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
