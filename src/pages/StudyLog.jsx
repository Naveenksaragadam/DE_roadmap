import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { roadmapData } from '../data/roadmapData';

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

function getTopicLabel(topicKey) {
  const parts = topicKey.split('-').map(Number);
  if (parts.length === 3) {
    const [ti, si, idx] = parts;
    return roadmapData[ti]?.sections[si]?.topics[idx] || topicKey;
  }
  return topicKey;
}

function MinutesHeatmap({ studyLogs }) {
  const today = new Date();
  const days = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const logs = studyLogs[dateStr] || [];
    const minutes = logs.reduce((sum, l) => sum + (l.duration || 0), 0);
    days.push({ date: dateStr, minutes, dayOfWeek: d.getDay() });
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const maxMinutes = Math.max(1, ...days.map(d => d.minutes));

  const getColor = (minutes) => {
    if (minutes === 0) return 'var(--bg-inset)';
    const intensity = Math.min(1, minutes / maxMinutes);
    if (intensity < 0.25) return 'rgba(var(--accent-rgb, 99, 102, 241), 0.2)';
    if (intensity < 0.5) return 'rgba(var(--accent-rgb, 99, 102, 241), 0.4)';
    if (intensity < 0.75) return 'rgba(var(--accent-rgb, 99, 102, 241), 0.6)';
    return 'var(--accent)';
  };

  return (
    <div>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.minutes}m studied`}
                className="w-3 h-3 rounded-sm transition-colors"
                style={{
                  background: day.minutes > 0 ? 'var(--accent)' : 'var(--bg-inset)',
                  opacity: day.minutes > 0 ? Math.max(0.3, Math.min(1, day.minutes / Math.max(maxMinutes, 1))) : 1,
                  border: `1px solid ${day.minutes > 0 ? 'var(--accent)' : 'var(--border-default)'}`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Less</span>
        {[0, 0.3, 0.55, 0.8, 1].map((opacity, i) => (
          <div key={i} className="w-3 h-3 rounded-sm"
            style={{ background: i === 0 ? 'var(--bg-inset)' : 'var(--accent)', opacity: i === 0 ? 1 : opacity, border: `1px solid ${i === 0 ? 'var(--border-default)' : 'var(--accent)'}` }} />
        ))}
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  );
}

export default function StudyLog() {
  const { state } = useApp();
  const [expandedDay, setExpandedDay] = useState(null);

  // Sort dates descending
  const sortedDates = useMemo(() => {
    return Object.keys(state.studyLogs).sort((a, b) => b.localeCompare(a));
  }, [state.studyLogs]);

  // Weekly stats
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekStr = weekStart.toISOString().split('T')[0];

    let totalMinutes = 0;
    let totalSessions = 0;
    const topicsSeen = new Set();

    Object.entries(state.studyLogs).forEach(([date, logs]) => {
      if (date >= weekStr) {
        logs.forEach(log => {
          totalMinutes += log.duration || 0;
          totalSessions++;
          topicsSeen.add(log.topicKey);
        });
      }
    });

    return { totalMinutes, totalSessions, uniqueTopics: topicsSeen.size };
  }, [state.studyLogs]);

  // All-time stats
  const allTimeStats = useMemo(() => {
    let totalMinutes = 0;
    let totalSessions = 0;
    Object.values(state.studyLogs).forEach(logs => {
      logs.forEach(log => {
        totalMinutes += log.duration || 0;
        totalSessions++;
      });
    });
    return { totalMinutes, totalSessions, totalDays: Object.keys(state.studyLogs).length };
  }, [state.studyLogs]);

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="heading-xl mb-2">Study Log</h1>
        <p className="text-body">Your study history and analytics.</p>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="card p-4 text-center">
          <div className="text-xl font-extrabold" style={{ color: 'var(--accent-text)', fontFamily: 'var(--font-mono)' }}>
            {allTimeStats.totalMinutes}
          </div>
          <div className="text-caption">total minutes</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-xl font-extrabold" style={{ color: 'var(--tier-2)', fontFamily: 'var(--font-mono)' }}>
            {allTimeStats.totalSessions}
          </div>
          <div className="text-caption">total sessions</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-xl font-extrabold" style={{ color: 'var(--tier-3)', fontFamily: 'var(--font-mono)' }}>
            {weeklyStats.totalMinutes}
          </div>
          <div className="text-caption">this week (min)</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-xl font-extrabold" style={{ color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
            {allTimeStats.totalDays}
          </div>
          <div className="text-caption">days studied</div>
        </div>
      </motion.div>

      {/* Heatmap */}
      <motion.div variants={fadeUp} className="card p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} style={{ color: 'var(--accent-text)' }} />
          <h3 className="heading-md m-0" style={{ fontSize: 14 }}>Study Activity (Last 12 weeks)</h3>
        </div>
        <MinutesHeatmap studyLogs={state.studyLogs} />
      </motion.div>

      {/* Day-by-day Log */}
      <motion.div variants={fadeUp} className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} style={{ color: 'var(--accent-text)' }} />
          <h3 className="heading-md m-0" style={{ fontSize: 14 }}>Session History</h3>
        </div>
        {sortedDates.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No study sessions logged yet. Start the timer on any topic to begin tracking!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedDates.map((date) => {
              const logs = state.studyLogs[date];
              const dayMinutes = logs.reduce((sum, l) => sum + (l.duration || 0), 0);
              const isOpen = expandedDay === date;

              return (
                <div key={date} className="rounded-lg overflow-hidden"
                  style={{ border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-3 p-3 cursor-pointer transition-colors"
                    style={{ background: 'var(--bg-inset)' }}
                    onClick={() => setExpandedDay(isOpen ? null : date)}>
                    <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-primary)' }}>
                      {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs font-bold" style={{ color: 'var(--accent-text)', fontFamily: 'var(--font-mono)' }}>
                      {dayMinutes}m · {logs.length} sessions
                    </span>
                    {isOpen ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                  {isOpen && (
                    <div className="px-3 pb-3 pt-1 flex flex-col gap-1.5">
                      {logs.map((log, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-md"
                          style={{ background: 'var(--bg-surface)' }}>
                          <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                          <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                            {log.topicLabel || getTopicLabel(log.topicKey)}
                          </span>
                          <span className="text-xs font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            {log.duration}m
                          </span>
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
