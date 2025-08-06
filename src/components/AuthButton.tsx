import { useState } from 'react';
import { Key, LogIn, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function AuthButton() {
  const { isAuthenticated, login, logout, setManualToken, isLoading } = useAuth();
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [showOAuthInputs, setShowOAuthInputs] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [clientId, setClientId] = useState('1000.K37JWRX7Q8ZQY7WI1PLTPG0C7P4WON'); // Default value
  const [clientSecret, setClientSecret] = useState('');

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      setManualToken(tokenInput.trim());
      setTokenInput('');
      setShowTokenInput(false);
    }
  };

  const handleOAuthLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientId.trim() && clientSecret.trim()) {
      // Store credentials in sessionStorage for the callback
      sessionStorage.setItem('oauth_credentials', JSON.stringify({
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim()
      }));
      login(clientId.trim());
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 bg-green-900/30 border border-green-700/50 rounded-lg text-green-400 text-sm font-medium">
          Logged in
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            logout();
          }}
          className="p-2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer bg-transparent border-0 rounded-md hover:bg-slate-800/50 pointer-events-auto relative z-10"
          title="Logout"
          style={{ pointerEvents: 'auto' }}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (showOAuthInputs) {
    return (
      <form onSubmit={handleOAuthLogin} className="flex flex-col gap-3 p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg">
        <div className="text-sm font-medium text-violet-400 mb-1">OAuth Credentials</div>
        
        <div className="flex flex-col gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="cyber-auth-input w-80 text-sm"
              autoFocus
            />
          </div>
          
          <div className="relative">
            <Key className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-500" />
            <input
              type="password"
              placeholder="Client Secret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="cyber-auth-input pl-6 w-80 text-sm"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <button
            type="submit"
            className="cyber-button text-sm py-2 px-4"
          >
            Login with OAuth
          </button>
          <button
            type="button"
            onClick={() => setShowOAuthInputs(false)}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  if (showTokenInput) {
    return (
      <form onSubmit={handleManualTokenSubmit} className="flex items-center gap-2">
        <div className="relative">
          <Key className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-500" />
          <input
            type="password"
            placeholder="Paste your auth token"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="cyber-auth-input pl-6 w-64"
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={!tokenInput.trim()}
          className={cn(
            "px-3 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors",
            !tokenInput.trim() && "opacity-50 cursor-not-allowed"
          )}
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setShowTokenInput(false)}
          className="px-3 py-1 bg-slate-600 hover:bg-slate-700 rounded text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowOAuthInputs(true)}
        disabled={isLoading}
        className={cn(
          "cyber-button flex items-center gap-2 text-sm",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
        title="Login with Desktop Central OAuth"
      >
        {isLoading ? (
          <>
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            Login to Desktop Central
            <ExternalLink className="w-3 h-3" />
          </>
        )}
      </button>
      <span className="text-slate-500 text-sm">or</span>
      <button
        onClick={() => setShowTokenInput(true)}
        className="text-slate-400 hover:text-slate-200 underline text-sm transition-colors"
      >
        Enter token manually
      </button>
    </div>
  );
}