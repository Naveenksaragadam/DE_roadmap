import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { roadmapData } from '../data/roadmapData';
import { useApp } from '../context/AppContext';
import { useProgress } from '../hooks/useProgress';
import { useToast } from '../components/ui/Toast';

const priorityClasses = {
  Critical: 'badge-critical', High: 'badge-high',
  'Medium-High': 'badge-medium-high', Medium: 'badge-medium',
};

function getIcon(name) {
  const f = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return Icons[f] || Icons.Circle;
}

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function RoadmapOverview() {
  const { state, toggleSection } = useApp();
  const { tierProgress } = useProgress();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState({ '0-0': true });

  const handleToggleSection = (key, title) => {
    const willComplete = !state.progress[key];
    toggleSection(key);
    if (willComplete) addToast(`Completed: ${title}`);
  };

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="heading-xl mb-2">Roadmap</h1>
        <p className="text-body">Four tiers — from fundamentals to architectural excellence.</p>
      </motion.div>

      {/* Tier Progress Bars */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {tierProgress.map((tp) => (
          <div key={tp.id} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label" style={{ color: tp.color }}>{tp.label}</span>
              <span className="text-mono text-xs font-bold" style={{ color: tp.color }}>{tp.percent}%</span>
            </div>
            <div className="progress-track">
              <motion.div className="progress-fill" style={{ background: tp.color }}
                initial={{ width: 0 }} animate={{ width: `${tp.percent}%` }}
                transition={{ duration: 0.8, delay: 0.2 }} />
            </div>
            <div className="text-caption mt-1.5">{tp.completed}/{tp.total} sections</div>
          </div>
        ))}
      </motion.div>

      {/* Tiers */}
      {roadmapData.map((tier, ti) => (
        <motion.section key={tier.id} variants={fadeUp} className="mb-12">
          {/* Tier Header */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-black px-2.5 py-1 rounded-md text-white"
              style={{ background: `var(--tier-${ti + 1})` }}>
              {tier.tier}
            </span>
            <div className="flex-1">
              <h2 className="heading-lg m-0">{tier.label}</h2>
              <p className="text-caption m-0 mt-0.5">{tier.subtitle}</p>
            </div>
            <button onClick={() => navigate(`/tier/${tier.id}`)}
              className="btn-ghost text-xs font-semibold" style={{ color: `var(--tier-${ti + 1})` }}>
              Deep dive →
            </button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 grid-responsive">
            {tier.sections.map((sec, si) => {
              const key = `${ti}-${si}`;
              const isOpen = expanded[key];
              const isDone = state.progress[key];
              const SectionIcon = getIcon(sec.icon);

              return (
                <div key={sec.id}
                  className={`card overflow-hidden ${isDone ? 'opacity-60' : ''}`}
                  style={isDone ? { borderColor: 'var(--success)', background: 'var(--success-subtle)' } : {}}
                >
                  <div className="flex items-start gap-3.5 p-4 cursor-pointer"
                    onClick={() => setExpanded(p => ({ ...p, [key]: !p[key] }))}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `var(--tier-${ti + 1}-subtle)` }}>
                      <SectionIcon size={18} style={{ color: `var(--tier-${ti + 1})` }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`badge ${priorityClasses[sec.priority]}`}>{sec.priority}</span>
                        <span className="text-caption">⏱ {sec.timeEstimate}</span>
                      </div>
                      <h3 className={`heading-md m-0 ${isDone ? 'line-through' : ''}`}
                        style={isDone ? { color: 'var(--success)' } : {}}>
                        {sec.title}
                      </h3>
                    </div>
                    <div className={`checkbox ${isDone ? 'checked' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleToggleSection(key, sec.title); }}>
                      {isDone ? '✓' : ''}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-0" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-inset)' }}>
                      <div className="flex flex-col gap-1.5 mt-3">
                        {sec.topics.map((topic, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-sm py-1.5 px-2.5 rounded-lg"
                            style={{ color: 'var(--text-secondary)' }}>
                            <span className="mt-1 flex-shrink-0" style={{ color: `var(--tier-${ti + 1})`, opacity: 0.5, fontSize: 10 }}>●</span>
                            <span style={{ lineHeight: 1.5 }}>{topic}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 flex items-center gap-1.5 flex-wrap" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <span className="text-label mr-1">Resources:</span>
                        {sec.resources.map((r, i) => (
                          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs px-2.5 py-1 rounded-full no-underline transition-colors"
                            style={{ background: 'var(--accent-subtle)', color: 'var(--accent-text)', fontWeight: 500 }}>
                            {r.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.section>
      ))}
    </motion.div>
  );
}
