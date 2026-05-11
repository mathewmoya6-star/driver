import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Read content from JSON files
const contentFiles = fs.readdirSync(path.join(__dirname, '../data/modules'));

for (const file of contentFiles) {
  const moduleData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/modules', file), 'utf8'));
  
  // Insert material
  const { data: material, error } = await supabase
    .from('materials')
    .insert({
      title: moduleData.title,
      slug: moduleData.slug,
      description: moduleData.description,
      content: moduleData.content,
      module_type: moduleData.module_type,
      unit_number: moduleData.unit_number,
      difficulty: moduleData.difficulty,
      status: 'published',
      learning_objectives: moduleData.learning_objectives,
      outcomes: moduleData.outcomes,
      estimated_minutes: moduleData.estimated_minutes,
      tags: moduleData.tags,
      keywords: moduleData.keywords,
      featured_image_url: moduleData.featured_image_url,
      thumbnail_url: moduleData.thumbnail_url,
      video_url: moduleData.video_url,
      video_duration: moduleData.video_duration
    })
    .select()
    .single();
  
  if (error) {
    console.error(`Error inserting ${moduleData.title}:`, error);
    continue;
  }
  
  // Insert quiz if exists
  if (moduleData.quiz) {
    const { data: quiz } = await supabase
      .from('quizzes')
      .insert({
        material_id: material.id,
        title: moduleData.quiz.title,
        pass_threshold: moduleData.quiz.pass_threshold,
        randomize_questions: moduleData.quiz.randomize_questions
      })
      .select()
      .single();
    
    // Insert questions
    for (const q of moduleData.quiz.questions) {
      await supabase
        .from('questions')
        .insert({
          quiz_id: quiz.id,
          question_text: q.text,
          options: q.options,
          explanation: q.explanation,
          points: q.points,
          order_index: q.order_index
        });
    }
  }
  
  console.log(`✓ Seeded: ${moduleData.title}`);
}

console.log('✅ Database seeding complete!');
