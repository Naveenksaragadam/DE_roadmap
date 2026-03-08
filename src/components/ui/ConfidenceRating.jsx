import { useApp } from '../../context/AppContext';

const levels = [1, 2, 3, 4, 5];
const colors = {
  1: '#ef4444', // red
  2: '#f97316', // orange
  3: '#eab308', // yellow
  4: '#22c55e', // green
  5: '#10b981', // emerald
};

export default function ConfidenceRating({ topicKey, size = 14 }) {
  const { state, setConfidence } = useApp();
  const current = state.confidence[topicKey] || 0;

  return (
    <div className="flex items-center gap-0.5" title={`Confidence: ${current}/5`}>
      {levels.map((level) => (
        <button
          key={level}
          onClick={(e) => { e.stopPropagation(); setConfidence(topicKey, level === current ? 0 : level); }}
          className="p-0 border-0 bg-transparent cursor-pointer transition-transform hover:scale-125"
          style={{ lineHeight: 1 }}
          aria-label={`Set confidence to ${level}`}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill={level <= current ? colors[current] : 'none'}
            stroke={level <= current ? colors[current] : 'var(--text-muted)'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </button>
      ))}
    </div>
  );
}
