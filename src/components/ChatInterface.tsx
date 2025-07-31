import { useState } from 'react'
import { Send, Key } from 'lucide-react'
import { AgentService } from '../services/agentService'
import ReactMarkdown from 'react-markdown'
import { cn } from '../lib/utils'

export default function ChatInterface() {
  const [prompt, setPrompt] = useState('')
  const [authToken, setAuthToken] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Debug button state
  const isButtonDisabled = isLoading || !prompt.trim() || !authToken.trim()
  console.log('Button state:', { isLoading, promptLength: prompt.trim().length, authTokenLength: authToken.trim().length, isDisabled: isButtonDisabled })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Submit attempt:', { prompt: prompt.trim(), authToken: authToken.trim() });
    
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }
    
    if (!authToken.trim()) {
      setError('Please enter an authentication token')
      return
    }

    setIsLoading(true)
    setError('')
    setResponse('')

    try {
      const result = await AgentService.processPrompt(prompt, authToken)
      setResponse(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header with Logo and Auth */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="text-slate-400 text-sm">Powered by</div>
            <img src={`${import.meta.env.BASE_URL}logo_everworker.svg`} alt="Everworker" className="h-8 opacity-100 contrast-125" />
          </div>
          
          {/* Auth Token Input */}
          <div className="relative">
            <Key className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-500" />
            <input
              type="password"
              placeholder="Desktop Central Auth Token"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              className="cyber-auth-input pl-6 w-64"
            />
          </div>
        </div>

        {/* Main Chat Card */}
        <div className="cyber-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Ask Everworker to analyze a contract..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                className={cn(
                  "cyber-input flex-1",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              />
              <button
                type="submit"
                disabled={isButtonDisabled}
                className={cn(
                  "cyber-button flex items-center gap-2 shrink-0",
                  isButtonDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Response Display */}
          {response && (
            <div className="mt-8">
              <div className="border-t border-slate-700/50 pt-6">
                <div className="prose prose-invert prose-slate max-w-none">
                  <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-6">
                    <div className="text-slate-200 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown 
                        components={{
                        h1: ({children}) => <h1 className="text-xl font-bold text-cyber-purple mb-4">{children}</h1>,
                        h2: ({children}) => <h2 className="text-lg font-semibold text-cyber-blue mb-3">{children}</h2>,
                        h3: ({children}) => <h3 className="text-md font-medium text-cyber-pink mb-2">{children}</h3>,
                        p: ({children}) => <p className="mb-4 leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                        li: ({children}) => <li className="text-slate-300">{children}</li>,
                        code: ({children}) => <code className="bg-slate-700/50 px-2 py-1 rounded text-cyber-green font-mono text-sm">{children}</code>,
                        pre: ({children}) => <pre className="bg-slate-900/50 p-4 rounded-lg overflow-x-auto mb-4 border border-slate-700/30">{children}</pre>,
                        blockquote: ({children}) => <blockquote className="border-l-4 border-cyber-purple pl-4 italic text-slate-400 mb-4">{children}</blockquote>,
                      }}
                      >
                        {response}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}