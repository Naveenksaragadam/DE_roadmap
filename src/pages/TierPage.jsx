import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { roadmapData } from '../data/roadmapData';
import { useApp } from '../context/AppContext';
import ProgressRing from '../components/ui/ProgressRing';
import Confetti from '../components/ui/Confetti';

function getIcon(name) {
  const formatted = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return Icons[formatted] || Icons.Circle;
}

const priorityClasses = {
  Critical: 'badge-critical',
  High: 'badge-high',
  'Medium-High': 'badge-medium-high',
  Medium: 'badge-medium',
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function TierPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, toggleSection, toggleTopic } = useApp();

  const tierIndex = roadmapData.findIndex((t) => t.id === id);
  const tier = roadmapData[tierIndex];

  const [expandedSections, setExpandedSections] = useState(() => {
    const initial = {};
    if (tier) initial[`${tierIndex}-0`] = true;
    return initial;
  });

  const tierProgress = useMemo(() => {
    if (!tier) return { completed: 0, total: 0, percent: 0 };
    const total = tier.sections.length;
    const completed = tier.sections.filter((_, si) => state.progress[`${tierIndex}-${si}`]).length;
    return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [tier, tierIndex, state.progress]);

  const [showConfetti, setShowConfetti] = useState(false);

  const handleSectionToggle = (key) => {
    toggleSection(key);
    // Check if all sections are now complete
    const willBeComplete = !state.progress[key];
    if (willBeComplete) {
      const completed = tier.sections.filter((_, si) => {
        const k = `${tierIndex}-${si}`;
        return k === key ? true : state.progress[k];
      }).length;
      if (completed === tier.sections.length) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 100);
      }
    }
  };

  if (!tier) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Tier not found</h2>
        <button onClick={() => navigate('/roadmap')} className="text-[var(--color-accent-purple)] cursor-pointer bg-transparent border-none text-sm">
          ← Back to Roadmap
        </button>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
      <Confetti trigger={showConfetti} />

      {/* Back link */}
      <motion.button
        variants={fadeUp}
        onClick={() => navigate('/roadmap')}
        className="text-sm text-[var(--color-text-muted)] bg-transparent border-none cursor-pointer mb-6 hover:text-[var(--color-text-secondary)] transition-colors"
      >
        ← Back to Roadmap
      </motion.button>

      {/* Tier Header */}
      <motion.div variants={fadeUp} className="glass-card p-8 mb-10 flex items-center gap-8 flex-wrap"
        style={{ background: `linear-gradient(135deg, ${tier.color}10, transparent)` }}
      >
        <ProgressRing value={tierProgress.percent} size={100} strokeWidth={8} color={tier.color} />
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-3 mb-2">
            <span
              className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg"
              style={{ background: tier.color, color: '#000' }}
            >
              {tier.tier}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              Est. {tier.totalWeeks} weeks
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black m-0 text-[var(--color-text-primary)]">{tier.label}</h1>
          <p className="text-sm text-[var(--color-text-secondary)] m-0 mt-1">{tier.subtitle}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black" style={{ color: tier.color, fontFamily: 'var(--font-mono)' }}>
            {tierProgress.completed}/{tierProgress.total}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">sections complete</div>
        </div>
      </motion.div>

      {/* Sections */}
      {tier.sections.map((sec, si) => {
        const key = `${tierIndex}-${si}`;
        const isDone = state.progress[key];
        const isOpen = expandedSections[key];
        const SectionIcon = getIcon(sec.icon);

        return (
          <motion.div key={sec.id} variants={fadeUp} className="mb-6">
            <div className={`glass-card overflow-hidden ${isDone ? 'opacity-70' : ''}`}
              style={{
                borderColor: isDone ? 'rgba(46,184,92,0.25)' : undefined,
              }}
            >
              {/* Section Header */}
              <div
                className="flex items-center gap-4 p-6 cursor-pointer"
                onClick={() => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${tier.color}10`, border: `1px solid ${tier.color}20` }}
                >
                  <SectionIcon size={22} style={{ color: tier.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${priorityClasses[sec.priority]}`}>
                      {sec.priority}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">⏱ {sec.timeEstimate}</span>
                  </div>
                  <h3 className={`text-lg font-bold m-0 ${isDone ? 'line-through text-[#a3cfbb]' : ''}`}>{sec.title}</h3>
                  {sec.description && <p className="text-sm text-[var(--color-text-muted)] m-0 mt-0.5">{sec.description}</p>}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleSectionToggle(key); }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0 text-sm transition-all"
                  style={{
                    background: isDone ? '#2eb85c' : 'var(--color-bg-surface)',
                    border: `2px solid ${isDone ? '#2eb85c' : 'rgba(255,255,255,0.1)'}`,
                    color: '#fff',
                  }}
                  aria-label={isDone ? 'Mark section incomplete' : 'Mark section complete'}
                >
                  {isDone ? '✓' : ''}
                </button>
                <Icons.ChevronDown
                  size={18}
                  className="text-[var(--color-text-muted)] transition-transform flex-shrink-0"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </div>

              {/* Expanded Content */}
              {isOpen && (
                <div className="border-t px-6 pb-6" style={{ borderColor: 'var(--color-border-subtle)', background: 'rgba(0,0,0,0.12)' }}>
                  <div className="flex flex-col gap-2 mt-5">
                    {sec.topics.map((topic, idx) => {
                      const topicKey = `${tierIndex}-${si}-${idx}`;
                      const topicDone = state.topicProgress[topicKey];
                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-3 py-2.5 px-3 rounded-xl cursor-pointer transition-colors hover:bg-[var(--color-bg-surface-hover)]"
                          style={{ background: 'var(--color-bg-surface)', border: '1px solid rgba(255,255,255,0.03)' }}
                          onClick={() => toggleTopic(topicKey)}
                        >
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0 text-xs transition-all"
                            style={{
                              background: topicDone ? tier.color : 'transparent',
                              border: `2px solid ${topicDone ? tier.color : 'rgba(255,255,255,0.1)'}`,
                              color: topicDone ? '#000' : 'transparent',
                            }}
                          >
                            {topicDone ? '✓' : ''}
                          </div>
                          <span className={`text-sm leading-relaxed ${topicDone ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-secondary)]'}`}>
                            {topic}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Resources */}
                  <div className="mt-5 pt-4 border-t flex items-center gap-2 flex-wrap" style={{ borderColor: 'var(--color-border-subtle)' }}>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-bold tracking-wider">RESOURCES:</span>
                    {sec.resources.map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs px-3 py-1 rounded-full no-underline transition-colors hover:brightness-125"
                        style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}
                      >
                        {r.label} ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
