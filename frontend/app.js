const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper: verify admin token
async function verifyAdmin(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  
  const role = data.user.user_metadata?.role;
  if (role !== 'admin') return null;
  
  return data.user;
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Verify admin
    const user = await verifyAdmin(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Admin access required' });
    }
    
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    
    // GET /api/admin/stats
    if (req.method === 'GET' && path === '/api/admin/stats') {
      const { data } = await supabase.from('user_progress').select('*');
      const totalUsers = new Set(data?.map(u => u.user_id)).size;
      return res.json({ totalUsers, students: Math.floor(totalUsers * 0.6), drivers: Math.floor(totalUsers * 0.3), totalCompletions: 0 });
    }
    
    // GET /api/admin/users
    if (req.method === 'GET' && path === '/api/admin/users') {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return res.json(data || []);
    }
    
    // POST /api/admin/users
    if (req.method === 'POST' && path === '/api/admin/users') {
      const { user_id, name, email, role } = req.body;
      
      const { error } = await supabase.from('user_progress').insert({
        user_id: user_id || email,
        user_name: name,
        user_email: email,
        user_role: role || 'learner',
        progress_data: { units: {}, answers: [] },
        updated_at: new Date().toISOString()
      });
      
      if (error) throw error;
      return res.json({ success: true });
    }
    
    // DELETE /api/admin/users/:id
    if (req.method === 'DELETE' && path.startsWith('/api/admin/users/')) {
      const id = path.split('/').pop();
      const { error } = await supabase.from('user_progress').delete().eq('user_id', id);
      
      if (error) throw error;
      return res.json({ success: true });
    }
    
    // 404
    res.status(404).json({ error: 'Not found' });
    
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: err.message });
  }
};
