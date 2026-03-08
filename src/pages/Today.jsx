import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, Flame, Play, CheckCircle, AlertCircle, Edit3, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useProgress } from '../hooks/useProgress';
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

function getSectionLabel(topicKey) {
  const parts = topicKey.split('-').map(Number);
  if (parts.length >= 2) {
    const [ti, si] = parts;
    return roadmapData[ti]?.sections[si]?.title || '';
  }
  return '';
}

export default function Today() {
  const { state, setDailyGoal, startTimer } = useApp();
  const { overallPercent } = useProgress();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = state.studyLogs[todayStr] || [];
  const todayGoal = state.dailyGoals[todayStr] || { targetMinutes: 60, targetTopics: 3 };

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalMinutes, setGoalMinutes] = useState(todayGoal.targetMinutes);
  const [goalTopics, setGoalTopics] = useState(todayGoal.targetTopics);

  const todayMinutes = todayLogs.reduce((sum, l) => sum + (l.duration || 0), 0);
  const todayTopicKeys = new Set(todayLogs.map(l => l.topicKey));

  // Review queue: low confidence or stale topics
  const reviewQueue = useMemo(() => {
    const items = [];
    roadmapData.forEach((tier, ti) => {
      tier.sections.forEach((sec, si) => {
        sec.topics.forEach((topic, idx) => {
          const key = `${ti}-${si}-${idx}`;
          const conf = state.confidence[key] || 0;
          const isDone = state.topicProgress[key];
          // Show topics with low confidence OR not yet touched
          if (conf > 0 && conf <= 2) {
            items.push({ key, topic, section: sec.title, tier: tier.tier, confidence: conf, color: tier.color });
          }
        });
      });
    });
    return items.slice(0, 8);
  }, [state.confidence, state.topicProgress]);

  // Suggested next topics (uncompleted, not studied today)
  const nextTopics = useMemo(() => {
    const items = [];
    for (const tier of roadmapData) {
      const ti = roadmapData.indexOf(tier);
      for (const sec of tier.sections) {
        const si = tier.sections.indexOf(sec);
        for (let idx = 0; idx < sec.topics.length; idx++) {
          const key = `${ti}-${si}-${idx}`;
          if (!state.topicProgress[key] && !todayTopicKeys.has(key)) {
            items.push({ key, topic: sec.topics[idx], section: sec.title, tier: tier.tier, color: tier.color });
            if (items.length >= 5) return items;
          }
        }
      }
    }
    return items;
  }, [state.topicProgress, todayTopicKeys]);

  const saveGoal = () => {
    setDailyGoal(todayStr, { targetMinutes: goalMinutes, targetTopics: goalTopics });
    setEditingGoal(false);
  };

  const minutePercent = Math.min(100, Math.round((todayMinutes / todayGoal.targetMinutes) * 100));
  const topicPercent = Math.min(100, Math.round((todayTopicKeys.size / todayGoal.targetTopics) * 100));

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="heading-xl mb-2">Today</h1>
        <p className="text-body">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        {/* Time Studied */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} style={{ color: 'var(--accent-text)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Time Studied</span>
          </div>
          <div className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {todayMinutes}<span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}> / {todayGoal.targetMinutes}m</span>
          </div>
          <div className="progress-track" style={{ height: 4 }}>
            <div className="progress-fill" style={{ width: `${minutePercent}%`, background: 'var(--accent)' }} />
          </div>
        </div>

        {/* Topics Touched */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} style={{ color: 'var(--tier-2)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Topics Touched</span>
          </div>
          <div className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {todayTopicKeys.size}<span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}> / {todayGoal.targetTopics}</span>
          </div>
          <div className="progress-track" style={{ height: 4 }}>
            <div className="progress-fill" style={{ width: `${topicPercent}%`, background: 'var(--tier-2)' }} />
          </div>
        </div>

        {/* Streak */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={16} style={{ color: '#f97316' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Streak</span>
          </div>
          <div className="text-2xl font-extrabold" style={{ color: '#f97316', fontFamily: 'var(--font-mono)' }}>
            {state.streak.currentStreak} <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>days</span>
          </div>
        </div>

        {/* Overall */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} style={{ color: 'var(--success)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Overall</span>
          </div>
          <div className="text-2xl font-extrabold" style={{ color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
            {overallPercent}%
          </div>
        </div>
      </motion.div>

      {/* Daily Goal Editor */}
      <motion.div variants={fadeUp} className="card p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="heading-md m-0" style={{ fontSize: 14 }}>Daily Goal</h3>
          {editingGoal ? (
            <button onClick={saveGoal}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
              style={{ background: 'var(--accent)', color: 'white', border: 'none', fontFamily: 'var(--font-sans)' }}>
              <Save size={12} /> Save
            </button>
          ) : (
            <button onClick={() => setEditingGoal(true)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
              style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
              <Edit3 size={12} /> Edit
            </button>
          )}
        </div>
        {editingGoal ? (
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Minutes:
              <input type="number" value={goalMinutes} onChange={(e) => setGoalMinutes(Number(e.target.value))} min={5} max={480}
                className="w-20 px-2 py-1 rounded-md text-sm"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }} />
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Topics:
              <input type="number" value={goalTopics} onChange={(e) => setGoalTopics(Number(e.target.value))} min={1} max={20}
                className="w-20 px-2 py-1 rounded-md text-sm"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }} />
            </label>
          </div>
        ) : (
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Study <strong style={{ color: 'var(--text-primary)' }}>{todayGoal.targetMinutes} minutes</strong> across <strong style={{ color: 'var(--text-primary)' }}>{todayGoal.targetTopics} topics</strong> today.
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Activity */}
        <motion.div variants={fadeUp} className="card p-5">
          <h3 className="heading-md mb-4" style={{ fontSize: 14 }}>Today's Sessions</h3>
          {todayLogs.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No study sessions yet. Pick a topic below and start the timer!
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {todayLogs.map((log, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--accent-subtle)' }}>
                    <Clock size={14} style={{ color: 'var(--accent-text)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {log.topicLabel || getTopicLabel(log.topicKey)}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="text-sm font-bold" style={{ color: 'var(--accent-text)', fontFamily: 'var(--font-mono)' }}>
                    {log.duration}m
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Review Queue */}
        <motion.div variants={fadeUp} className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={16} style={{ color: 'var(--tier-1)' }} />
            <h3 className="heading-md m-0" style={{ fontSize: 14 }}>Review Queue</h3>
          </div>
          {reviewQueue.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No topics need review yet. Rate your confidence on topics in the Roadmap to populate this queue.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {reviewQueue.map((item) => (
                <div key={item.key} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:opacity-80"
                  style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)' }}
                  onClick={() => startTimer(item.key, item.topic.substring(0, 60))}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.topic.substring(0, 60)}</div>
                    <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{item.section}</div>
                  </div>
                  <Play size={12} style={{ color: 'var(--accent-text)', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Suggested Next Topics */}
      <motion.div variants={fadeUp} className="card p-5 mt-6">
        <h3 className="heading-md mb-4" style={{ fontSize: 14 }}>Up Next</h3>
        {nextTopics.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>All topics completed! 🎉</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {nextTopics.map((item) => (
              <div key={item.key} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:opacity-80"
                style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)' }}
                onClick={() => startTimer(item.key, item.topic.substring(0, 60))}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.topic.substring(0, 60)}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{item.section} · {item.tier}</div>
                </div>
                <Play size={12} style={{ color: 'var(--accent-text)', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
