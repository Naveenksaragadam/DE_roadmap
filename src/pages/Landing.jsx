import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, BarChart3, Target, Layers, BookOpen, Clock, Zap, Shield, TrendingUp } from 'lucide-react';
import { roadmapStats, studyPhases } from '../data/roadmapData';
import { useProgress } from '../hooks/useProgress';
import { useState, useEffect } from 'react';

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const num = parseInt(target, 10);
    if (isNaN(num)) return;
    let start = 0;
    const step = Math.max(1, Math.floor(num / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count}</span>;
}

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

export default function Landing() {
  const navigate = useNavigate();
  const { overallPercent, completedSections, totalSections } = useProgress();

  return (
    <motion.div initial="initial" animate="animate" variants={stagger}>
      {/* Hero Section */}
      <motion.section variants={fadeUp} transition={{ duration: 0.5 }} className="text-center pt-8 pb-16 lg:pt-16 lg:pb-24">
        <motion.div
          className="badge inline-flex items-center gap-1.5 mb-6"
          style={{ background: 'var(--accent-subtle)', color: 'var(--accent-text)', border: 'none', padding: '5px 14px', fontSize: 12 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Sparkles size={13} />
          <span>Structured for FAANG interviews</span>
        </motion.div>

        <h1 className="mb-6" style={{ maxWidth: 800, margin: '0 auto 24px', fontFamily: 'var(--font-serif)', fontSize: 'clamp(3rem, 8vw, 5.5rem)', lineHeight: 1.05, letterSpacing: '-0.02em', fontWeight: 400 }}>
          The complete path to <br />
          Data Engineering <br />
          <span className="relative inline-block mt-2">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] blur-[40px] opacity-60 pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.4) 0%, rgba(234,88,12,0.3) 50%, transparent 80%)', zIndex: 0 }}></span>
            <span className="italic relative z-10" style={{ fontFamily: 'var(--font-serif)', background: 'linear-gradient(135deg, #a855f7, #ea580c)', WebkitBackgroundClip: 'text', color: 'transparent', display: 'inline-block', paddingRight: '0.1em' }}>
              mastery
            </span>
          </span>
        </h1>

        <p className="text-body mb-8" style={{ maxWidth: 580, margin: '0 auto 40px', fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          From SQL fundamentals to distributed systems — a structured roadmap with progress tracking, curated resources, and interview prep.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/roadmap')}
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: 14, borderRadius: 'var(--radius-lg)' }}
          >
            Get started <ArrowRight size={15} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
            style={{ padding: '12px 28px', fontSize: 14, borderRadius: 'var(--radius-lg)' }}
          >
            <BarChart3 size={15} /> Dashboard
          </motion.button>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section variants={fadeUp} transition={{ delay: 0.15 }} className="mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Tiers of depth', value: roadmapStats.tiers, icon: Layers },
            { label: 'Expert sections', value: roadmapStats.sections, icon: BookOpen },
            { label: 'Topics covered', value: roadmapStats.topics, icon: Target },
            { label: 'Weeks of content', value: '56', suffix: '+', icon: Clock },
          ].map((stat, i) => (
            <motion.div key={stat.label} variants={fadeUp} transition={{ delay: 0.2 + i * 0.06 }}
              className="card p-5 text-center"
            >
              <stat.icon size={20} className="mx-auto mb-2.5" style={{ color: 'var(--accent-text)' }} />
              <div className="text-2xl font-extrabold mb-0.5 text-mono" style={{ color: 'var(--text-primary)' }}>
                <AnimatedCounter target={stat.value} />{stat.suffix || ''}
              </div>
              <div className="text-caption">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Progress Banner */}
      {completedSections > 0 && (
        <motion.section variants={fadeUp} className="mb-16">
          <div className="card-accent p-5 flex items-center gap-5 flex-wrap" style={{ borderRadius: 'var(--radius-xl)' }}>
            <div className="flex-1 min-w-[200px]">
              <div className="text-label mb-2">Your progress</div>
              <div className="progress-track" style={{ height: 8 }}>
                <motion.div className="progress-fill" style={{ background: 'var(--accent)' }}
                  initial={{ width: 0 }} animate={{ width: `${overallPercent}%` }}
                  transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }} />
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold gradient-accent">{overallPercent}%</span>
              <div className="text-caption">{completedSections}/{totalSections} sections</div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Why This Roadmap */}
      <motion.section variants={fadeUp} className="mb-16">
        <div className="text-center mb-8">
          <h2 className="heading-lg mb-2">Why this roadmap?</h2>
          <p className="text-body" style={{ maxWidth: 480, margin: '0 auto' }}>
            Built by engineers, for engineers — every topic is battle-tested in real FAANG interviews.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Zap, title: 'Structured learning', desc: 'Four tiers from fundamentals to advanced, so you never feel lost about what to study next.' },
            { icon: Shield, title: 'Track everything', desc: 'Section and topic-level checkboxes with localStorage persistence — your progress is always saved.' },
            { icon: TrendingUp, title: 'Interview-ready', desc: 'Curated behavioral, system design, and coding prep with actionable tips from real interviewers.' },
          ].map((feature, i) => (
            <motion.div key={i} variants={fadeUp} transition={{ delay: 0.3 + i * 0.08 }}
              className="card p-6"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ background: 'var(--accent-subtle)' }}>
                <feature.icon size={18} style={{ color: 'var(--accent-text)' }} />
              </div>
              <h3 className="heading-md mb-2">{feature.title}</h3>
              <p className="text-body text-sm" style={{ lineHeight: 1.6 }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Tier Overview */}
      <motion.section variants={fadeUp} className="mb-16">
        <h2 className="heading-lg mb-6">Four tiers to mastery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { tier: 'TIER 1', label: 'Absolute Must-Haves', desc: 'SQL, Python, DSA — the foundation every DE needs', color: 'var(--tier-1)', bg: 'var(--tier-1-subtle)' },
            { tier: 'TIER 2', label: 'Core DE Stack', desc: 'Spark, Kafka, Airflow, Data Modeling', color: 'var(--tier-2)', bg: 'var(--tier-2-subtle)' },
            { tier: 'TIER 3', label: 'Infrastructure & Cloud', desc: 'AWS/GCP, Docker, Kubernetes, Terraform', color: 'var(--tier-3)', bg: 'var(--tier-3-subtle)' },
            { tier: 'TIER 4', label: 'Advanced Skills', desc: 'Lakehouse, System Design, Distributed Systems', color: 'var(--tier-4)', bg: 'var(--tier-4-subtle)' },
          ].map((t, i) => (
            <motion.div key={t.tier} variants={fadeUp} transition={{ delay: 0.4 + i * 0.06 }}
              className="card card-interactive p-5 flex items-start gap-4"
              onClick={() => navigate('/roadmap')}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: t.bg }}>
                <span className="text-xs font-black" style={{ color: t.color }}>{i + 1}</span>
              </div>
              <div>
                <div className="text-label mb-1" style={{ color: t.color }}>{t.tier}</div>
                <div className="heading-md mb-1">{t.label}</div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Study Timeline */}
      <motion.section variants={fadeUp} className="mb-8">
        <div className="card p-6 lg:p-8">
          <h3 className="heading-lg mb-6 text-center">Recommended study plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {studyPhases.map((p, i) => (
              <div key={i} className="card-inset p-4" style={{ borderRadius: 'var(--radius-lg)' }}>
                <div className="text-label mb-1.5" style={{ color: `var(--tier-${i + 1})` }}>{p.phase}</div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>{p.task}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
