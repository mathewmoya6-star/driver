import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Course data
export const coursesData: Course[] = [
    { id: 1, name: "Learner Hub", type: "learner", price: 0, description: "Complete NTSA-approved driver training for beginners", icon: "fa-id-card", duration: "4 weeks", lessons: 12 },
    { id: 2, name: "EV Drivers & Riders", type: "ev", price: 0, description: "Electric vehicle safety training and operation", icon: "fa-charging-station", duration: "2 weeks", lessons: 8 },
    { id: 3, name: "Boda Boda Safety", type: "boda", price: 0, description: "Motorcycle safety & defensive riding techniques", icon: "fa-motorcycle", duration: "3 weeks", lessons: 10 },
    { id: 4, name: "PSV Professional", type: "psv", price: 2999, description: "Commercial driver certification for PSV operators", icon: "fa-bus", duration: "6 weeks", lessons: 16 },
    { id: 5, name: "School Bus/Van Driver", type: "schoolbus", price: 1999, description: "School transport safety training certification", icon: "fa-chalkboard-user", duration: "4 weeks", lessons: 10 },
    { id: 6, name: "Advanced Driver Academy", type: "advanced", price: 4999, description: "Professional driver excellence program", icon: "fa-award", duration: "8 weeks", lessons: 20 }
];
