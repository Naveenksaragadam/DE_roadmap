import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { crashCourseData } from '../data/crashCourseData';
import { roadmapData } from '../data/roadmapData';

function getIcon(name) {
  const f = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return Icons[f] || Icons.Circle;
}

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

// Get tier color from roadmapData
function getTierColor(tierId) {
  const tier = roadmapData.find(t => t.id === tierId);
  return tier?.color || 'var(--accent)';
}

export default function CrashCourse() {
  const [search, setSearch] = useState('');
  const [activeTier, setActiveTier] = useState('all');
  const [expandedIds, setExpandedIds] = useState({});

  const tierFilters = [
    { id: 'all', label: 'All', color: 'var(--accent)' },
    ...roadmapData.map(t => ({ id: t.id, label: t.tier, color: t.color })),
  ];

  const filtered = useMemo(() => {
    return crashCourseData.filter(cc => {
      const matchTier = activeTier === 'all' || cc.tier === activeTier;
      const matchSearch = !search ||
        cc.title.toLowerCase().includes(search.toLowerCase()) ||
        cc.keyConceptsList.some(c => c.toLowerCase().includes(search.toLowerCase()));
      return matchTier && matchSearch;
    });
  }, [search, activeTier]);

  const toggleExpand = (id, section) => {
    setExpandedIds(p => ({
      ...p,
      [`${id}-${section}`]: !p[`${id}-${section}`],
    }));
  };

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-subtle)' }}>
            <Icons.BookOpen size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 className="heading-xl m-0" style={{ fontSize: 28 }}>Crash Course Notes</h1>
            <p className="text-caption m-0">Quick-reference study notes for every major DE topic</p>
          </div>
        </div>
      </motion.div>

      {/* Search + Filters */}
      <motion.div variants={fadeUp} className="card p-4 mb-6">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Icons.Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search notes, concepts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input w-full"
              style={{ paddingLeft: 36 }}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {tierFilters.map(t => (
              <button key={t.id}
                onClick={() => setActiveTier(t.id)}
                className={`badge cursor-pointer transition-all ${activeTier === t.id ? 'text-white' : ''}`}
                style={activeTier === t.id ? { background: t.color, borderColor: t.color } : {}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-mono" style={{ color: 'var(--accent)' }}>
            {crashCourseData.length}
          </div>
          <div className="text-caption">Topics</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-mono" style={{ color: 'var(--success)' }}>
            {crashCourseData.reduce((acc, cc) => acc + cc.keyConceptsList.length, 0)}
          </div>
          <div className="text-caption">Key Concepts</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-mono" style={{ color: '#ec4899' }}>
            {crashCourseData.reduce((acc, cc) => acc + cc.commonMistakes.length, 0)}
          </div>
          <div className="text-caption">Pitfalls Covered</div>
        </div>
      </motion.div>

      {/* Crash Course Cards */}
      {filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-16">
          <Icons.SearchX size={40} style={{ color: 'var(--text-muted)', margin: '0 auto' }} />
          <p className="heading-md mt-4">No crash courses found</p>
          <p className="text-body">Try adjusting your search or filters.</p>
        </motion.div>
      ) : (
        filtered.map(cc => {
          const SectionIcon = getIcon(cc.icon);
          const tierColor = getTierColor(cc.tier);
          const isKeysOpen = expandedIds[`${cc.id}-keys`];
          const isRefOpen = expandedIds[`${cc.id}-ref`];
          const isMistakesOpen = expandedIds[`${cc.id}-mistakes`];

          return (
            <motion.div key={cc.id} variants={fadeUp} className="card mb-4 overflow-hidden">
              {/* Title */}
              <div className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${tierColor}15` }}>
                  <SectionIcon size={18} style={{ color: tierColor }} />
                </div>
                <div className="flex-1">
                  <h3 className="heading-md m-0">{cc.title}</h3>
                  <span className="badge mt-1" style={{ background: `${tierColor}20`, color: tierColor, borderColor: `${tierColor}40` }}>
                    {roadmapData.find(t => t.id === cc.tier)?.tier || cc.tier}
                  </span>
                </div>
              </div>

              <div className="px-5 pb-5 flex flex-col gap-3" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-inset)' }}>

                {/* Key Concepts */}
                <div className="mt-4">
                  <button onClick={() => toggleExpand(cc.id, 'keys')}
                    className="flex items-center gap-2 w-full text-left bg-transparent border-0 cursor-pointer p-0 mb-2"
                    style={{ color: 'var(--text-primary)' }}>
                    <Icons.Lightbulb size={15} style={{ color: '#eab308' }} />
                    <span className="text-label flex-1">Key Concepts ({cc.keyConceptsList.length})</span>
                    <Icons.ChevronDown size={14} className="transition-transform" style={{ transform: isKeysOpen ? 'rotate(180deg)' : 'none', color: 'var(--text-muted)' }} />
                  </button>
                  <AnimatePresence>
                    {isKeysOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                        <ul className="flex flex-col gap-1.5 m-0" style={{ paddingLeft: 20 }}>
                          {cc.keyConceptsList.map((c, i) => (
                            <li key={i} className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c}</li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quick Reference */}
                <div>
                  <button onClick={() => toggleExpand(cc.id, 'ref')}
                    className="flex items-center gap-2 w-full text-left bg-transparent border-0 cursor-pointer p-0 mb-2"
                    style={{ color: 'var(--text-primary)' }}>
                    <Icons.Terminal size={15} style={{ color: '#3b82f6' }} />
                    <span className="text-label flex-1">Quick Reference ({cc.quickReference.length})</span>
                    <Icons.ChevronDown size={14} className="transition-transform" style={{ transform: isRefOpen ? 'rotate(180deg)' : 'none', color: 'var(--text-muted)' }} />
                  </button>
                  <AnimatePresence>
                    {isRefOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                        <div className="flex flex-col gap-2">
                          {cc.quickReference.map((r, i) => (
                            <div key={i} className="rounded-lg p-3 text-xs font-mono"
                              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {r}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Common Mistakes */}
                <div>
                  <button onClick={() => toggleExpand(cc.id, 'mistakes')}
                    className="flex items-center gap-2 w-full text-left bg-transparent border-0 cursor-pointer p-0 mb-2"
                    style={{ color: 'var(--text-primary)' }}>
                    <Icons.AlertTriangle size={15} style={{ color: '#ef4444' }} />
                    <span className="text-label flex-1">Common Mistakes ({cc.commonMistakes.length})</span>
                    <Icons.ChevronDown size={14} className="transition-transform" style={{ transform: isMistakesOpen ? 'rotate(180deg)' : 'none', color: 'var(--text-muted)' }} />
                  </button>
                  <AnimatePresence>
                    {isMistakesOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                        <ul className="flex flex-col gap-1.5 m-0" style={{ paddingLeft: 20 }}>
                          {cc.commonMistakes.map((m, i) => (
                            <li key={i} className="text-sm" style={{ color: '#ef4444', lineHeight: 1.6 }}>
                              <span style={{ color: 'var(--text-secondary)' }}>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Real World Example */}
                <div className="rounded-lg p-4 mt-1" style={{ background: `${tierColor}08`, border: `1px solid ${tierColor}20` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.Briefcase size={14} style={{ color: tierColor }} />
                    <span className="text-label" style={{ color: tierColor }}>Real-World Example</span>
                  </div>
                  <p className="text-sm m-0" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{cc.realWorldExample}</p>
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </motion.div>
  );
}
