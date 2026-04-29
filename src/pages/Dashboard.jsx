import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  ClipboardCheck,
  Trophy,
  TrendingUp
} from 'lucide-react';

export default function Dashboard() {

  // ✅ MOCK DATA (NO BACKEND)
  const [modules] = useState([
    { id: 1, title: 'NTSA Test Prep', progress: 70 },
    { id: 2, title: 'Road Signs', progress: 40 },
    { id: 3, title: 'Defensive Driving', progress: 85 },
  ]);

  const [attempts] = useState([
    { score: 72, passed: true },
    { score: 65, passed: false },
    { score: 88, passed: true },
  ]);

  const totalCompleted = modules.filter(m => m.progress === 100).length;
  const latestScore = attempts.length ? attempts[0].score : 0;
  const bestScore = Math.max(...attempts.map(a => a.score));
  const passedCount = attempts.filter(a => a.passed).length;

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Welcome Back 👋</h1>
        <p className="text-muted-foreground">
          Continue your journey to becoming a certified driver.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="p-4 border rounded-xl">
          <p className="text-sm text-muted-foreground">Completed Modules</p>
          <p className="text-xl font-bold">{totalCompleted}</p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="text-sm text-muted-foreground">Latest Score</p>
          <p className="text-xl font-bold">{latestScore}%</p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="text-sm text-muted-foreground">Best Score</p>
          <p className="text-xl font-bold">{bestScore}%</p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="text-sm text-muted-foreground">Passed Exams</p>
          <p className="text-xl font-bold">{passedCount}</p>
        </div>

      </div>

      {/* QUICK ACTION */}
      <div className="p-6 border rounded-xl bg-muted/30">
        <h2 className="font-semibold mb-2">Ready for a Mock Exam?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          40 questions • 30 minutes • NTSA style test
        </p>
        <Button>Start Exam</Button>
      </div>

      {/* MODULES */}
      <div>
        <h2 className="font-semibold mb-4">Learning Modules</h2>

        <div className="grid md:grid-cols-3 gap-4">

          {modules.map((m) => (
            <div key={m.id} className="border rounded-xl p-4">
              <h3 className="font-medium">{m.title}</h3>

              <p className="text-sm text-muted-foreground mt-2">
                Progress: {m.progress}%
              </p>

              <div className="w-full bg-gray-200 h-2 rounded mt-3">
                <div
                  className="bg-primary h-2 rounded"
                  style={{ width: `${m.progress}%` }}
                />
              </div>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}
