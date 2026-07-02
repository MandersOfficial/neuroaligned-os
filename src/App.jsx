import { Toaster } from "@/components/ui/toaster"
import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { SensoryProvider } from '@/lib/SensoryContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
// Add page imports here
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Tasks from './pages/Tasks';
import FocusModes from './pages/FocusModes';
import Integrations from './pages/Integrations';
import BurnoutRisk from './pages/BurnoutRisk';
import KnowledgeBase from './pages/KnowledgeBase';
import Upgrade from './pages/Upgrade';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Forum from './pages/Forum';
import CheckIn from './pages/CheckIn';
import BodyDoubling from './pages/BodyDoubling';
import SensorySettings from './pages/SensorySettings';
import Journal from './pages/Journal';
import FocusRooms from './pages/FocusRooms';
import Productivity from './pages/Productivity';
import Projects from './pages/Projects';
import NotionDashboard from './pages/NotionDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import RegulationFirst from './pages/RegulationFirst';
import Disclaimer from './pages/Disclaimer';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

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

  // Render the main app
  return (
    <Routes>
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
      <Route path="/integrations" element={<Integrations />} />
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
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/regulation-first" element={<RegulationFirst />} />
      <Route path="/disclaimer" element={<Disclaimer />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
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