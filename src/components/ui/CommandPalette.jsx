import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { roadmapData } from '../../data/roadmapData';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const items = useMemo(() => {
    const all = [];
    roadmapData.forEach((tier) => {
      tier.sections.forEach((sec) => {
        all.push({ title: sec.title, tier: tier.tier, tierId: tier.id, color: tier.color });
      });
    });
    return all;
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return items.slice(0, 8);
    const q = query.toLowerCase();
    return items.filter((i) => i.title.toLowerCase().includes(q)).slice(0, 8);
  }, [query, items]);

  const handleSelect = (item) => {
    navigate(`/tier/${item.tierId}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'var(--bg-overlay)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[15%] left-1/2 z-50 w-full max-w-lg -translate-x-1/2"
          >
            <div className="card" style={{ borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border-default)' }}>
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search topics…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && filtered.length) handleSelect(filtered[0]); }}
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
                />
                <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{
                  background: 'var(--bg-inset)', border: '1px solid var(--border-default)',
                  color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                }}>ESC</kbd>
              </div>
              <div className="max-h-[320px] overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <div className="px-4 py-6 text-center text-caption">No matching topics</div>
                ) : (
                  filtered.map((item, i) => (
                    <button key={i} onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer bg-transparent border-none text-left transition-colors"
                      style={{ fontFamily: 'var(--font-sans)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      <div className="flex-1">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</span>
                      </div>
                      <span className="text-caption">{item.tier}</span>
                      <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
