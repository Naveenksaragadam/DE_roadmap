import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Layers,
  Cloud,
  Trophy,
  ArrowRight,
  Sparkles,
  BookOpen,
  BarChart3,
  Clock,
} from 'lucide-react';
import { roadmapStats, studyPhases } from '../data/roadmapData';
import { useProgress } from '../hooks/useProgress';
import { useState, useEffect } from 'react';

const tierIcons = [Target, Layers, Cloud, Trophy];

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const num = parseInt(target, 10);
    if (isNaN(num)) return;
    let start = 0;
    const step = Math.max(1, Math.floor(num / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= num) {
        setCount(num);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count}</span>;
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function Landing() {
  const navigate = useNavigate();
  const { overallPercent, completedSections, totalSections } = useProgress();

  return (
    <motion.div initial="initial" animate="animate" variants={stagger}>
      {/* Hero */}
      <motion.section variants={fadeUp} transition={{ duration: 0.6 }} className="text-center py-12 lg:py-20">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8"
          style={{
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.2)',
            color: 'var(--color-accent-purple)',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles size={14} />
          FAANG-Ready Data Engineering
        </motion.div>

        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-tight mb-6 gradient-text">
          Master Data<br />Engineering
        </h1>

        <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
          The ultimate structured path from SQL fundamentals to distributed systems architecture.
          Track your progress, build expertise, and ace your FAANG interviews.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/roadmap')}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold cursor-pointer border-none"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent-purple), var(--color-accent-pink))',
              color: 'white',
              boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
            }}
          >
            Start Your Journey <ArrowRight size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold cursor-pointer"
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
            }}
          >
            <BarChart3 size={16} /> View Dashboard
          </motion.button>
        </div>
      </motion.section>

      {/* Stats Grid */}
      <motion.section variants={fadeUp} transition={{ duration: 0.5, delay: 0.2 }} className="mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Tiers', value: roadmapStats.tiers, icon: Layers, color: 'var(--color-accent-purple)' },
            { label: 'Sections', value: roadmapStats.sections, icon: BookOpen, color: 'var(--color-accent-pink)' },
            { label: 'Topics', value: roadmapStats.topics, icon: Target, color: 'var(--color-accent-blue)' },
            { label: 'Weeks', value: '56', icon: Clock, suffix: '+', color: '#2eb85c' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="glass-card p-6 text-center"
            >
              <stat.icon size={24} className="mx-auto mb-3" style={{ color: stat.color }} />
              <div className="text-3xl font-black mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                <AnimatedCounter target={stat.value} />{stat.suffix || ''}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Progress Banner (if started) */}
      {completedSections > 0 && (
        <motion.section variants={fadeUp} transition={{ delay: 0.4 }} className="mb-16">
          <div className="glass-card p-6 flex items-center gap-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-wider mb-2">
                Your Progress
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--color-accent-purple), var(--color-accent-pink))' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPercent}%` }}
                  transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }}
                />
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black gradient-text-accent">{overallPercent}%</span>
              <div className="text-xs text-[var(--color-text-muted)]">
                {completedSections}/{totalSections} sections
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Tier Preview Cards */}
      <motion.section variants={fadeUp} transition={{ delay: 0.5 }} className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Four Tiers to Mastery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { tier: 'TIER 1', label: 'Absolute Must-Haves', desc: 'SQL, Python, DSA — the foundation', color: '#ff4d4d' },
            { tier: 'TIER 2', label: 'Core DE Stack', desc: 'Spark, Kafka, Airflow, Modeling', color: '#ff9933' },
            { tier: 'TIER 3', label: 'Infrastructure & Cloud', desc: 'AWS/GCP, Docker, K8s, Terraform', color: '#e6b800' },
            { tier: 'TIER 4', label: 'Advanced Skills', desc: 'Lakehouse, System Design, Distributed', color: '#2eb85c' },
          ].map((t, i) => {
            const Icon = tierIcons[i];
            return (
              <motion.div
                key={t.tier}
                variants={fadeUp}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="glass-card glass-card-interactive p-6 cursor-pointer"
                onClick={() => navigate('/roadmap')}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                    background: `${t.color}15`,
                    border: `1px solid ${t.color}30`,
                  }}>
                    <Icon size={20} style={{ color: t.color }} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: t.color }}>
                      {t.tier}
                    </div>
                    <div className="text-base font-bold text-[var(--color-text-primary)]">{t.label}</div>
                  </div>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{t.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Study Strategy */}
      <motion.section variants={fadeUp} transition={{ delay: 0.7 }} className="mb-12">
        <div className="glass-card p-8" style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(236,72,153,0.04))',
        }}>
          <h3 className="text-xl font-bold mb-6 text-center">📅 Recommended Study Plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {studyPhases.map((p, i) => (
              <div key={i} className="p-4 rounded-2xl" style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--color-border-subtle)',
              }}>
                <div className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: p.color }}>
                  {p.phase}
                </div>
                <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {p.task}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
