import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Clock, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function StudyTimer() {
  const { state, startTimer, pauseTimer, stopTimer } = useApp();
  const timer = state.activeTimer;
  const [elapsed, setElapsed] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (timer?.running) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        setElapsed((timer.elapsed || 0) + (now - timer.startTime));
      }, 1000);
    } else if (timer && !timer.running) {
      setElapsed(timer.elapsed || 0);
    } else {
      setElapsed(0);
    }

    return () => clearInterval(intervalRef.current);
  }, [timer?.running, timer?.startTime, timer?.elapsed, timer?.topicKey]);

  if (!timer) return null;

  const displayTime = formatTime(elapsed);
  const durationMinutes = Math.round(elapsed / 60000);

  if (minimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50 cursor-pointer"
        onClick={() => setMinimized(false)}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: timer.running ? 'var(--accent)' : 'var(--bg-elevated)',
            border: '2px solid var(--border-default)',
            color: timer.running ? 'white' : 'var(--text-primary)',
          }}>
          <div className="text-center">
            <Clock size={14} />
            <div className="text-[9px] font-bold mt-0.5">{durationMinutes}m</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 right-6 z-50"
        style={{ width: 280 }}
      >
        <div className="rounded-2xl shadow-lg overflow-hidden"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
          }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2">
              <Clock size={14} style={{ color: 'var(--accent-text)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Study Timer</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized(true)}
                className="p-1 rounded-md border-0 bg-transparent cursor-pointer"
                style={{ color: 'var(--text-muted)' }}>
                <span className="text-xs">—</span>
              </button>
              <button onClick={stopTimer}
                className="p-1 rounded-md border-0 bg-transparent cursor-pointer"
                style={{ color: 'var(--text-muted)' }}>
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Timer Display */}
          <div className="px-4 py-5 text-center">
            <div className="text-4xl font-extrabold tracking-wide mb-2"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
              {displayTime}
            </div>
            <div className="text-xs truncate px-2" style={{ color: 'var(--text-muted)' }}>
              {timer.topicLabel || timer.topicKey}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 px-4 pb-4">
            {timer.running ? (
              <button onClick={pauseTimer}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:scale-105"
                style={{
                  background: 'var(--bg-inset)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                }}>
                <Pause size={13} /> Pause
              </button>
            ) : (
              <button onClick={() => startTimer(timer.topicKey, timer.topicLabel)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:scale-105"
                style={{
                  background: 'var(--accent)',
                  border: 'none',
                  color: 'white',
                  fontFamily: 'var(--font-sans)',
                }}>
                <Play size={13} /> Resume
              </button>
            )}
            <button onClick={stopTimer}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:scale-105"
              style={{
                background: 'var(--tier-1-subtle)',
                border: '1px solid var(--tier-1)',
                color: 'var(--tier-1)',
                fontFamily: 'var(--font-sans)',
              }}>
              <Square size={13} /> Stop & Log
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
