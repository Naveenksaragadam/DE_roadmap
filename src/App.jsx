import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';
import Layout from './components/layout/Layout';
import { lazy, Suspense } from 'react';
import './index.css';

const Landing = lazy(() => import('./pages/Landing'));
const RoadmapOverview = lazy(() => import('./pages/RoadmapOverview'));
const TierPage = lazy(() => import('./pages/TierPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Resources = lazy(() => import('./pages/Resources'));
const InterviewPrep = lazy(() => import('./pages/InterviewPrep'));
const Today = lazy(() => import('./pages/Today'));
const StudyLog = lazy(() => import('./pages/StudyLog'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="w-6 h-6 rounded-full border-2 animate-spin"
        style={{ borderColor: 'var(--border-default)', borderTopColor: 'var(--accent)' }} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Landing />} />
                <Route path="/today" element={<Today />} />
                <Route path="/roadmap" element={<RoadmapOverview />} />
                <Route path="/tier/:id" element={<TierPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/log" element={<StudyLog />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/interview" element={<InterviewPrep />} />
              </Route>
            </Routes>
          </Suspense>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
