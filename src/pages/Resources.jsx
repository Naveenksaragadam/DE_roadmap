import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { resourcesData, resourceTypeIcons, resourceTypeLabels } from '../data/resourcesData';

function getIcon(name) {
  const f = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return Icons[f] || Icons.Circle;
}

const typeFilters = ['all', 'book', 'course', 'practice', 'docs', 'video'];
const tierFilters = [
  { id: 'all', label: 'All Tiers' },
  { id: 'tier-1', label: 'Tier 1', color: '#ff4d4d' },
  { id: 'tier-2', label: 'Tier 2', color: '#ff9933' },
  { id: 'tier-3', label: 'Tier 3', color: '#e6b800' },
  { id: 'tier-4', label: 'Tier 4', color: '#2eb85c' },
];

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function Resources() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    resourcesData.filter((r) => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (tierFilter !== 'all' && r.tier !== tierFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.includes(q));
      }
      return true;
    }), [typeFilter, tierFilter, search]);

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight gradient-text mb-2">Resources</h1>
        <p className="text-[var(--color-text-secondary)]">Curated books, courses, and tools for your DE journey.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="mb-8 flex flex-col gap-4">
        <div className="glass-card flex items-center gap-3 px-4 py-3" style={{ borderRadius: 16 }}>
          <Icons.Search size={16} className="text-[var(--color-text-muted)]" />
          <input type="text" placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm" style={{ color: 'var(--color-text-primary)' }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {typeFilters.map((type) => {
            const active = typeFilter === type;
            return (<button key={type} onClick={() => setTypeFilter(type)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-all capitalize"
              style={{ background: active ? 'rgba(124,58,237,0.15)' : 'var(--color-bg-surface)', border: `1px solid ${active ? 'rgba(124,58,237,0.3)' : 'var(--color-border-subtle)'}`, color: active ? 'var(--color-accent-purple)' : 'var(--color-text-muted)' }}>
              {type === 'all' ? 'All Types' : resourceTypeLabels[type] || type}
            </button>);
          })}
        </div>
        <div className="flex gap-2 flex-wrap">
          {tierFilters.map((tf) => {
            const active = tierFilter === tf.id;
            return (<button key={tf.id} onClick={() => setTierFilter(tf.id)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-all"
              style={{ background: active ? `${tf.color || '#7c3aed'}15` : 'var(--color-bg-surface)', border: `1px solid ${active ? `${tf.color || '#7c3aed'}30` : 'var(--color-border-subtle)'}`, color: active ? (tf.color || '#7c3aed') : 'var(--color-text-muted)' }}>
              {tf.label}
            </button>);
          })}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="text-xs text-[var(--color-text-muted)] mb-5">
        {filtered.length} resource{filtered.length !== 1 ? 's' : ''} found
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => {
          const TypeIcon = getIcon(resourceTypeIcons[r.type] || 'circle');
          const tc = tierFilters.find(t => t.id === r.tier)?.color || '#7c3aed';
          return (
            <motion.a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
              className="glass-card glass-card-interactive p-5 no-underline block" variants={fadeUp}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${tc}10`, border: `1px solid ${tc}20` }}>
                  <TypeIcon size={18} style={{ color: tc }} />
                </div>
                <Icons.ExternalLink size={14} className="text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">{r.title}</h3>
              <div className="text-xs text-[var(--color-text-muted)] mb-2">{r.author}</div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">{r.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase" style={{ background: `${tc}12`, color: tc, border: `1px solid ${tc}25` }}>
                  {r.tier.replace('-', ' ')}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize" style={{ background: 'rgba(124,58,237,0.08)', color: '#a78bfa' }}>
                  {resourceTypeLabels[r.type]}
                </span>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: 5 }, (_, j) => (
                    <Icons.Star key={j} size={10} fill={j < r.rating ? '#e6b800' : 'transparent'} stroke={j < r.rating ? '#e6b800' : 'rgba(255,255,255,0.1)'} />
                  ))}
                </div>
              </div>
            </motion.a>
          );
        })}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[var(--color-text-muted)]">
          <Icons.SearchX size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">No resources match your filters.</p>
        </div>
      )}
    </motion.div>
  );
}
