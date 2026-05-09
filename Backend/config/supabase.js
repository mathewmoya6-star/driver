const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    realtime: {
      params: {
        eventsPerSecond: 10
      },
      transport: ws
    }
  }
);

module.exports = supabase;
