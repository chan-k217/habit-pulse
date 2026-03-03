import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { motion } from 'motion/react';
import { Sparkles, Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AuthPage: React.FC = () => {
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
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4f46e5',
                    brandAccent: '#4338ca',
                  },
                  radii: {
                    borderRadiusButton: '12px',
                    inputBorderRadius: '12px',
                  }
                }
              }
            }}
            providers={['google']}
            redirectTo={window.location.origin}
            theme="light"
          />
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
