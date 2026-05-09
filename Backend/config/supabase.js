const { createClient } = require("@supabase/supabase-js");

// WebSocket support (optional)
let WebSocket;
try {
  WebSocket = require("ws");
  console.log("ws package loaded");
} catch (e) {
  console.log("ws not installed, using default WebSocket");
}

// ENV CONFIG (SAFE)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Fail fast
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
}

// Supabase options
const supabaseOptions = {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
};

// Attach WebSocket ONLY if available
if (WebSocket) {
  supabaseOptions.realtime.transport = WebSocket;
}

// Create client
const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  supabaseOptions
);

module.exports = supabase;
