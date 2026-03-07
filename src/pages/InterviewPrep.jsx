import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { interviewData } from '../data/interviewData';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';

function getIcon(n) {
  const f = n.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return Icons[f] || Icons.Circle;
}

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function InterviewPrep() {
  const { state, toggleInterview } = useApp();
  const { addToast } = useToast();
  const categories = Object.entries(interviewData);

  const handleToggle = (id, text) => {
    const willCheck = !state.progress[`interview-${id}`];
    toggleInterview(`interview-${id}`);
    if (willCheck) addToast(`Checked: ${text.slice(0, 40)}${text.length > 40 ? '…' : ''}`);
  };

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="heading-xl mb-2">Interview Prep</h1>
        <p className="text-body">Behavioral, system design, and coding — structured prep for every round.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 grid-responsive">
        {categories.map(([key, cat]) => {
          const CatIcon = getIcon(cat.icon);
          const checked = cat.items.filter(item => state.progress[`interview-${item.id}`]).length;
          const total = cat.items.length;
          const pct = Math.round((checked / total) * 100);

          return (
            <motion.div key={key} variants={fadeUp} className="card overflow-hidden flex flex-col">
              <div className="p-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: `color-mix(in srgb, ${cat.color} 10%, transparent)` }}>
                    <CatIcon size={18} style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="heading-md m-0" style={{ fontSize: 14 }}>{cat.title}</h2>
                    <div className="text-caption">{checked}/{total} complete</div>
                  </div>
                </div>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{cat.description}</p>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: cat.color }} />
                </div>
              </div>

              <div className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 340 }}>
                {cat.items.map(item => {
                  const done = state.progress[`interview-${item.id}`];
                  return (
                    <div key={item.id}
                      className="flex items-start gap-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-colors"
                      style={{ background: done ? 'var(--success-subtle)' : 'transparent' }}
                      onClick={() => handleToggle(item.id, item.text)}>
                      <div className={`checkbox ${done ? 'checked' : ''}`}
                        style={done ? { background: cat.color, borderColor: cat.color } : { width: 18, height: 18, borderRadius: 5 }}>
                        {done ? '✓' : ''}
                      </div>
                      <span className={`text-xs leading-relaxed ${done ? 'line-through' : ''}`}
                        style={{ color: done ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                        {item.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-4" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-inset)' }}>
                <div className="text-label mb-2">💡 Tips</div>
                <ul className="m-0 pl-4 flex flex-col gap-1">
                  {cat.tips.slice(0, 3).map((tip, i) => (
                    <li key={i} className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tip}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
