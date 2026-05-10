// scripts/setupDatabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Your data arrays here (learnerUnits, psvModules, etc. from previous message)

async function pushAllData() {
  console.log('🚀 Pushing data to Supabase...');
  // ... push logic from previous message
}

pushAllData();
