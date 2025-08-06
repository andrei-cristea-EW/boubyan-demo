import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { OAuthCredentials } from '../services/authService';

export default function OAuthCallback() {
  const { handleCallback, error, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      console.error('OAuth error:', errorParam);
      // Clean up credentials
      sessionStorage.removeItem('oauth_credentials');
      navigate('/', { replace: true });
      return;
    }

    if (code && state) {
      // Retrieve credentials from sessionStorage
      const credentialsJson = sessionStorage.getItem('oauth_credentials');
      if (!credentialsJson) {
        console.error('OAuth credentials not found in session');
        navigate('/', { replace: true });
        return;
      }

      try {
        const credentials: OAuthCredentials = JSON.parse(credentialsJson);
        sessionStorage.removeItem('oauth_credentials'); // Clean up
        
        handleCallback(code, state, credentials).then(() => {
          navigate('/', { replace: true });
        }).catch((error) => {
          console.error('Callback error:', error);
          // Don't redirect immediately on error, let user see it
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
        });
      } catch (parseError) {
        console.error('Failed to parse OAuth credentials:', parseError);
        navigate('/', { replace: true });
      }
    } else {
      console.error('Missing code or state parameter');
      sessionStorage.removeItem('oauth_credentials');
      navigate('/', { replace: true });
    }
  }, [handleCallback, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-4">
        <div className="cyber-card p-8 text-center">
          <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-violet-500 mb-2">Authenticating...</h2>
          <p className="text-slate-400">Please wait while we complete your login.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-4">
        <div className="cyber-card p-8 text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-4">Authentication Failed</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/', { replace: true })}
            className="cyber-button"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}