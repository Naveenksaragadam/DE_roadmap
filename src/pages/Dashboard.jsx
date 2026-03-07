import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Flame, TrendingUp, Target, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useProgress } from '../hooks/useProgress';
import ProgressRing from '../components/ui/ProgressRing';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function StreakHeatmap({ dates }) {
  // Generate last 7 weeks (49 days)
  const today = new Date();
  const days = [];
  for (let i = 48; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    days.push({ date: iso, active: dates.includes(iso) });
  }
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex gap-1.5">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1.5">
          {week.map((day) => (
            <div
              key={day.date}
              title={day.date}
              className="w-4 h-4 rounded-sm transition-colors"
              style={{
                background: day.active
                  ? 'var(--color-accent-purple)'
                  : 'rgba(255,255,255,0.04)',
                border: day.active
                  ? '1px solid rgba(124,58,237,0.4)'
                  : '1px solid rgba(255,255,255,0.03)',
                boxShadow: day.active ? '0 0 6px rgba(124,58,237,0.3)' : 'none',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card px-4 py-2.5 text-xs" style={{ borderRadius: 12 }}>
        <div className="font-bold text-[var(--color-text-primary)]">{data.name}</div>
        <div className="text-[var(--color-text-muted)]">
          {data.completed}/{data.total} sections
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { state } = useApp();
  const { overallPercent, tierProgress, completedSections, totalSections, recentlyCompleted } = useProgress();

  const chartData = tierProgress.map((tp) => ({
    name: tp.label,
    completed: tp.completed,
    remaining: tp.total - tp.completed,
    total: tp.total,
    color: tp.color,
  }));

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight gradient-text mb-2">Dashboard</h1>
        <p className="text-[var(--color-text-secondary)]">
          Track your progress, maintain streaks, and stay motivated.
        </p>
      </motion.div>

      {/* Top Stats Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {/* Progress Ring */}
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <ProgressRing value={overallPercent} size={140} strokeWidth={10} color="gradient" label="Overall" />
          <div className="text-sm text-[var(--color-text-muted)] mt-3 font-medium">
            {completedSections} of {totalSections} sections complete
          </div>
        </div>

        {/* Streak */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={18} style={{ color: '#ff9933' }} />
            <span className="text-sm font-bold text-[var(--color-text-primary)]">Study Streak</span>
          </div>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-black" style={{ color: '#ff9933', fontFamily: 'var(--font-mono)' }}>
              {state.streak.currentStreak}
            </span>
            <span className="text-sm text-[var(--color-text-muted)]">day streak</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-4">
            <TrendingUp size={14} />
            Longest: {state.streak.longestStreak} days
          </div>
          <StreakHeatmap dates={state.streak.dates} />
        </div>

        {/* Quick Stats */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <Target size={18} style={{ color: 'var(--color-accent-purple)' }} />
            <span className="text-sm font-bold text-[var(--color-text-primary)]">Quick Stats</span>
          </div>
          {tierProgress.map((tp) => (
            <div key={tp.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--color-text-secondary)] font-medium">{tp.name}</span>
                <span className="font-bold" style={{ color: tp.color }}>{tp.percent}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${tp.percent}%`, background: tp.color }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bar Chart */}
      <motion.div variants={fadeUp} className="glass-card p-6 mb-10">
        <h3 className="text-base font-bold mb-6">Tier Breakdown</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="completed" radius={[8, 8, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
            <Bar dataKey="remaining" radius={[8, 8, 0, 0]} maxBarSize={40} fill="rgba(255,255,255,0.04)" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recently Completed */}
      <motion.div variants={fadeUp} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <CheckCircle size={18} style={{ color: '#2eb85c' }} />
          <h3 className="text-base font-bold m-0">Recently Completed</h3>
        </div>
        {recentlyCompleted.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            No sections completed yet. Head to the <a href="/roadmap" className="text-[var(--color-accent-purple)] no-underline">Roadmap</a> to start!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentlyCompleted.map((item) => (
              <div key={item.key} className="flex items-center gap-3 py-2 px-3 rounded-xl" style={{
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-subtle)',
              }}>
                <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                <span className="text-sm text-[var(--color-text-primary)] font-medium">{item.title}</span>
                <span className="text-xs text-[var(--color-text-muted)] ml-auto">{item.tier}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
