import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://fktjmkmzlixlapeyhhyl.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrdGpta216bGl4bGFwZXloaHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDkzNzEsImV4cCI6MjA5MjcyNTM3MX0.l0ZijiumKnwO7kcYJV8c7nDbvnfefBIwnMu4ieWCX2E";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
