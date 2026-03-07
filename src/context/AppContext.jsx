import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'de_roadmap_v1';

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
      const today = new Date().toISOString().split('T')[0];
      const dates = state.streak.dates;
      if (dates[dates.length - 1] === today) return state;

      const newDates = [...dates, today];
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
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch (e) {
        console.warn('Failed to save progress:', e);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [state.progress, state.topicProgress, state.streak, state.lastVisit]);

  // Record visit on mount
  useEffect(() => {
    dispatch({ type: 'RECORD_VISIT' });
  }, []);

  const toggleSection = useCallback((key) => dispatch({ type: 'TOGGLE_SECTION', payload: key }), []);
  const toggleTopic = useCallback((key) => dispatch({ type: 'TOGGLE_TOPIC', payload: key }), []);
  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);
  const toggleInterview = useCallback((key) => dispatch({ type: 'TOGGLE_INTERVIEW', payload: key }), []);

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      toggleSection,
      toggleTopic,
      toggleSidebar,
      toggleInterview,
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
