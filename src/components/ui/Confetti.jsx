import { useState, useEffect, useCallback } from 'react';

const CONFETTI_COLORS = ['#7c3aed', '#ec4899', '#3b82f6', '#ff4d4d', '#2eb85c', '#e6b800', '#ff9933'];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function Confetti({ trigger }) {
  const [particles, setParticles] = useState([]);

  const burst = useCallback(() => {
    const count = 40;
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: randomBetween(10, 90),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: randomBetween(6, 12),
      delay: randomBetween(0, 0.5),
      duration: randomBetween(2, 3.5),
      rotation: randomBetween(0, 360),
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 4000);
  }, []);

  useEffect(() => {
    if (trigger) burst();
  }, [trigger, burst]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            borderRadius: 2,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
