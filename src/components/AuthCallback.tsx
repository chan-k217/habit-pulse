import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error during auth callback:', error.message);
        navigate('/login?error=' + encodeURIComponent(error.message));
        return;
      }

      // Check if there's a type in the URL (e.g. recovery, signup)
      const hash = window.location.hash;
      const search = window.location.search;
      const hashParams = new URLSearchParams(hash.replace('#', '?'));
      const searchParams = new URLSearchParams(search);
      
      const type = hashParams.get('type') || searchParams.get('type');
      const errorMsg = hashParams.get('error_description') || searchParams.get('error_description');

      if (errorMsg) {
        console.error('Auth callback error:', errorMsg);
        navigate('/login?error=' + encodeURIComponent(errorMsg));
        return;
      }

      // If we see 'recovery' anywhere in the URL or hash, it's a password reset
      const isRecovery = type === 'recovery' || hash.includes('type=recovery') || search.includes('type=recovery');

      if (isRecovery) {
        navigate('/reset-password', { replace: true });
        return;
      } 
      
      if (type === 'signup' || hash.includes('type=signup')) {
        navigate('/auth/confirmed', { replace: true });
        return;
      } 
      
      if (type === 'invite' || hash.includes('type=invite')) {
        navigate('/accept-invite', { replace: true });
        return;
      }

      // For normal logins or if no type is detected, wait for the session to be fully established
      // but don't redirect if we've already handled a specific type above.
      const timeout = setTimeout(() => {
        // Only redirect to dashboard if we are still on the callback page
        if (window.location.pathname === '/auth/callback') {
          navigate('/dashboard', { replace: true });
        }
      }, 1000);

      return () => clearTimeout(timeout);
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-zinc-600 font-medium">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
