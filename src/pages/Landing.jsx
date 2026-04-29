import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Shield, BookOpen, ClipboardCheck, Video,
  Car, School, FileText, ChevronRight,
  CheckCircle2, Smartphone, Zap, Award,
  Users, TrendingUp, MapPin, AlertTriangle,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const modules = [
  {
    icon: ClipboardCheck,
    number: '01',
    title: 'NTSA Test Preparation',
    desc: '300+ practice questions, timed mock exams, and adaptive drilling by weak topic. Aligned with the official NTSA theory test.',
    badge: '300+ Questions',
    link: '/exam',
  },
  {
    icon: BookOpen,
    number: '02',
    title: 'Driver Academy',
    desc: 'Refresher courses for licensed drivers, PSV training, and regulations.',
    badge: 'All Classes A–F',
    link: '/modules',
  },
  {
    icon: FileText,
    number: '03',
    title: 'Digital Safety Library',
    desc: 'Highway Code, NTSA curriculum, and offline guides.',
    badge: 'Offline Access',
    link: '/road-signs',
  },
  {
    icon: School,
    number: '04',
    title: 'School Transport Course',
    desc: 'Certification for school bus drivers.',
    badge: 'Certification',
    link: '/psv',
  },
  {
    icon: Car,
    number: '05',
    title: 'Vehicle Value Estimator',
    desc: 'Instant vehicle valuation using updated KRA CRSP rules.',
    badge: 'KRA 2025',
    link: '/valuation',
  },
  {
    icon: Video,
    number: '06',
    title: 'Video Learning',
    desc: 'Expert driving tutorials and safety lessons.',
    badge: 'Videos',
    link: '/videos',
  },
];

const stats = [
  { value: '50K+', label: 'Learners' },
  { value: '92%', label: 'Pass Rate' },
  { value: '300+', label: 'Questions' },
  { value: '4.8★', label: 'Rating' },
];

const whyPoints = [
  { icon: AlertTriangle, text: 'Road safety education reduces accidents caused by human error.' },
  { icon: TrendingUp, text: 'NTSA supports continuous driver training programs.' },
  { icon: MapPin, text: 'KRA CRSP updates affect vehicle valuations nationwide.' },
  { icon: Clock, text: 'Professional driving standards are now strictly regulated.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  }),
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold">K-DAM Pro</span>
          </div>

          <Link to="/dashboard">
            <Button>Enter Platform <ChevronRight className="w-4 h-4" /></Button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 text-center px-4">
        <motion.h1
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="text-4xl font-bold"
        >
          Drive Safe. Learn Smart.
        </motion.h1>

        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
          NTSA driving test preparation, training modules, and vehicle tools in one platform.
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <Link to="/dashboard">
            <Button>Start Learning</Button>
          </Link>
          <Link to="/exam">
            <Button variant="outline">Mock Exam</Button>
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 md:grid-cols-4 text-center gap-6 py-10">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-2xl font-bold text-primary">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </section>

      {/* MODULES */}
      <section id="modules" className="py-20 px-4">
        <h2 className="text-center text-2xl font-bold mb-10">
          Learning Modules
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {modules.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="border rounded-xl p-5 bg-card"
            >
              <m.icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold">{m.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{m.desc}</p>

              <Link to={m.link} className="text-primary text-sm mt-3 inline-block">
                Explore →
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="py-16 bg-muted/30 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center font-bold text-xl mb-8">
            Why This Platform Exists
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {whyPoints.map((w, i) => (
              <div key={i} className="flex gap-3">
                <w.icon className="text-primary w-5 h-5 mt-1" />
                <p className="text-sm text-muted-foreground">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-xs text-muted-foreground">
        © 2026 K-DAM Pro · DriverPrep Kenya
      </footer>

    </div>
  );
}
