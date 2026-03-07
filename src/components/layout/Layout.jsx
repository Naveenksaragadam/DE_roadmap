import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Map,
  BarChart3,
  BookOpen,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Command,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useProgress } from '../../hooks/useProgress';
import CommandPalette from '../ui/CommandPalette';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/roadmap', label: 'Roadmap', icon: Map },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/resources', label: 'Resources', icon: BookOpen },
  { path: '/interview', label: 'Interview', icon: MessageSquare },
];

export default function Layout() {
  const { state, toggleSidebar } = useApp();
  const { overallPercent } = useProgress();
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const location = useLocation();

  useKeyboardShortcut('k', () => setCmdPaletteOpen(true));

  const collapsed = !state.sidebarOpen;

  return (
    <div className="flex min-h-screen">
      <a href="#main-content" className="skip-to-main">Skip to main content</a>

      {/* Background Orbs */}
      <div className="bg-orb" style={{
        top: '-10%', right: '-10%', width: '50%', height: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
      }} />
      <div className="bg-orb" style={{
        bottom: '-10%', left: '-10%', width: '50%', height: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)',
        animationDelay: '10s',
      }} />

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 h-screen z-40 flex flex-col border-r"
        style={{
          background: 'rgba(5,5,8,0.95)',
          backdropFilter: 'blur(20px)',
          borderColor: 'var(--color-border-subtle)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black"
            style={{ background: 'linear-gradient(135deg, var(--color-accent-purple), var(--color-accent-pink))' }}>
            DE
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-sm whitespace-nowrap overflow-hidden"
              >
                DE Roadmap
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3" role="navigation" aria-label="Main navigation">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium no-underline ${
                  isActive
                    ? 'text-white'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
              })}
            >
              <Icon size={18} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Progress + Cmd+K + Toggle */}
        <div className="px-3 pb-4 flex flex-col gap-3">
          {!collapsed && (
            <div className="px-2">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[var(--color-text-muted)] font-semibold">Progress</span>
                <span className="font-bold gradient-text-accent">{overallPercent}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--color-accent-purple), var(--color-accent-pink))' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPercent}%` }}
                  transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
                />
              </div>
            </div>
          )}

          <button
            onClick={() => setCmdPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer transition-all duration-200 hover:border-[var(--color-border-hover)]"
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-muted)',
            }}
          >
            <Command size={14} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Search…</span>
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--color-border-subtle)',
                }}>⌘K</kbd>
              </>
            )}
          </button>

          <button
            onClick={toggleSidebar}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex items-center justify-center p-2 rounded-xl cursor-pointer transition-all duration-200"
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-muted)',
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        id="main-content"
        className="flex-1 min-h-screen relative z-10 transition-all duration-250"
        style={{ marginLeft: collapsed ? 72 : 240 }}
      >
        <div className="max-w-6xl mx-auto px-6 py-8 lg:px-10 lg:py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Command Palette */}
      <CommandPalette isOpen={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} />
    </div>
  );
}
