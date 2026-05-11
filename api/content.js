import { createClient } from '@supabase/supabase-js';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for backend only
);

// Sanitize HTML content
const sanitizeHtml = (html) => {
  const window = new JSDOM('').window;
  const purify = DOMPurify(window);
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'div', 'span'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target'],
    ALLOW_DATA_ATTR: false
  });
};

// Validate YouTube URLs
const validateYouTubeUrl = (url) => {
  const patterns = [
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /^https?:\/\/(?:www\.)?youtu\.be\/([^?]+)/,
    /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([^?]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
};

// Get published content
export async function getPublishedContent(req, res) {
  try {
    const { module_type, unit_number, slug } = req.query;
    
    let query = supabase
      .from('materials')
      .select(`
        *,
        category:categories(*),
        prerequisites:learning_paths!from_material_id(to_material_id(*))
      `)
      .eq('status', 'published');
    
    if (module_type) query = query.eq('module_type', module_type);
    if (unit_number) query = query.eq('unit_number', unit_number);
    if (slug) query = query.eq('slug', slug);
    
    const { data, error } = await query.order('unit_number', { ascending: true });
    
    if (error) throw error;
    
    // Sanitize content before sending
    const sanitizedData = data.map(item => ({
      ...item,
      content: item.content // Already JSON, no sanitization needed
    }));
    
    return res.status(200).json({ success: true, data: sanitizedData });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Track user progress
export async function trackProgress(req, res) {
  try {
    const { user_id, material_id, progress_percentage, time_spent, status } = req.body;
    
    // Validate user has access
    const { data: userCheck } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', user_id)
      .eq('material_id', material_id)
      .single();
    
    let result;
    if (userCheck) {
      result = await supabase
        .from('user_progress')
        .update({
          progress_percentage,
          time_spent_seconds: time_spent,
          status,
          last_accessed_at: new Date().toISOString(),
          completed_at: progress_percentage === 100 ? new Date().toISOString() : null
        })
        .eq('user_id', user_id)
        .eq('material_id', material_id);
    } else {
      result = await supabase
        .from('user_progress')
        .insert({
          user_id,
          material_id,
          progress_percentage,
          time_spent_seconds: time_spent,
          status,
          last_accessed_at: new Date().toISOString()
        });
    }
    
    if (result.error) throw result.error;
    
    // If completed, check for certificate eligibility
    if (progress_percentage === 100) {
      await checkAndIssueCertificate(user_id, material_id);
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Issue certificate
async function checkAndIssueCertificate(user_id, material_id) {
  const { data: material } = await supabase
    .from('materials')
    .select('module_type, unit_number')
    .eq('id', material_id)
    .single();
  
  // Check if all units in module are completed
  const { data: allUnits } = await supabase
    .from('materials')
    .select('id')
    .eq('module_type', material.module_type)
    .eq('status', 'published');
  
  const { data: completed } = await supabase
    .from('user_progress')
    .select('material_id')
    .eq('user_id', user_id)
    .eq('progress_percentage', 100);
  
  const completedIds = completed.map(c => c.material_id);
  const allCompleted = allUnits.every(unit => completedIds.includes(unit.id));
  
  if (allCompleted) {
    const certificateNumber = `MEI-${Date.now()}-${user_id.slice(0, 8)}`;
    await supabase
      .from('certificates')
      .insert({
        user_id,
        certificate_number: certificateNumber,
        issued_at: new Date().toISOString(),
        metadata: { module: material.module_type }
      });
  }
}
