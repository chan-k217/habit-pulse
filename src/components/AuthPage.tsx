import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Flame, Mail, Lock, User, AtSign, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password' | 'magic-link'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              nickname: nickname || fullName.split(' ')[0],
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) throw signUpError;
        setSuccessMessage("We've sent a verification link to your email. Please verify your account to continue.");
        setSuccess(true);
      } else if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else if (mode === 'forgot-password') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback`,
        });
        if (resetError) throw resetError;
        setSuccessMessage("We've sent a password reset link to your email.");
        setSuccess(true);
      } else if (mode === 'magic-link') {
        const { error: magicError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        if (magicError) throw magicError;
        setSuccessMessage("We've sent a magic link to your email.");
        setSuccess(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-8 rounded-[32px] shadow-xl shadow-zinc-200/50 border border-zinc-100 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="text-emerald-600" size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-zinc-900">Check your email</h2>
            <p className="text-zinc-500">{successMessage}</p>
          </div>
          <button 
            onClick={() => {
              setSuccess(false);
              setMode('login');
            }}
            className="text-indigo-600 font-bold text-sm hover:underline"
          >
            Back to login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-200 mb-6">
            <Flame size={32} className="text-white" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">HabitPulse</h1>
          <p className="text-zinc-500 font-medium">The world's most advanced habit tracker.</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-zinc-200/50 border border-zinc-100">
          <div className="flex p-1 bg-zinc-100 rounded-2xl mb-8">
            <button 
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${mode === 'login' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${mode === 'signup' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        required
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Nickname (Optional)</label>
                    <div className="relative">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        type="text"
                        placeholder="johnny"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            {(mode === 'login' || mode === 'signup') && (
              <div className="space-y-1">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Password</label>
                  {mode === 'login' && (
                    <button 
                      type="button"
                      onClick={() => setMode('forgot-password')}
                      className="text-[10px] font-bold text-indigo-600 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    required
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                {error}
              </p>
            )}

            <button 
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot-password' && 'Send Reset Link'}
                  {mode === 'magic-link' && 'Send Magic Link'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              {mode === 'login' ? (
                <button 
                  type="button"
                  onClick={() => setMode('magic-link')}
                  className="text-xs font-bold text-zinc-500 hover:text-indigo-600 transition-colors"
                >
                  Sign in with Magic Link
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-bold text-zinc-500 hover:text-indigo-600 transition-colors"
                >
                  Back to Login
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-zinc-400 font-medium flex items-center justify-center gap-1">
            <Sparkles size={12} /> Join 10,000+ users building better lives
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
