import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { CheckCircle2 } from 'lucide-react';

const AuthConfirmed: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-50 p-4 rounded-full">
            <CheckCircle2 className="text-emerald-500" size={48} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Email Confirmed!</h1>
        <p className="text-zinc-600 mb-8">
          Your account has been successfully verified. You're all set to start building better habits.
        </p>
        <div className="animate-pulse flex items-center justify-center gap-2 text-indigo-600 font-medium">
          <span>Redirecting to dashboard...</span>
        </div>
      </div>
    </div>
  );
};

export default AuthConfirmed;
