import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Map, BarChart3, BookOpen, MessageSquare,
  PanelLeftClose, PanelLeft, Command,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useProgress } from '../../hooks/useProgress';
import CommandPalette from '../ui/CommandPalette';
import ThemeToggle from '../ui/ThemeToggle';
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
  const [cmdOpen, setCmdOpen] = useState(false);
  const location = useLocation();

  useKeyboardShortcut('k', () => setCmdOpen(true));

  const collapsed = !state.sidebarOpen;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <a href="#main" className="skip-link">Skip to main content</a>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 h-screen z-40 flex flex-col"
        style={{
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-default)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 h-14 px-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            DE
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-semibold text-sm whitespace-nowrap overflow-hidden"
                style={{ color: 'var(--text-primary)' }}
              >
                DE Roadmap
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2.5 flex flex-col gap-0.5" aria-label="Main">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className="no-underline"
              style={{ textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <div
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all"
                  style={{
                    background: isActive ? 'var(--accent-subtle)' : 'transparent',
                    color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '13px',
                  }}
                >
                  <Icon size={17} style={{ flexShrink: 0 }} />
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
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-2.5 pb-3 flex flex-col gap-2">
          {/* Progress */}
          {!collapsed && (
            <div className="px-2 py-2">
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-label" style={{ textTransform: 'none', letterSpacing: 0 }}>Progress</span>
                <span className="text-mono font-bold" style={{ color: 'var(--accent-text)' }}>{overallPercent}%</span>
              </div>
              <div className="progress-track">
                <motion.div
                  className="progress-fill"
                  style={{ background: 'var(--accent)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPercent}%` }}
                  transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
                />
              </div>
            </div>
          )}

          {/* Search trigger */}
          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] cursor-pointer transition-all"
            style={{
              background: 'var(--bg-inset)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <Command size={13} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Search…</span>
                <kbd className="px-1 py-0.5 rounded text-[10px]" style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  fontFamily: 'var(--font-mono)',
                }}>⌘K</kbd>
              </>
            )}
          </button>

          {/* Theme + Collapse */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={toggleSidebar}
              aria-expanded={!collapsed}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="btn-ghost flex-1"
              style={{ padding: '8px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <main
        id="main"
        className="flex-1 min-h-screen transition-all"
        style={{
          marginLeft: collapsed ? 64 : 220,
          transitionDuration: '200ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-8 lg:px-8 lg:py-10">
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

      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
