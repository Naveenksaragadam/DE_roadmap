import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { interviewData } from '../data/interviewData';
import { useApp } from '../context/AppContext';

function getIcon(name) {
  const f = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return Icons[f] || Icons.Circle;
}

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function InterviewPrep() {
  const { state, toggleInterview } = useApp();
  const categories = Object.entries(interviewData);

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fadeUp} className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight gradient-text mb-2">Interview Prep</h1>
        <p className="text-[var(--color-text-secondary)]">
          Behavioral, system design, and coding — structured prep for every round.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {categories.map(([key, category]) => {
          const CatIcon = getIcon(category.icon);
          const checkedCount = category.items.filter(item => state.progress[`interview-${item.id}`]).length;
          const total = category.items.length;
          const pct = Math.round((checkedCount / total) * 100);

          return (
            <motion.div key={key} variants={fadeUp} className="glass-card overflow-hidden flex flex-col">
              {/* Category Header */}
              <div className="p-5 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${category.color}15`, border: `1px solid ${category.color}25` }}>
                    <CatIcon size={20} style={{ color: category.color }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-bold m-0">{category.title}</h2>
                    <div className="text-xs text-[var(--color-text-muted)]">{checkedCount}/{total} complete</div>
                  </div>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed m-0">{category.description}</p>
                <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: category.color }} />
                </div>
              </div>

              {/* Checklist Items */}
              <div className="flex-1 p-4 flex flex-col gap-1.5 overflow-y-auto" style={{ maxHeight: 360 }}>
                {category.items.map((item) => {
                  const checked = state.progress[`interview-${item.id}`];
                  return (
                    <div key={item.id}
                      className="flex items-start gap-3 py-2 px-3 rounded-xl cursor-pointer transition-colors hover:bg-[var(--color-bg-surface-hover)]"
                      style={{ background: 'var(--color-bg-surface)', border: '1px solid rgba(255,255,255,0.03)' }}
                      onClick={() => toggleInterview(`interview-${item.id}`)}
                    >
                      <div className="w-5 h-5 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0 text-xs transition-all"
                        style={{
                          background: checked ? category.color : 'transparent',
                          border: `2px solid ${checked ? category.color : 'rgba(255,255,255,0.1)'}`,
                          color: checked ? '#fff' : 'transparent',
                        }}>
                        {checked ? '✓' : ''}
                      </div>
                      <span className={`text-xs leading-relaxed ${checked ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-secondary)]'}`}>
                        {item.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Tips */}
              <div className="p-4 border-t" style={{ borderColor: 'var(--color-border-subtle)', background: 'rgba(0,0,0,0.1)' }}>
                <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                  💡 Tips
                </div>
                <ul className="m-0 pl-4 flex flex-col gap-1">
                  {category.tips.slice(0, 3).map((tip, i) => (
                    <li key={i} className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{tip}</li>
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
