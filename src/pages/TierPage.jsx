import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { roadmapData } from '../data/roadmapData';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import ProgressRing from '../components/ui/ProgressRing';
import Confetti from '../components/ui/Confetti';
import ConfidenceRating from '../components/ui/ConfidenceRating';
import TopicNotes from '../components/ui/TopicNotes';

function getIcon(name) {
  const f = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return Icons[f] || Icons.Circle;
}

const pClasses = { Critical: 'badge-critical', High: 'badge-high', 'Medium-High': 'badge-medium-high', Medium: 'badge-medium' };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function TierPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, toggleSection, toggleTopic, startTimer } = useApp();
  const { addToast } = useToast();

  const tierIndex = roadmapData.findIndex(t => t.id === id);
  const tier = roadmapData[tierIndex];
  const [expanded, setExpanded] = useState(() => {
    if (tier) return { [`${tierIndex}-0`]: true };
    return {};
  });
  const [showConfetti, setShowConfetti] = useState(false);

  const progress = useMemo(() => {
    if (!tier) return { completed: 0, total: 0, percent: 0 };
    const total = tier.sections.length;
    const completed = tier.sections.filter((_, si) => state.progress[`${tierIndex}-${si}`]).length;
    return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [tier, tierIndex, state.progress]);

  // Compute total study time per topic from logs
  const topicStudyTime = useMemo(() => {
    const times = {};
    Object.values(state.studyLogs).forEach(logs => {
      logs.forEach(log => {
        times[log.topicKey] = (times[log.topicKey] || 0) + (log.duration || 0);
      });
    });
    return times;
  }, [state.studyLogs]);

  const handleSection = (key, title) => {
    const willComplete = !state.progress[key];
    toggleSection(key);
    if (willComplete) {
      addToast(`Completed: ${title}`);
      const done = tier.sections.filter((_, si) => {
        const k = `${tierIndex}-${si}`;
        return k === key ? true : state.progress[k];
      }).length;
      if (done === tier.sections.length) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 100);
        addToast(`🎉 ${tier.label} tier complete!`);
      }
    }
  };

  if (!tier) {
    return (
      <div className="text-center py-20">
        <h2 className="heading-lg mb-4">Tier not found</h2>
        <button onClick={() => navigate('/roadmap')} className="btn btn-secondary">← Back to Roadmap</button>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
      <Confetti trigger={showConfetti} />

      <motion.button variants={fadeUp} onClick={() => navigate('/roadmap')}
        className="btn-ghost text-sm mb-6" style={{ padding: '4px 0', color: 'var(--text-muted)' }}>
        ← Back to Roadmap
      </motion.button>

      {/* Tier Header */}
      <motion.div variants={fadeUp}
        className="card p-6 lg:p-8 mb-8 flex items-center gap-6 flex-wrap"
        style={{ background: `var(--tier-${tierIndex + 1}-subtle)`, borderColor: `var(--tier-${tierIndex + 1})20` }}>
        <ProgressRing value={progress.percent} size={90} strokeWidth={7} color={`var(--tier-${tierIndex + 1})`} />
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge text-white" style={{ background: `var(--tier-${tierIndex + 1})`, border: 'none' }}>{tier.tier}</span>
            <span className="text-caption">Est. {tier.totalWeeks} weeks</span>
          </div>
          <h1 className="heading-lg m-0">{tier.label}</h1>
          <p className="text-body text-sm m-0 mt-1">{tier.subtitle}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-mono" style={{ color: `var(--tier-${tierIndex + 1})` }}>
            {progress.completed}/{progress.total}
          </div>
          <div className="text-caption">sections complete</div>
        </div>
      </motion.div>

      {/* Sections */}
      {tier.sections.map((sec, si) => {
        const key = `${tierIndex}-${si}`;
        const isDone = state.progress[key];
        const isOpen = expanded[key];
        const SectionIcon = getIcon(sec.icon);

        return (
          <motion.div key={sec.id} variants={fadeUp} className="mb-4">
            <div className={`card overflow-hidden ${isDone ? 'opacity-60' : ''}`}
              style={isDone ? { borderColor: 'var(--success)', background: 'var(--success-subtle)' } : {}}>
              <div className="flex items-center gap-3.5 p-5 cursor-pointer"
                onClick={() => setExpanded(p => ({ ...p, [key]: !p[key] }))}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `var(--tier-${tierIndex + 1}-subtle)` }}>
                  <SectionIcon size={18} style={{ color: `var(--tier-${tierIndex + 1})` }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${pClasses[sec.priority]}`}>{sec.priority}</span>
                    <span className="text-caption">⏱ {sec.timeEstimate}</span>
                  </div>
                  <h3 className={`heading-md m-0 ${isDone ? 'line-through' : ''}`}
                    style={isDone ? { color: 'var(--success)' } : {}}>
                    {sec.title}
                  </h3>
                  {sec.description && <p className="text-caption m-0 mt-0.5" style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>{sec.description}</p>}
                </div>
                <div className={`checkbox ${isDone ? 'checked' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleSection(key, sec.title); }}>
                  {isDone ? '✓' : ''}
                </div>
                <Icons.ChevronDown size={16} className="text-[var(--text-muted)] flex-shrink-0 transition-transform"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
              </div>

              {isOpen && (
                <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-inset)' }}>
                  <div className="flex flex-col gap-1 mt-4">
                    {sec.topics.map((topic, idx) => {
                      const tKey = `${tierIndex}-${si}-${idx}`;
                      const tDone = state.topicProgress[tKey];
                      const studyMins = topicStudyTime[tKey] || 0;
                      return (
                        <div key={idx} className="rounded-lg transition-colors"
                          style={{ background: tDone ? 'var(--success-subtle)' : 'transparent' }}>
                          {/* Topic Row */}
                          <div className="flex items-start gap-2.5 py-2 px-3 cursor-pointer"
                            onClick={() => toggleTopic(tKey)}>
                            <div className={`checkbox ${tDone ? 'checked' : ''}`}
                              style={tDone ? { background: `var(--tier-${tierIndex + 1})`, borderColor: `var(--tier-${tierIndex + 1})` } : { width: 18, height: 18, borderRadius: 5 }}>
                              {tDone ? '✓' : ''}
                            </div>
                            <span className={`text-sm flex-1 ${tDone ? 'line-through' : ''}`}
                              style={{ color: tDone ? 'var(--text-muted)' : 'var(--text-secondary)', lineHeight: 1.5 }}>
                              {topic}
                            </span>
                            <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                              {studyMins > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold"
                                  style={{ background: 'var(--accent-subtle)', color: 'var(--accent-text)', fontFamily: 'var(--font-mono)' }}>
                                  {studyMins}m
                                </span>
                              )}
                              <ConfidenceRating topicKey={tKey} size={12} />
                              <button
                                onClick={() => startTimer(tKey, topic.substring(0, 60))}
                                className="p-1 rounded-md border-0 bg-transparent cursor-pointer transition-all hover:scale-110"
                                title="Start studying this topic"
                                style={{ color: 'var(--accent-text)' }}>
                                <Icons.Play size={13} />
                              </button>
                            </div>
                          </div>
                          {/* Inline Notes */}
                          <div className="px-3 pb-2">
                            <TopicNotes topicKey={tKey} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-3 flex items-center gap-1.5 flex-wrap" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <span className="text-label mr-1">Resources:</span>
                    {sec.resources.map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs px-2.5 py-1 rounded-full no-underline font-medium"
                        style={{ background: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
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

