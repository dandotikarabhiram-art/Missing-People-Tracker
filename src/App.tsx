import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { Home } from './pages/Home';
import { SearchCases } from './pages/SearchCases';
import { CaseDetails } from './pages/CaseDetails';
import { ReportMissing } from './pages/ReportMissing';
import { SubmitSighting } from './pages/SubmitSighting';
import { FullMapPage } from './pages/FullMapPage';
import { UserDashboard } from './pages/UserDashboard';
import { InvestigatorDashboard } from './pages/InvestigatorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { SafetyContactPage } from './pages/SafetyContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [navState, setNavState] = useState<any>(null);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string, state?: any) => {
    setNavState(state || null);
    setCurrentPath(path);
    window.history.pushState(state || {}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render active route
  const renderRoute = () => {
    // Dynamic /case/:id check
    if (currentPath.startsWith('/case/')) {
      const caseId = currentPath.replace('/case/', '');
      return <CaseDetails caseId={caseId} navigate={navigate} />;
    }

    switch (currentPath) {
      case '/':
        return <Home navigate={navigate} />;
      case '/search':
        return <SearchCases navigate={navigate} initialQuery={navState?.query || ''} />;
      case '/report':
        return <ReportMissing navigate={navigate} />;
      case '/sighting':
        return (
          <SubmitSighting
            navigate={navigate}
            initialCaseId={navState?.caseId}
            initialReference={navState?.reference}
          />
        );
      case '/map':
        return <FullMapPage navigate={navigate} />;
      case '/dashboard':
        return <UserDashboard navigate={navigate} />;
      case '/investigator':
        return <InvestigatorDashboard navigate={navigate} />;
      case '/admin':
        return <AdminDashboard navigate={navigate} />;
      case '/notifications':
        return <NotificationsPage navigate={navigate} />;
      case '/profile':
        return <ProfilePage navigate={navigate} />;
      case '/about':
        return <AboutPage />;
      case '/privacy':
        return <PrivacyPage />;
      case '/terms':
        return <TermsPage />;
      case '/contact':
      case '/safety':
        return <SafetyContactPage />;
      case '/login':
        return <LoginPage navigate={navigate} />;
      case '/register':
        return <RegisterPage navigate={navigate} />;
      case '/forgot-password':
        return <ForgotPasswordPage navigate={navigate} />;
      default:
        return <NotFoundPage navigate={navigate} />;
    }
  };

  return (
    <AuthProvider>
      <DataProvider>
        <div className="min-h-screen flex flex-col bg-slate-100/60 font-sans text-slate-800 antialiased selection:bg-teal-500 selection:text-white">
          <Navbar currentPath={currentPath} navigate={navigate} />
          <main className="flex-1">{renderRoute()}</main>
          <Footer navigate={navigate} />
        </div>
      </DataProvider>
    </AuthProvider>
  );
}
