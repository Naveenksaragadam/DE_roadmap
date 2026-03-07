import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Flame, TrendingUp, Target, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useProgress } from '../hooks/useProgress';
import ProgressRing from '../components/ui/ProgressRing';

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

function StreakHeatmap({ dates }) {
  const today = new Date();
  const days = [];
  for (let i = 48; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({ date: d.toISOString().split('T')[0], active: dates.includes(d.toISOString().split('T')[0]) });
  }
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div className="flex gap-1.5">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1.5">
          {week.map((day) => (
            <div key={day.date} title={day.date}
              className="w-3.5 h-3.5 rounded-sm transition-colors"
              style={{
                background: day.active ? 'var(--accent)' : 'var(--bg-inset)',
                border: `1px solid ${day.active ? 'var(--accent)' : 'var(--border-default)'}`,
              }} />
          ))}
        </div>
      ))}
    </div>
  );
}

const ChartTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="card px-3 py-2 text-xs" style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{d.name}</div>
        <div className="text-caption">{d.completed}/{d.total} sections</div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { state } = useApp();
  const { overallPercent, tierProgress, completedSections, totalSections, recentlyCompleted } = useProgress();

  const chartData = tierProgress.map(tp => ({
    name: tp.label, completed: tp.completed,
    remaining: tp.total - tp.completed, total: tp.total, color: tp.color,
  }));

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.06 } } }}>
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="heading-xl mb-2">Dashboard</h1>
        <p className="text-body">Track your progress, maintain streaks, and stay motivated.</p>
      </motion.div>

      {/* Top Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6 flex flex-col items-center justify-center">
          <ProgressRing value={overallPercent} size={120} strokeWidth={8} color="var(--accent)" label="Overall" />
          <div className="text-caption mt-3">{completedSections} of {totalSections} sections</div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={16} style={{ color: 'var(--tier-2)' }} />
            <span className="heading-md m-0" style={{ fontSize: 14 }}>Study Streak</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-extrabold text-mono" style={{ color: 'var(--tier-2)' }}>
              {state.streak.currentStreak}
            </span>
            <span className="text-caption">day streak</span>
          </div>
          <div className="flex items-center gap-2 text-caption mb-3">
            <TrendingUp size={12} />
            Longest: {state.streak.longestStreak} days
          </div>
          <StreakHeatmap dates={state.streak.dates} />
        </div>

        <div className="card p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Target size={16} style={{ color: 'var(--accent-text)' }} />
            <span className="heading-md m-0" style={{ fontSize: 14 }}>Tier Progress</span>
          </div>
          {tierProgress.map(tp => (
            <div key={tp.id}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{tp.name}</span>
                <span className="text-mono font-bold" style={{ color: tp.color }}>{tp.percent}%</span>
              </div>
              <div className="progress-track" style={{ height: 4 }}>
                <div className="progress-fill" style={{ width: `${tp.percent}%`, background: tp.color }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div variants={fadeUp} className="card p-6 mb-8">
        <h3 className="heading-md mb-5">Tier breakdown</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<ChartTooltip />} cursor={false} />
            <Bar dataKey="completed" radius={[6, 6, 0, 0]} maxBarSize={36}>
              {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Bar>
            <Bar dataKey="remaining" radius={[6, 6, 0, 0]} maxBarSize={36} fill="var(--bg-inset)" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recently Completed */}
      <motion.div variants={fadeUp} className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={16} style={{ color: 'var(--success)' }} />
          <h3 className="heading-md m-0" style={{ fontSize: 14 }}>Recently completed</h3>
        </div>
        {recentlyCompleted.length === 0 ? (
          <p className="text-body text-sm">No sections completed yet. Head to the Roadmap to start!</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {recentlyCompleted.map(item => (
              <div key={item.key} className="flex items-center gap-2.5 py-2 px-3 rounded-lg"
                style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</span>
                <span className="text-caption ml-auto">{item.tier}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
