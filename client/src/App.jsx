import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import { VoterAuthProvider } from './context/VoterAuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

import { VoterLayout } from './layouts/VoterLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public & Voter pages
import { AccessPage } from './pages/voter/AccessPage';
import { PublicNomineesPage } from './pages/public/PublicNomineesPage';
import { NomineeSelectionPage } from './pages/voter/NomineeSelectionPage';
import { RankingPage } from './pages/voter/RankingPage';
import { ConfirmationPage } from './pages/voter/ConfirmationPage';
import { SuccessPage } from './pages/voter/SuccessPage';
import { ScrollStackTestPage } from './pages/public/ScrollStackTestPage';

// Admin pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminVoters } from './pages/admin/AdminVoters';
import { AdminBallots } from './pages/admin/AdminBallots';
import { AdminNominees } from './pages/admin/AdminNominees';
import { AdminResults } from './pages/admin/AdminResults';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0907] text-[#F5F0E6] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md p-6 rounded-2xl bg-[#12100C] border border-[#554628] space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF57] block">
              Ceremony Portal Error
            </span>
            <h2 className="font-playfair text-2xl font-bold uppercase text-[#F5F0E6]">
              Something went wrong
            </h2>
            <p className="text-xs text-[#A69D8B] leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-lg bg-[#D4AF57] hover:bg-[#E8C97B] text-[#0A0907] font-semibold text-xs uppercase tracking-widest transition-colors cursor-pointer"
            >
              Reload Portal
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" richColors theme="dark" />
        <AdminAuthProvider>
          <VoterAuthProvider>
            <Routes>
              {/* Public and Voter Routes */}
              <Route element={<VoterLayout />}>
                <Route path="/" element={<AccessPage />} />
                <Route path="/nominees" element={<PublicNomineesPage />} />
                <Route path="/test-scroll-stack" element={<ScrollStackTestPage />} />
                <Route path="/vote/select" element={<NomineeSelectionPage />} />
                <Route path="/vote/rank" element={<RankingPage />} />
                <Route path="/vote/confirm" element={<ConfirmationPage />} />
                <Route path="/vote/success" element={<SuccessPage />} />
              </Route>

              {/* Admin Authentication */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Dashboard Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="voters" element={<AdminVoters />} />
                <Route path="ballots" element={<AdminBallots />} />
                <Route path="nominees" element={<AdminNominees />} />
                <Route path="results" element={<AdminResults />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </VoterAuthProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
