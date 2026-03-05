import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { useAuth } from './lib/useAuth';
import { isSupabaseConfigured } from './lib/supabase';
import { Sparkles } from 'lucide-react';

// Components
import Dashboard from './components/Dashboard';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import AuthCallback from './components/AuthCallback';
import AuthConfirmed from './components/AuthConfirmed';
import ResetPassword from './components/ResetPassword';
import AcceptInvite from './components/AcceptInvite';

const AppRoutes: React.FC = () => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
          <Sparkles size={32} />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 mb-2">Configuration Required</h1>
        <p className="text-zinc-500 max-w-sm mb-8">
          Please set your Supabase environment variables to start tracking your habits.
        </p>
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 w-full max-w-md text-left space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Required Variables</p>
            <code className="block bg-zinc-50 p-3 rounded-xl text-sm font-mono text-zinc-600">
              VITE_SUPABASE_URL<br />
              VITE_SUPABASE_ANON_KEY
            </code>
          </div>
          <p className="text-sm text-zinc-500 italic">
            Check the .env.example file for more details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={session ? <Navigate to="/dashboard" replace /> : <AuthPage />} 
      />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/confirmed" element={<AuthConfirmed />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* Default Redirects */}
      <Route 
        path="/" 
        element={<Navigate to={session ? "/dashboard" : "/login"} replace />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
