# 🌍 The World's Best DE Roadmap — Implementation Plan

> A premium, interactive single-page app to track your Data Engineering interview prep journey. Dark-mode-first, glass-morphic, with buttery Framer Motion animations and persistent progress tracking via localStorage.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | Vite + React 19 | Already scaffolded, blazing-fast HMR, SWC transform |
| **Routing** | `react-router-dom` v7 | Multi-page navigation with animated route transitions |
| **Animations** | `framer-motion` v12 | Layout animations, scroll-triggered reveals, shared layout transitions |
| **Styling** | `tailwindcss` v4 | Utility-first, rapid premium UI with dark-mode tokens |
| **Icons** | `lucide-react` | 1000+ consistent, tree-shakeable SVG icons |
| **Charts** | `recharts` | Dashboard progress visualizations (bar, radial, heatmap) |
| **Fonts** | `Inter` + `JetBrains Mono` | Premium sans-serif for UI + mono for code/stats |

### Dependency Install Command
```bash
npm install react-router-dom framer-motion lucide-react recharts
npm install -D tailwindcss @tailwindcss/vite
```

---

## MCP Servers Used During Build

| Server | Purpose |
|--------|---------|
| **Context7** | Fetch latest Framer Motion v12 + Tailwind v4 API docs while coding |
| **Stitch** | Generate UI mockups for Landing page and Dashboard before coding |

> [!NOTE]
> Supabase could add cloud persistence + auth, but for a personal study tool, localStorage keeps it simple and instant. We can always add Supabase later as a v2 upgrade.

---

## Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#050508` | Main background |
| `--bg-surface` | `rgba(255,255,255,0.02)` | Card surfaces |
| `--bg-surface-hover` | `rgba(255,255,255,0.05)` | Card hover state |
| `--bg-glass` | `rgba(255,255,255,0.03)` | Glassmorphism panels |
| `--text-primary` | `#f1f5f9` | Headings |
| `--text-secondary` | `#94a3b8` | Body text |
| `--text-muted` | `#64748b` | Captions, timestamps |
| `--accent-purple` | `#7c3aed` | Primary accent |
| `--accent-pink` | `#ec4899` | Secondary accent / gradients |
| `--tier-1` | `#ff4d4d` | Critical / Tier 1 |
| `--tier-2` | `#ff9933` | High / Tier 2 |
| `--tier-3` | `#e6b800` | Medium-High / Tier 3 |
| `--tier-4` | `#2eb85c` | Medium / Tier 4 |
| `--border-subtle` | `rgba(255,255,255,0.08)` | Default borders |
| `--border-hover` | `rgba(255,255,255,0.15)` | Hover borders |

### Typography Scale

| Role | Font | Size | Weight |
|------|------|------|--------|
| Hero heading | Inter | `clamp(2.5rem, 6vw, 4rem)` | 900 |
| Section heading | Inter | `1.8rem` | 800 |
| Card title | Inter | `1.25rem` | 700 |
| Body | Inter | `0.95rem` | 400 |
| Caption/Label | Inter | `0.75rem` | 600 |
| Code/Stats | JetBrains Mono | `0.85rem` | 500 |

### Glassmorphism Recipe
```css
.glass-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### Responsive Breakpoints

| Name | Value | Layout Change |
|------|-------|---------------|
| `sm` | `640px` | Stack cards, collapse sidebar |
| `md` | `768px` | 2-column card grid |
| `lg` | `1024px` | Show sidebar, 2-col grid |
| `xl` | `1280px` | Full layout, max-width container |

---

## Pages & Features

**6 pages** connected by a collapsible sidebar + top navbar with `Cmd+K` command palette.

| Page | Route | Key Features |
|------|-------|------|
| **Landing** | `/` | Cinematic hero with particle background, animated stat counters (4 tiers, 15 sections, 100+ topics), feature cards with staggered reveal, gradient CTA button |
| **Roadmap** | `/roadmap` | Vertical tier timeline with glassmorphic tier headers, section cards in responsive grid, expand/collapse all, per-section progress checkboxes |
| **Tier Deep-Dive** | `/tier/:id` | Full-page tier breakdown, expandable topic sections with sub-topic checkboxes, confetti burst on tier completion, per-tier progress ring |
| **Dashboard** | `/dashboard` | SVG progress ring (animated on mount), Recharts stacked bar (tier breakdown), 7-day streak heatmap (localStorage), recently completed topics list |
| **Resources** | `/resources` | Filterable masonry card grid (books, courses, YouTube, tools), tag-based filtering, search, external link icons |
| **Interview** | `/interview` | Three-column layout: Behavioral / System Design / Coding, checklists with progress, mock interview timer, tips accordion |

---

## State Management Strategy

### Global State (React Context + `useReducer`)

```
AppContext
├── progress: { [sectionKey]: boolean }      // section completion
├── topicProgress: { [topicKey]: boolean }    // individual topic checks
├── streak: { dates: string[], current: number }
├── theme: 'dark'                            // future: light mode toggle
└── sidebarOpen: boolean
```

### localStorage Schema

```json
{
  "de_roadmap_v1": {
    "progress": { "0-0": true, "0-1": false, ... },
    "topicProgress": { "0-0-0": true, ... },
    "streak": {
      "dates": ["2025-03-01", "2025-03-02"],
      "currentStreak": 2,
      "longestStreak": 5
    },
    "lastVisit": "2025-03-07T06:47:00Z"
  }
}
```

> [!IMPORTANT]
> All state is persisted to localStorage on every change using a debounced `useEffect` (300ms). On mount, state is hydrated from localStorage with a fallback to defaults. The version key (`v1`) allows future migrations.

---

## Animation Specifications

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page transitions | Fade + slide Y (20px) | 300ms | `easeOut` |
| Card enter | Stagger fade-up (50ms between) | 400ms | `[0.4, 0, 0.2, 1]` |
| Card hover | `translateY(-4px)` + glow border | 200ms | `ease` |
| Progress bar fill | Width + glow pulse | 800ms | `[0.65, 0, 0.35, 1]` |
| Progress ring | Stroke dashoffset | 1200ms | `easeInOut` |
| Sidebar toggle | Width 240→64px + icon rotate | 250ms | `spring(300, 30)` |
| Confetti burst | Particle spray on completion | 2000ms | `physics-based` |
| Cmd+K modal | Scale 0.95→1 + backdrop blur | 200ms | `easeOut` |
| Topic checkbox | Scale bounce 1→1.2→1 | 200ms | `spring` |
| Scroll reveals | `whileInView` fade-up | 500ms | `easeOut` |

---

## File Structure

```
src/
  index.css                        → Tailwind directives + design tokens + custom utilities
  main.jsx                         → Entry point
  App.jsx                          → Router + AnimatePresence + AppProvider
  
  context/
    AppContext.jsx                  → Global state: progress, streak, sidebar
    useLocalStorage.js              → Hook: debounced read/write with versioned key
  
  data/
    roadmapData.js                 → All roadmap content (tiers, sections, topics, resources)
    resourcesData.js               → Curated resource cards for /resources page
    interviewData.js               → Interview prep content: behavioral, system design, coding
  
  components/
    layout/
      Layout.jsx                   → Sidebar + Navbar + AnimatePresence outlet
      Sidebar.jsx                  → Collapsible nav with route icons + progress mini-bar
      Navbar.jsx                   → Breadcrumbs + search trigger + Cmd+K shortcut
    
    ui/
      ProgressRing.jsx             → Animated SVG donut (size, value, color props)
      TopicCard.jsx                → Expandable glassmorphic card with checkbox
      GlassCard.jsx                → Reusable glassmorphic container component
      Badge.jsx                    → Priority / status pill (Critical, High, etc.)
      Toast.jsx                    → Notification toast with auto-dismiss
      Confetti.jsx                 → CSS particle confetti burst
      CommandPalette.jsx           → Cmd+K fuzzy-search modal over all topics
      StreakHeatmap.jsx             → 7-week grid heatmap (à la GitHub contributions)
      StatCounter.jsx              → Animated number counter for landing page
      AnimatedSection.jsx          → Reusable whileInView scroll-reveal wrapper
  
  pages/
    Landing.jsx                    → Hero + animated stats + feature cards + CTA
    RoadmapOverview.jsx            → Tier timeline + section cards
    TierPage.jsx                   → Deep-dive per tier + topic-level progress
    Dashboard.jsx                  → Progress ring + charts + streak + recent activity
    Resources.jsx                  → Filterable resource grid
    InterviewPrep.jsx              → Three-column interview prep
  
  hooks/
    useProgress.js                 → Computed progress values per tier/overall
    useStreak.js                   → Streak calculation and update logic
    useKeyboardShortcut.js         → Cmd+K and other global shortcuts
```

---

## Component Contracts (Key Props)

### `<ProgressRing />`
```
size: number (default 120)
value: number (0–100)
strokeWidth: number (default 8)
color: string (gradient or solid)
label?: string
animate?: boolean (default true)
```

### `<TopicCard />`
```
topic: { title, icon, priority, timeEstimate, topics[], resources[] }
isCompleted: boolean
isExpanded: boolean
onToggleExpand: () => void
onToggleComplete: () => void
tierColor: string
```

### `<CommandPalette />`
```
isOpen: boolean
onClose: () => void
items: { label, route, icon, tier }[]
```

### `<StreakHeatmap />`
```
dates: string[]          // ISO date strings of active days
weeks: number (default 7)
colorScale: string[]     // ['#1a1a2e', '#7c3aed', '#a78bfa', '#c4b5fd']
```

---

## Data Architecture: `roadmapData.js`

Each tier follows this structure for type safety and consistency:

```js
{
  id: 'tier-1',
  tier: 'TIER 1',
  label: 'Absolute Must-Haves',
  subtitle: 'Non-negotiable for any FAANG DE interview',
  color: '#ff4d4d',
  accent: '#ff9999',
  icon: 'target',            // lucide icon name
  totalWeeks: '16–24',       // estimated tier duration
  sections: [
    {
      id: 'sql-advanced',
      title: 'SQL (Advanced)',
      icon: 'database',      // lucide icon name (replacing emojis)
      priority: 'Critical',
      timeEstimate: '4–6 weeks',
      description: 'Master advanced SQL patterns required for FAANG DE interviews.',
      topics: [
        {
          id: 'window-functions',
          label: 'Window functions: ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, NTILE',
          depth: 'deep',      // 'quick' | 'normal' | 'deep'
        },
        // ...
      ],
      resources: [
        {
          label: 'LeetCode SQL (Hard)',
          url: 'https://leetcode.com/problemset/database/',
          type: 'practice',   // 'book' | 'course' | 'practice' | 'docs' | 'video'
        },
        // ...
      ],
      projects: [
        'Build a data warehouse schema for an e-commerce platform',
        'Write 20 complex window function queries on real datasets',
      ],
    },
    // ...
  ],
}
```

> [!TIP]
> Replacing emojis with `lucide-react` icon names ensures consistent rendering across all OS/browsers and enables icon theming.

---

## Build Order

### Phase 1 — Foundation (Steps 1–3)
1. **Install dependencies** — `react-router-dom`, `framer-motion`, `lucide-react`, `recharts`, `tailwindcss`
2. **Design system setup** — `index.css` with Tailwind directives, custom CSS variables, glassmorphism utilities, font imports
3. **Data files** — Extract and enrich `roadmapData.js` from the existing monolith; create `resourcesData.js` and `interviewData.js`

### Phase 2 — Shell & Navigation (Steps 4–5)
4. **Context & hooks** — `AppContext.jsx`, `useLocalStorage.js`, `useProgress.js`, `useStreak.js`
5. **Layout shell** — `Layout.jsx` + `Sidebar.jsx` + `Navbar.jsx` with route transitions via `AnimatePresence`

### Phase 3 — Core Pages (Steps 6–8)
6. **Landing page** — Hero section, animated stat counters, feature cards, CTA
7. **Roadmap overview** — Tier timeline with section cards, expand/collapse, progress checkmarks
8. **Tier deep-dive** — Topic-level checkboxes, per-tier progress ring, confetti on completion

### Phase 4 — Dashboard & Extras (Steps 9–11)
9. **Dashboard** — Progress ring, Recharts tier breakdown, streak heatmap, recent activity
10. **Resources page** — Filterable grid with type/tier tags
11. **Interview prep page** — Three-column layout with checklists and timer

### Phase 5 — Polish (Step 12)
12. **Final polish** — Command Palette, Toast notifications, scroll-reveal animations, keyboard shortcuts, accessibility audit, performance check

---

## Accessibility Checklist

- [ ] All interactive elements have `aria-label` or visible text
- [ ] Sidebar toggle has `aria-expanded`
- [ ] Color contrast ratio ≥ 4.5:1 for text (WCAG AA)
- [ ] Focus ring visible on all interactive elements
- [ ] Keyboard navigation: Tab through cards, Enter to expand, Space to check
- [ ] `prefers-reduced-motion` media query disables animations
- [ ] Semantic HTML: `<nav>`, `<main>`, `<section>`, `<header>`, `<footer>`
- [ ] Skip-to-main-content link

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | ≥ 95 |
| First Contentful Paint | < 1.0s |
| Largest Contentful Paint | < 2.0s |
| Total Bundle Size | < 300KB gzipped |
| Time to Interactive | < 1.5s |

### Optimization Strategies
- **Code splitting**: `React.lazy()` for each page route
- **Tree shaking**: Import specific Lucide icons (`import { Database } from 'lucide-react'`)
- **Debounced persistence**: localStorage writes debounced at 300ms
- **Virtualization**: Not needed (< 100 cards), but ready to add if resources grow
- **Image-free**: All visuals are CSS/SVG — zero image downloads

---

## Verification Plan

### Automated Testing
1. **Build check** — Run `npm run build` and confirm zero errors
2. **Lint check** — Run `npm run lint` and confirm zero warnings/errors

### Browser Testing (using browser tool)
1. Open `http://localhost:5173` and verify:
   - Landing page loads with animated hero, stat counters, and CTA
   - Navigation via sidebar to all 6 routes works
   - Roadmap cards expand/collapse on click
   - Checkboxes toggle and progress bar updates live
   - Progress persists after page reload (localStorage)
   - Cmd+K opens command palette, typing filters results
   - Dashboard shows correct progress ring and chart data
   - Resources page filters work correctly
   - Responsive: resize to 768px and verify sidebar collapses and cards stack

### Manual Verification (User)
1. **Reload persistence** — Complete 3 sections, reload page, verify they remain checked
2. **Streak tracking** — Use app on consecutive days, verify streak counter increments on Dashboard
3. **Confetti** — Complete all sections in a tier, verify confetti burst triggers
4. **Deployment** — Optionally run `npm run build && npm run preview` to validate production build

---

## Future Enhancements (v2)

| Feature | Effort | Impact |
|---------|--------|--------|
| Supabase auth + cloud sync | Medium | Sync progress across devices |
| Spaced repetition flashcards | Medium | Active recall for interview prep |
| Community leaderboard | High | Social motivation |
| Dark/Light theme toggle | Low | Accessibility / preference |
| PDF export of progress report | Low | Share with mentors |
| Mobile PWA (offline support) | Medium | Study on the go |
