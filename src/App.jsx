import { Toaster } from "@/components/ui/toaster"
import { useEffect, lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { SensoryProvider, useSensory } from '@/lib/SensoryContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Lazily-loaded pages — keeps the initial bundle small for faster first paint on mobile
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Landing = lazy(() => import('./pages/Landing'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Admin = lazy(() => import('./pages/Admin'));
const Tasks = lazy(() => import('./pages/Tasks'));
const FocusModes = lazy(() => import('./pages/FocusModes'));
const BurnoutRisk = lazy(() => import('./pages/BurnoutRisk'));
const KnowledgeBase = lazy(() => import('./pages/KnowledgeBase'));
const Upgrade = lazy(() => import('./pages/Upgrade'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Forum = lazy(() => import('./pages/Forum'));
const CheckIn = lazy(() => import('./pages/CheckIn'));
const BodyDoubling = lazy(() => import('./pages/BodyDoubling'));
const SensorySettings = lazy(() => import('./pages/SensorySettings'));
const Journal = lazy(() => import('./pages/Journal'));
const FocusRooms = lazy(() => import('./pages/FocusRooms'));
const Productivity = lazy(() => import('./pages/Productivity'));
const Projects = lazy(() => import('./pages/Projects'));
const NotionDashboard = lazy(() => import('./pages/NotionDashboard'));
const CalendarSync = lazy(() => import('./pages/CalendarSync'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const RegulationFirst = lazy(() => import('./pages/RegulationFirst'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const IntegrationSettings = lazy(() => import('./pages/IntegrationSettings'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const Support = lazy(() => import('./pages/Support'));
const TaskBreakdown = lazy(() => import('./pages/TaskBreakdown'));
const BodyDoublingMatch = lazy(() => import('./pages/BodyDoublingMatch'));

function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin dark:border-muted dark:border-t-primary" />
    </div>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();
  const { prefs } = useSensory();

  // Redirect to login as a side effect, not during render
  useEffect(() => {
    if (authError?.type === 'auth_required') {
      navigateToLogin();
    }
  }, [authError, navigateToLogin]);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      return null;
    }
  }

  // Render the main app with mobile-native route transitions
  return (
    <MotionConfig reducedMotion={prefs?.reducedMotion ? 'always' : 'user'}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen"
        >
          <Suspense fallback={<PageLoader />}>
            <Routes location={location}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={<Landing />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/focus-modes" element={<FocusModes />} />
              <Route path="/integrations" element={<Navigate to="/integration-settings" replace />} />
              <Route path="/burnout" element={<BurnoutRisk />} />
              <Route path="/knowledge" element={<KnowledgeBase />} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/check-in" element={<CheckIn />} />
              <Route path="/body-doubling" element={<BodyDoubling />} />
              <Route path="/sensory" element={<SensorySettings />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/focus-rooms" element={<FocusRooms />} />
              <Route path="/productivity" element={<Productivity />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/notion-sync" element={<NotionDashboard />} />
              <Route path="/calendar-sync" element={<CalendarSync />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/regulation-first" element={<RegulationFirst />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/integration-settings" element={<IntegrationSettings />} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/support" element={<Support />} />
              <Route path="/task-breakdown" element={<TaskBreakdown />} />
              <Route path="/body-doubling-match" element={<BodyDoublingMatch />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
};


function App() {

  return (
    <AuthProvider>
      <SensoryProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </SensoryProvider>
    </AuthProvider>
  )
}

export default App