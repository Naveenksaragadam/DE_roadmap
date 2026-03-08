import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'de_roadmap_v1';

const today = () => new Date().toISOString().split('T')[0];

const initialState = {
  progress: {},
  topicProgress: {},
  streak: {
    dates: [],
    currentStreak: 0,
    longestStreak: 0,
  },
  sidebarOpen: true,
  lastVisit: null,

  // ── Daily Tracker Additions ──
  studyLogs: {},        // { 'YYYY-MM-DD': [{ topicKey, duration, notes, timestamp }] }
  topicNotes: {},       // { 'ti-si-idx': 'markdown text' }
  confidence: {},       // { 'ti-si-idx': 1-5 }
  dailyGoals: {},       // { 'YYYY-MM-DD': { targetMinutes, targetTopics } }
  activeTimer: null,    // { topicKey, startTime, elapsed, running }
};

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload };

    case 'TOGGLE_SECTION': {
      const key = action.payload;
      const newProgress = { ...state.progress, [key]: !state.progress[key] };
      return { ...state, progress: newProgress };
    }

    case 'TOGGLE_TOPIC': {
      const key = action.payload;
      const newTopicProgress = { ...state.topicProgress, [key]: !state.topicProgress[key] };
      return { ...state, topicProgress: newTopicProgress };
    }

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'RECORD_VISIT': {
      const d = today();
      const dates = state.streak.dates;
      if (dates[dates.length - 1] === d) return state;

      const newDates = [...dates, d];
      let currentStreak = 1;
      for (let i = newDates.length - 1; i > 0; i--) {
        const d1 = new Date(newDates[i]);
        const d2 = new Date(newDates[i - 1]);
        const diff = (d1 - d2) / (1000 * 60 * 60 * 24);
        if (diff === 1) currentStreak++;
        else break;
      }

      return {
        ...state,
        streak: {
          dates: newDates.slice(-90),
          currentStreak,
          longestStreak: Math.max(state.streak.longestStreak, currentStreak),
        },
        lastVisit: new Date().toISOString(),
      };
    }

    case 'TOGGLE_INTERVIEW': {
      const key = action.payload;
      const newProgress = { ...state.progress, [key]: !state.progress[key] };
      return { ...state, progress: newProgress };
    }

    // ── Study Log ──
    case 'ADD_STUDY_LOG': {
      const { date, entry } = action.payload; // entry: { topicKey, duration, notes, timestamp }
      const dayLogs = [...(state.studyLogs[date] || []), entry];
      return { ...state, studyLogs: { ...state.studyLogs, [date]: dayLogs } };
    }

    // ── Topic Notes ──
    case 'UPDATE_TOPIC_NOTES': {
      const { topicKey, notes } = action.payload;
      return { ...state, topicNotes: { ...state.topicNotes, [topicKey]: notes } };
    }

    // ── Confidence Rating ──
    case 'SET_CONFIDENCE': {
      const { topicKey, level } = action.payload; // level: 1-5
      return { ...state, confidence: { ...state.confidence, [topicKey]: level } };
    }

    // ── Daily Goals ──
    case 'SET_DAILY_GOAL': {
      const { date, goal } = action.payload; // goal: { targetMinutes, targetTopics }
      return { ...state, dailyGoals: { ...state.dailyGoals, [date]: goal } };
    }

    // ── Timer ──
    case 'START_TIMER': {
      return {
        ...state,
        activeTimer: {
          topicKey: action.payload.topicKey,
          topicLabel: action.payload.topicLabel || '',
          startTime: Date.now(),
          elapsed: state.activeTimer?.topicKey === action.payload.topicKey
            ? (state.activeTimer.elapsed || 0)
            : 0,
          running: true,
        },
      };
    }

    case 'PAUSE_TIMER': {
      if (!state.activeTimer || !state.activeTimer.running) return state;
      const now = Date.now();
      const additionalElapsed = now - state.activeTimer.startTime;
      return {
        ...state,
        activeTimer: {
          ...state.activeTimer,
          elapsed: (state.activeTimer.elapsed || 0) + additionalElapsed,
          running: false,
        },
      };
    }

    case 'STOP_TIMER': {
      if (!state.activeTimer) return state;
      const now = Date.now();
      let totalElapsed = state.activeTimer.elapsed || 0;
      if (state.activeTimer.running) {
        totalElapsed += now - state.activeTimer.startTime;
      }
      const durationMinutes = Math.round(totalElapsed / 60000);
      const d = today();
      // Auto-log session if duration > 0
      if (durationMinutes > 0) {
        const entry = {
          topicKey: state.activeTimer.topicKey,
          topicLabel: state.activeTimer.topicLabel,
          duration: durationMinutes,
          notes: '',
          timestamp: new Date().toISOString(),
        };
        const dayLogs = [...(state.studyLogs[d] || []), entry];
        return { ...state, activeTimer: null, studyLogs: { ...state.studyLogs, [d]: dayLogs } };
      }
      return { ...state, activeTimer: null };
    }

    case 'TICK_TIMER': {
      // No-op action to force re-render for timer display
      return { ...state };
    }

    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Reset timer running state on reload
        if (parsed.activeTimer) parsed.activeTimer = null;
        dispatch({ type: 'HYDRATE', payload: parsed });
      }
    } catch (e) {
      console.warn('Failed to load saved progress:', e);
    }
  }, []);

  // Persist to localStorage on changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const toSave = {
          progress: state.progress,
          topicProgress: state.topicProgress,
          streak: state.streak,
          lastVisit: state.lastVisit,
          studyLogs: state.studyLogs,
          topicNotes: state.topicNotes,
          confidence: state.confidence,
          dailyGoals: state.dailyGoals,
          // Don't persist activeTimer — reset on reload
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch (e) {
        console.warn('Failed to save progress:', e);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [state.progress, state.topicProgress, state.streak, state.lastVisit,
      state.studyLogs, state.topicNotes, state.confidence, state.dailyGoals]);

  // Record visit on mount
  useEffect(() => {
    dispatch({ type: 'RECORD_VISIT' });
  }, []);

  // ── Dispatch helpers ──
  const toggleSection = useCallback((key) => dispatch({ type: 'TOGGLE_SECTION', payload: key }), []);
  const toggleTopic = useCallback((key) => dispatch({ type: 'TOGGLE_TOPIC', payload: key }), []);
  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);
  const toggleInterview = useCallback((key) => dispatch({ type: 'TOGGLE_INTERVIEW', payload: key }), []);

  const addStudyLog = useCallback((date, entry) =>
    dispatch({ type: 'ADD_STUDY_LOG', payload: { date, entry } }), []);
  const updateTopicNotes = useCallback((topicKey, notes) =>
    dispatch({ type: 'UPDATE_TOPIC_NOTES', payload: { topicKey, notes } }), []);
  const setConfidence = useCallback((topicKey, level) =>
    dispatch({ type: 'SET_CONFIDENCE', payload: { topicKey, level } }), []);
  const setDailyGoal = useCallback((date, goal) =>
    dispatch({ type: 'SET_DAILY_GOAL', payload: { date, goal } }), []);
  const startTimer = useCallback((topicKey, topicLabel) =>
    dispatch({ type: 'START_TIMER', payload: { topicKey, topicLabel } }), []);
  const pauseTimer = useCallback(() => dispatch({ type: 'PAUSE_TIMER' }), []);
  const stopTimer = useCallback(() => dispatch({ type: 'STOP_TIMER' }), []);

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      toggleSection,
      toggleTopic,
      toggleSidebar,
      toggleInterview,
      addStudyLog,
      updateTopicNotes,
      setConfidence,
      setDailyGoal,
      startTimer,
      pauseTimer,
      stopTimer,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

