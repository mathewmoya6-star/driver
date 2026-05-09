# 🚗 MEI DRIVE AFRICA - Digital Driver Safety Platform

A comprehensive digital driver safety platform built for Kenyan roads, based on the Kenya Highway Code, NTSA curriculum, and Learner Driver Handbook. The platform features interactive lessons, practice questions, progress tracking, and user authentication powered by Supabase.

## 🌟 Features

- **User Authentication** - Sign up and login with email/password via Supabase Auth
- **Learner Hub** - Interactive driving lessons with progress tracking
- **Practice Questions** - Test your knowledge with categorized questions
- **Specialized Courses** - PSV, Boda, School Transport, and Academy modules
- **Progress Persistence** - Your answers and unit completions are saved to your account
- **Resource Library** - Access driving manuals and official documents
- **Responsive Design** - Works on desktop, tablet, and mobile devices

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Authentication**: Supabase Auth (Email/Password)
- **Database**: Supabase PostgreSQL

## 📦 Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Use your existing project URL and anon key, or create a new one
3. Note down your:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon/Public Key

### 2. Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create lessons table
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create questions table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    options TEXT[] NOT NULL,
    correct_index INTEGER NOT NULL,
    category TEXT DEFAULT 'General',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_progress table
CREATE TABLE user_progress (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    progress_data JSONB DEFAULT '{"units": {}, "answers": []}'::jsonb,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sample data for lessons
INSERT INTO lessons (title, content) VALUES
('Introduction to Highway Code', 'The Kenya Highway Code establishes the rules of the road...'),
('Right of Way Rules', 'Understanding who has priority at intersections and roundabouts...'),
('Speed Limits', 'Urban areas: 50km/h, Highways: 110km/h, School zones: 30km/h...');

-- Sample data for questions
INSERT INTO questions (text, options, correct_index, category) VALUES
('What does a solid red traffic light mean?', ARRAY['Go', 'Stop', 'Prepare to stop', 'Yield'], 1, 'Signals'),
('Maximum speed limit for a matatu on a highway?', ARRAY['80 km/h', '100 km/h', '110 km/h', '120 km/h'], 1, 'Speed'),
('What should you do at a STOP sign?', ARRAY['Slow down', 'Honk', 'Stop completely', 'Continue if clear'], 2, 'Signs');
