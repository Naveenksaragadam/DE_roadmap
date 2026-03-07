import { motion } from 'framer-motion';

export default function ProgressRing({
  value = 0,
  size = 120,
  strokeWidth = 8,
  color = 'url(#gradient)',
  label = '',
  animate = true,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent-purple)" />
            <stop offset="100%" stopColor="var(--color-accent-pink)" />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color === 'gradient' ? 'url(#ring-gradient)' : color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${color === 'gradient' ? 'var(--color-accent-purple)' : color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black" style={{ fontFamily: 'var(--font-mono)' }}>
          {value}%
        </span>
        {label && (
          <span className="text-xs text-[var(--color-text-muted)] font-medium mt-0.5">{label}</span>
        )}
      </div>
    </div>
  );
}
