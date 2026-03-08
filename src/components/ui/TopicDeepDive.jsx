import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';

// Renders a deep-dive panel for a topic with Tutorial / Quick Notes tabs
export default function TopicDeepDive({ content, tierColor }) {
  const [activeTab, setActiveTab] = useState('tutorial');

  if (!content) return null;

  const tabs = [
    { id: 'tutorial', label: 'Tutorial', icon: Icons.BookOpen },
    { id: 'quicknotes', label: 'Quick Notes', icon: Icons.Zap },
  ];

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ overflow: 'hidden' }}
    >
      <div className="rounded-lg mt-2 mb-1" style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
      }}>
        {/* Tab Header */}
        <div className="flex items-center gap-1 p-2" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-inset)' }}>
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border-0 cursor-pointer transition-all"
                style={{
                  background: isActive ? (tierColor || 'var(--accent)') : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                }}
              >
                <TabIcon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'tutorial' && (
            <div className="flex flex-col gap-4">
              {/* Explanation */}
              {content.tutorial?.explanation && (
                <div>
                  {content.tutorial.explanation.map((para, i) => (
                    <p key={i} className="text-sm m-0 mb-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {/* Code Examples */}
              {content.tutorial?.codeExamples?.length > 0 && (
                <div className="flex flex-col gap-3">
                  {content.tutorial.codeExamples.map((ex, i) => (
                    <div key={i}>
                      {ex.description && (
                        <div className="text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: tierColor || 'var(--accent)' }}>
                          <Icons.Code size={12} />
                          {ex.description}
                        </div>
                      )}
                      <pre className="rounded-lg p-3.5 m-0 overflow-x-auto text-xs" style={{
                        background: 'var(--bg-inset)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.7,
                        fontFamily: 'var(--font-mono)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}>
                        <code>{ex.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {/* Key Takeaways */}
              {content.tutorial?.keyTakeaways?.length > 0 && (
                <div className="rounded-lg p-3.5" style={{ background: `${tierColor || 'var(--accent)'}08`, border: `1px solid ${tierColor || 'var(--accent)'}20` }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icons.Lightbulb size={13} style={{ color: tierColor || 'var(--accent)' }} />
                    <span className="text-xs font-bold" style={{ color: tierColor || 'var(--accent)' }}>Key Takeaways</span>
                  </div>
                  <ul className="m-0 flex flex-col gap-1" style={{ paddingLeft: 18 }}>
                    {content.tutorial.keyTakeaways.map((t, i) => (
                      <li key={i} className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quicknotes' && (
            <div className="flex flex-col gap-4">
              {/* Summary */}
              {content.crashCourse?.summary && (
                <p className="text-sm m-0" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  {content.crashCourse.summary}
                </p>
              )}

              {/* Quick Facts */}
              {content.crashCourse?.quickFacts?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icons.ListChecks size={13} style={{ color: '#3b82f6' }} />
                    <span className="text-xs font-bold" style={{ color: '#3b82f6' }}>Quick Facts</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {content.crashCourse.quickFacts.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        <span style={{ color: tierColor || 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>▸</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {content.crashCourse?.tips?.length > 0 && (
                <div className="rounded-lg p-3.5" style={{ background: '#eab30808', border: '1px solid #eab30820' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icons.Star size={13} style={{ color: '#eab308' }} />
                    <span className="text-xs font-bold" style={{ color: '#eab308' }}>Pro Tips</span>
                  </div>
                  <ul className="m-0 flex flex-col gap-1" style={{ paddingLeft: 18 }}>
                    {content.crashCourse.tips.map((t, i) => (
                      <li key={i} className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
