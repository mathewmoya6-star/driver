const { createClient } = require("@supabase/supabase-js");

// Optional WebSocket support
let WebSocket;
try {
  WebSocket = require("ws");
  console.log("ws package loaded");
} catch (e) {
  console.log("ws not installed, using default WebSocket");
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Fail fast if env is missing
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment");
}

// Supabase options
const supabaseOptions = {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
};

// Only attach custom WebSocket if available
if (WebSocket) {
  supabaseOptions.realtime = {
    ...supabaseOptions.realtime,
    websocket: WebSocket, // Supabase supports custom websocket here
  };
}

const supabase = createClient(supabaseUrl, supabaseKey, supabaseOptions);

module.exports = supabase;
