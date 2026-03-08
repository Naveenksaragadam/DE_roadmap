import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { resourcesData, resourceTypeIcons, resourceTypeLabels } from '../data/resourcesData';

function getIcon(n) {
  const f = n.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return Icons[f] || Icons.Circle;
}

const typeFilters = ['all', 'book', 'course', 'practice', 'docs', 'video'];
const tierFilters = [
  { id: 'all', label: 'All Tiers' },
  { id: 'tier-1', label: 'Tier 1', color: 'var(--tier-1)' },
  { id: 'tier-2', label: 'Tier 2', color: 'var(--tier-2)' },
  { id: 'tier-3', label: 'Tier 3', color: 'var(--tier-3)' },
  { id: 'tier-4', label: 'Tier 4', color: 'var(--tier-4)' },
];

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function Resources() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    resourcesData.filter(r => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (tierFilter !== 'all' && r.tier !== tierFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
      }
      return true;
    }), [typeFilter, tierFilter, search]);

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="heading-xl mb-2">Resources</h1>
        <p className="text-body">Curated books, courses, and tools for your DE journey.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="mb-8 flex flex-col gap-3">
        <div className="card flex items-center gap-3 px-4 py-2.5" style={{ borderRadius: 'var(--radius-lg)' }}>
          <Icons.Search size={15} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {typeFilters.map(type => (
            <button key={type} onClick={() => setTypeFilter(type)}
              className={`badge cursor-pointer transition-all ${typeFilter === type ? '' : ''}`}
              style={{
                background: typeFilter === type ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                border: `1px solid ${typeFilter === type ? 'var(--accent-muted)' : 'var(--border-default)'}`,
                color: typeFilter === type ? 'var(--accent-text)' : 'var(--text-muted)',
                padding: '4px 12px', textTransform: 'capitalize',
              }}>
              {type === 'all' ? 'All Types' : resourceTypeLabels[type] || type}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {tierFilters.map(tf => (
            <button key={tf.id} onClick={() => setTierFilter(tf.id)}
              className="badge cursor-pointer transition-all"
              style={{
                background: tierFilter === tf.id ? (tf.color ? `color-mix(in srgb, ${tf.color} 10%, transparent)` : 'var(--accent-subtle)') : 'var(--bg-surface)',
                border: `1px solid ${tierFilter === tf.id ? (tf.color || 'var(--accent-muted)') : 'var(--border-default)'}`,
                color: tierFilter === tf.id ? (tf.color || 'var(--accent-text)') : 'var(--text-muted)',
                padding: '4px 12px',
              }}>
              {tf.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="text-caption mb-4">
        {filtered.length} resource{filtered.length !== 1 ? 's' : ''}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(r => {
          const TypeIcon = getIcon(resourceTypeIcons[r.type] || 'circle');
          const tc = tierFilters.find(t => t.id === r.tier)?.color || 'var(--accent)';
          return (
            <motion.a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
              className="card card-interactive p-5 no-underline block" variants={fadeUp}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${tc} 10%, transparent)` }}>
                  <TypeIcon size={16} style={{ color: tc }} />
                </div>
                <Icons.ExternalLink size={13} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 className="heading-md mb-0.5" style={{ fontSize: 14 }}>{r.title}</h3>
              <div className="text-caption mb-2">{String(r.author)}</div>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {String(r.description)}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge" style={{ background: `color-mix(in srgb, ${tc} 10%, transparent)`, color: tc }}>
                  {r.tier.replace('-', ' ')}
                </span>
                <span className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-text)' }}>
                  {resourceTypeLabels[r.type]}
                </span>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: 5 }, (_, j) => (
                    <Icons.Star key={j} size={10} fill={j < r.rating ? 'var(--tier-3)' : 'transparent'}
                      stroke={j < r.rating ? 'var(--tier-3)' : 'var(--border-strong)'} />
                  ))}
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Icons.SearchX size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          <p className="text-body text-sm">No resources match your filters.</p>
        </div>
      )}
    </motion.div>
  );
}
