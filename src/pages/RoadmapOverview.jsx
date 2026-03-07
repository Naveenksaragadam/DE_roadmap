import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { roadmapData } from '../data/roadmapData';
import { useApp } from '../context/AppContext';
import { useProgress } from '../hooks/useProgress';

const priorityClasses = {
  Critical: 'badge-critical',
  High: 'badge-high',
  'Medium-High': 'badge-medium-high',
  Medium: 'badge-medium',
};

function getIcon(name) {
  const formatted = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return Icons[formatted] || Icons.Circle;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function RoadmapOverview() {
  const { state, toggleSection } = useApp();
  const { tierProgress } = useProgress();
  const navigate = useNavigate();
  const [expandedCards, setExpandedCards] = useState({ '0-0': true });

  const toggleCard = (key) => {
    setExpandedCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.1 } } }}>
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight gradient-text mb-2">Roadmap</h1>
        <p className="text-[var(--color-text-secondary)]">
          Four tiers of mastery — from fundamentals to architectural excellence.
        </p>
      </motion.div>

      {/* Tier Progress Summary */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
        {tierProgress.map((tp) => (
          <div key={tp.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tp.color }}>
                {tp.label}
              </span>
              <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)', color: tp.color }}>
                {tp.percent}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: tp.color }}
                initial={{ width: 0 }}
                animate={{ width: `${tp.percent}%` }}
                transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1], delay: 0.3 }}
              />
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1.5">
              {tp.completed}/{tp.total} sections
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tiers */}
      {roadmapData.map((tier, ti) => {
        const tp = tierProgress[ti];
        return (
          <motion.section key={tier.id} variants={fadeUp} className="mb-14">
            {/* Tier Header */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="px-3 py-1.5 rounded-lg text-xs font-black"
                style={{
                  background: tier.color,
                  color: '#000',
                  boxShadow: `0 0 20px ${tier.color}33`,
                }}
              >
                {tier.tier}
              </div>
              <div className="flex-1">
                <h2 className="text-xl lg:text-2xl font-bold text-[var(--color-text-primary)] m-0">
                  {tier.label}
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] m-0 mt-1">{tier.subtitle}</p>
              </div>
              <button
                onClick={() => navigate(`/tier/${tier.id}`)}
                className="text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all"
                style={{
                  background: `${tier.color}15`,
                  border: `1px solid ${tier.color}30`,
                  color: tier.color,
                }}
              >
                Deep Dive →
              </button>
            </div>

            {/* Section Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {tier.sections.map((sec, si) => {
                const key = `${ti}-${si}`;
                const isOpen = expandedCards[key];
                const isDone = state.progress[key];
                const SectionIcon = getIcon(sec.icon);

                return (
                  <motion.div
                    key={sec.id}
                    variants={fadeUp}
                    className={`glass-card overflow-hidden ${isDone ? 'opacity-75' : ''}`}
                    style={{
                      borderColor: isDone ? 'rgba(46,184,92,0.2)' : undefined,
                      background: isDone ? 'rgba(46,184,92,0.04)' : undefined,
                    }}
                  >
                    {/* Card Header */}
                    <div
                      className="flex items-start gap-4 p-5 cursor-pointer"
                      onClick={() => toggleCard(key)}
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${tier.color}10`,
                          border: `1px solid ${tier.color}20`,
                        }}
                      >
                        <SectionIcon size={22} style={{ color: tier.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${priorityClasses[sec.priority]}`}>
                            {sec.priority}
                          </span>
                          <span className="text-xs text-[var(--color-text-muted)] font-medium">
                            ⏱ {sec.timeEstimate}
                          </span>
                        </div>
                        <h3 className={`text-base font-bold m-0 ${isDone ? 'line-through text-[#a3cfbb]' : 'text-[var(--color-text-primary)]'}`}>
                          {sec.title}
                        </h3>
                        {sec.description && (
                          <p className="text-xs text-[var(--color-text-muted)] m-0 mt-1">{sec.description}</p>
                        )}
                      </div>

                      {/* Complete toggle */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSection(key); }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0 transition-all"
                        style={{
                          background: isDone ? '#2eb85c' : 'var(--color-bg-surface)',
                          border: `2px solid ${isDone ? '#2eb85c' : 'rgba(255,255,255,0.1)'}`,
                          color: '#fff',
                          fontSize: 14,
                        }}
                        aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {isDone ? '✓' : ''}
                      </button>
                    </div>

                    {/* Expanded Topics */}
                    {isOpen && (
                      <div className="px-5 pb-5 pt-0 border-t" style={{
                        borderColor: 'var(--color-border-subtle)',
                        background: 'rgba(0,0,0,0.15)',
                      }}>
                        <div className="flex flex-col gap-2 mt-4">
                          {sec.topics.map((topic, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 text-sm text-[var(--color-text-secondary)] py-2 px-3 rounded-xl transition-colors hover:bg-[var(--color-bg-surface-hover)]"
                              style={{
                                background: 'var(--color-bg-surface)',
                                border: '1px solid rgba(255,255,255,0.03)',
                              }}
                            >
                              <span style={{ color: tier.color, opacity: 0.5, marginTop: 2 }}>✦</span>
                              <span className="leading-relaxed">{topic}</span>
                            </div>
                          ))}
                        </div>

                        {/* Resources */}
                        <div className="mt-4 pt-3 border-t flex items-center gap-2 flex-wrap" style={{ borderColor: 'var(--color-border-subtle)' }}>
                          <span className="text-[10px] text-[var(--color-text-muted)] font-bold tracking-wider">
                            RESOURCES:
                          </span>
                          {sec.resources.map((r, i) => (
                            <a
                              key={i}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-3 py-1 rounded-full no-underline transition-colors hover:brightness-125"
                              style={{
                                background: 'rgba(124,58,237,0.1)',
                                color: '#a78bfa',
                                border: '1px solid rgba(124,58,237,0.2)',
                              }}
                            >
                              {r.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        );
      })}
    </motion.div>
  );
}
