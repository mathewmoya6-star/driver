const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Validate required environment variables
const requiredEnv = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const env of requiredEnv) {
    if (!process.env[env]) {
        console.error(`❌ Missing ${env} in environment variables`);
        process.exit(1);
    }
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public client (for regular operations)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

// Admin client (for privileged operations)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

console.log('✅ Supabase clients initialized');
console.log(`📍 URL: ${supabaseUrl}`);

module.exports = { supabase, supabaseAdmin };
