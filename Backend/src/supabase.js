const { createClient } = require("@supabase/supabase-js");

let WebSocket;
try {
  WebSocket = require("ws");
} catch (e) {
  console.log("ws not installed, using default WebSocket");
}

const supabaseUrl = "https://fktjmkmzlixlapeyhhyl.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabaseOptions = {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
};

// ONLY add ws if available
if (WebSocket) {
  supabaseOptions.realtime = {
    ...supabaseOptions.realtime,
    transport: WebSocket,
  };
}

const supabase = createClient(supabaseUrl, supabaseKey, supabaseOptions);

module.exports = supabase;
