import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Command } from 'lucide-react';
import CommandPalette from '../ui/CommandPalette';
import ThemeToggle from '../ui/ThemeToggle';
import StudyTimer from '../ui/StudyTimer';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/today', label: 'Today' },
  { path: '/roadmap', label: 'Roadmap' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/log', label: 'Log' },
  { path: '/resources', label: 'Resources' },
  { path: '/crash-course', label: 'Notes' },
  { path: '/interview', label: 'Interview' },
];

export default function Layout() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const location = useLocation();

  useKeyboardShortcut('k', () => setCmdOpen(true));

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center">
      <a href="#main" className="skip-link">Skip to main content</a>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-24 z-50 flex items-center justify-between px-6 lg:px-12 pointer-events-none">
        
        {/* Left: Brand/Logo */}
        <div className="pointer-events-auto flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ border: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}>
               <span className="font-serif font-bold text-lg leading-none" style={{ color: 'var(--text-primary)' }}>
                 DE<span style={{ color: '#ea580c' }}>.</span>
               </span>
            </div>
          </NavLink>
        </div>

        {/* Center: Floating Pill Navigation */}
        <nav className="pointer-events-auto hidden md:flex items-center p-1.5 rounded-full backdrop-blur-md shadow-sm transition-all" 
             style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                px-4 py-2 rounded-full text-[13px] font-medium transition-all no-underline
                ${isActive ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'}
              `}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="pointer-events-auto flex items-center gap-3">
           <button
             onClick={() => setCmdOpen(true)}
             className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-105"
             style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
             aria-label="Search"
           >
             <Command size={16} />
           </button>
           <div className="h-4 w-[1px]" style={{ background: 'var(--border-default)' }}></div>
           <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main id="main" className="w-full flex-1 transition-all pt-32 pb-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center p-1.5 rounded-full backdrop-blur-xl shadow-lg z-50 overflow-x-auto max-w-[90vw]" 
           style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                px-4 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap no-underline
                ${isActive ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'}
              `}
            >
              {item.label}
            </NavLink>
          ))}
      </nav>

      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
      <StudyTimer />
    </div>
  );
}
