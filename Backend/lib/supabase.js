const { createClient } = require("@supabase/supabase-js");

// IMPORTANT: NO realtime config at all
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
