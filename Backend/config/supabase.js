const { createClient } = require("@supabase/supabase-js");

// 🔥 IMPORTANT: Disable Realtime to prevent Render crashes
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    realtime: {
      enabled: false
    }
  }
);

module.exports = supabase;
