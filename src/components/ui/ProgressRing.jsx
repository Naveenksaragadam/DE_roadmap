import { motion } from 'framer-motion';

export default function ProgressRing({ value = 0, size = 100, strokeWidth = 8, color = 'var(--accent)', label }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--bg-inset)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-mono font-extrabold" style={{ fontSize: size * 0.2, color: 'var(--text-primary)' }}>
          {value}%
        </span>
        {label && <span className="text-caption" style={{ fontSize: size * 0.1 }}>{label}</span>}
      </div>
    </div>
  );
}
