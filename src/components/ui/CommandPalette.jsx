import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { roadmapData } from '../../data/roadmapData';

// Build flat search index
const searchItems = roadmapData.flatMap((tier, ti) =>
  tier.sections.map((sec, si) => ({
    label: sec.title,
    tier: tier.tier,
    color: tier.color,
    route: `/tier/${tier.id}`,
    key: `${ti}-${si}`,
  }))
);

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filtered = query.trim()
    ? searchItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.tier.toLowerCase().includes(query.toLowerCase())
      )
    : searchItems;

  const handleSelect = (item) => {
    navigate(item.route);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && filtered.length > 0) {
      handleSelect(filtered[0]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-[20%] left-1/2 z-50 w-full max-w-lg"
            style={{ transform: 'translateX(-50%)' }}
          >
            <div className="glass-card overflow-hidden" style={{ borderRadius: 20 }}>
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <Search size={18} className="text-[var(--color-text-muted)]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search topics, tiers…"
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)' }}
                />
                <kbd className="px-2 py-1 rounded text-[10px] font-mono" style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-muted)',
                }}>ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-72 overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)]">
                    No results found
                  </div>
                ) : (
                  filtered.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-3 px-5 py-3 text-left cursor-pointer transition-all duration-150 hover:bg-[var(--color-bg-surface-hover)]"
                      style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)' }}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: item.color }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{item.tier}</div>
                      </div>
                      <ArrowRight size={14} className="text-[var(--color-text-muted)]" />
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
