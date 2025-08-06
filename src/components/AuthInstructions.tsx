import { Terminal, Key } from 'lucide-react';

export default function AuthInstructions() {
  return (
    <div className="cyber-card p-6 max-w-2xl mx-auto mb-8">
      <h3 className="text-lg font-semibold text-violet-500 mb-4 flex items-center gap-2">
        <Key className="w-5 h-5" />
        Desktop Central Authentication
      </h3>
      
      <div className="space-y-4 text-slate-300 text-sm">
        <p>
          To authenticate with Desktop Central, you have two options:
        </p>
        
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
          <h4 className="font-medium text-violet-400 mb-2">Option 1: Quick Manual Token</h4>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Click "Enter token manually" above</li>
            <li>Run the auth script to get your token:</li>
            <div className="bg-slate-900/50 p-2 rounded mt-2 font-mono text-xs text-emerald-500 flex items-center gap-2">
              <Terminal className="w-3 h-3" />
              <code>node /Users/crivatz/Documents/Dev/desktop_central_api/auth.js</code>
            </div>
            <li>Copy the auth token from the console output</li>
            <li>Paste it in the token input field</li>
          </ol>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
          <h4 className="font-medium text-sky-400 mb-2">Option 2: OAuth Login</h4>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Click "Login to Desktop Central" above</li>
            <li>Enter your OAuth app's Client ID and Client Secret</li>
            <li>Click "Login with OAuth" to be redirected to Zoho</li>
            <li>Complete the authentication on Zoho's website</li>
            <li>You'll be redirected back and automatically logged in</li>
          </ol>
          <p className="text-amber-400 text-xs mt-2">
            ⚠️ Note: Client secrets will be visible in browser memory - for production use, consider a backend server.
          </p>
        </div>
      </div>
    </div>
  );
}