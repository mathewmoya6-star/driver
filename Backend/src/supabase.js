const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://fktjmkmzlixlapeyhhyl.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrdGpta216bGl4bGFwZXloaHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDkzNzEsImV4cCI6MjA5MjcyNTM3MX0.l0ZijiumKnwO7kcJYV8c7nDbvnfefBIwnMu4ieWCX2E";

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
