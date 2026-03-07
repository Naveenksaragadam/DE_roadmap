import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import { lazy, Suspense } from 'react';
import './index.css';

const Landing = lazy(() => import('./pages/Landing'));
const RoadmapOverview = lazy(() => import('./pages/RoadmapOverview'));
const TierPage = lazy(() => import('./pages/TierPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Resources = lazy(() => import('./pages/Resources'));
const InterviewPrep = lazy(() => import('./pages/InterviewPrep'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 rounded-full border-2 border-t-[var(--color-accent-purple)] animate-spin"
        style={{ borderColor: 'rgba(255,255,255,0.08)', borderTopColor: 'var(--color-accent-purple)' }} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path="/roadmap" element={<RoadmapOverview />} />
              <Route path="/tier/:id" element={<TierPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/interview" element={<InterviewPrep />} />
            </Route>
          </Routes>
        </Suspense>
      </AppProvider>
    </BrowserRouter>
  );
}
