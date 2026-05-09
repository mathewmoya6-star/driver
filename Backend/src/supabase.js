const { createClient } = require("@supabase/supabase-js");

// Add WebSocket support for Node.js environment
let WebSocket;
try {
  WebSocket = require('ws');
} catch (e) {
  console.log('WebSocket package not installed, using native WebSocket');
}

const supabaseUrl = "https://fktjmkmzlixlapeyhhyl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrdGpta216bGl4bGFwZXloaHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDkzNzEsImV4cCI6MjA5MjcyNTM3MX0.l0ZijiumKnwO7kcJYV8c7nDbvnfefBIwnMu4ieWCX2E";

// Create Supabase client with WebSocket options
const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  ...(WebSocket && { 
    realtime: { 
      webSocket: WebSocket,
      params: { eventsPerSecond: 10 }
    }
  })
});

module.exports = supabase;
