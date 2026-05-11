import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function uploadAndOptimizeImage(req, res) {
  try {
    const { file, fileName, moduleType } = req.body;
    
    // Decode base64
    const buffer = Buffer.from(file.split(',')[1], 'base64');
    
    // Generate multiple sizes
    const sizes = {
      original: buffer,
      large: await sharp(buffer).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 85 }).toBuffer(),
      medium: await sharp(buffer).resize(800, 450, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer(),
      small: await sharp(buffer).resize(400, 225, { fit: 'cover' }).jpeg({ quality: 75 }).toBuffer(),
      thumbnail: await sharp(buffer).resize(200, 150, { fit: 'cover' }).jpeg({ quality: 70 }).toBuffer()
    };
    
    // WebP versions for modern browsers
    const webpSizes = {};
    for (const [size, buf] of Object.entries(sizes)) {
      webpSizes[size] = await sharp(buf).webp({ quality: 80 }).toBuffer();
    }
    
    // Upload to Supabase Storage
    const uploads = [];
    for (const [size, buf] of Object.entries(webpSizes)) {
      const { data, error } = await supabase.storage
        .from('materials')
        .upload(`${moduleType}/${fileName}-${size}.webp`, buf, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/webp'
        });
      
      if (error) throw error;
      uploads.push({ size, path: data.path, url: supabase.storage.from('materials').getPublicUrl(data.path).data.publicUrl });
    }
    
    return res.status(200).json({ 
      success: true, 
      urls: uploads.reduce((acc, curr) => ({ ...acc, [curr.size]: curr.url }), {})
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
