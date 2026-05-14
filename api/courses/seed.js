import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const courses = [
    { id: 1, name: "Learner Hub", type: "learner", price: 0, duration: "25 hours", lessons: 21, description: "Complete NTSA-approved driver training", icon: "fa-id-card" },
    { id: 2, name: "EV Drivers & Riders", type: "ev", price: 0, duration: "12 hours", lessons: 12, description: "Electric vehicle safety training", icon: "fa-charging-station" },
    { id: 3, name: "Boda Boda Safety", type: "boda", price: 0, duration: "18 hours", lessons: 12, description: "Motorcycle safety & defensive riding", icon: "fa-motorcycle" },
    { id: 4, name: "PSV Professional", type: "psv", price: 2999, duration: "15 hours", lessons: 8, description: "Commercial driver certification", icon: "fa-bus" },
    { id: 5, name: "School Bus/Van Driver", type: "schoolbus", price: 1999, duration: "12 hours", lessons: 12, description: "School transport safety training", icon: "fa-chalkboard-user" },
    { id: 6, name: "Advanced Driver Academy", type: "advanced", price: 4999, duration: "20 hours", lessons: 10, description: "Professional driver excellence", icon: "fa-award" }
  ];
  
  const sampleQuestions = [
    { question_text: "What does a red traffic light mean?", option_a: "Go", option_b: "Slow down", option_c: "Stop", option_d: "Yield", correct_option: "c", category: "Rules", explanation: "A red light means you must come to a complete stop." },
    { question_text: "What is the legal blood alcohol limit for professional drivers in Kenya?", option_a: "0.00%", option_b: "0.05%", option_c: "0.08%", option_d: "0.10%", correct_option: "a", category: "Safety", explanation: "Professional drivers must have zero alcohol in their system." },
    { question_text: "What does a yellow (amber) traffic light indicate?", option_a: "Speed up", option_b: "Prepare to stop", option_c: "Stop immediately", option_d: "Proceed with caution", correct_option: "b", category: "Rules", explanation: "Yellow means the light is about to turn red - prepare to stop if safe." }
  ];
  
  // Insert courses
  for (const course of courses) {
    await supabase.from('courses').upsert(course);
  }
  
  // Insert questions
  for (const question of sampleQuestions) {
    await supabase.from('questions').upsert(question);
  }
  
  return res.status(200).json({ success: true, message: 'Database seeded successfully' });
}courses/seed.js
