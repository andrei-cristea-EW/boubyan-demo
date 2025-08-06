import { useState } from 'react'
import { Send } from 'lucide-react'
import { AgentService } from '../services/agentService'
import { useAuth } from '../contexts/AuthContext'
import { AuthService } from '../services/authService'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '../lib/utils'
import UsageChart from './UsageChart'
import AuthButton from './AuthButton'
import AuthInstructions from './AuthInstructions'

interface ChartDataItem {
  product: string
  currentUsage: number
  proposedLicenses: number
}

interface ParsedResponse {
  usage: string
  proposal: string
  suggestions: string
  chartData?: ChartDataItem[]
}

export default function ChatInterface() {
  const { isAuthenticated } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [parsedResponse, setParsedResponse] = useState<ParsedResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const authToken = AuthService.getCurrentToken()
  const isButtonDisabled = isLoading || !prompt.trim() || !isAuthenticated || !authToken

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }
    
    if (!authToken) {
      setError('Please authenticate first')
      return
    }

    setIsLoading(true)
    setError('')
    setResponse('')
    setParsedResponse(null)

    try {
      const result = await AgentService.processPrompt(prompt, authToken)
      console.log('Raw API response:', result)
      console.log('Response type:', typeof result)
      
      // Handle different response types
      let responseString: string
      if (typeof result === 'string') {
        responseString = result
      } else {
        // If result is already an object, stringify it
        responseString = JSON.stringify(result)
      }
      
      setResponse(responseString)
      
      // Try to parse JSON response
      try {
        let parsed: ParsedResponse | null = null
        
        if (typeof result === 'object' && result !== null) {
          // If result is already parsed, check if it has the expected structure
          if ('usage' in result && 'proposal' in result && 'suggestions' in result) {
            parsed = result as ParsedResponse
          }
        } else {
          // If result is a string, try to parse it
          const jsonResult = JSON.parse(responseString)
          if (jsonResult.usage && jsonResult.proposal && jsonResult.suggestions) {
            parsed = jsonResult as ParsedResponse
          }
        }
        
        if (parsed && parsed.usage && parsed.proposal && parsed.suggestions) {
          console.log('Successfully parsed structured response')
          setParsedResponse(parsed)
        } else {
          console.log('Response missing required fields, treating as markdown')
          setParsedResponse(null)
        }
      } catch (parseError) {
        console.log('Failed to parse as structured response, treating as plain markdown:', parseError)
        setParsedResponse(null)
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-4">
      <div className={cn(
        "w-full transition-all duration-500",
        parsedResponse ? "max-w-7xl" : "max-w-4xl"
      )}>
        {/* Header with Logo and Auth */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="text-slate-400 text-sm">Powered by</div>
            <img src={`${import.meta.env.BASE_URL}logo_everworker.svg`} alt="Everworker" className="h-8 opacity-100 contrast-125" />
          </div>
          
          {/* Authentication */}
          <AuthButton />
        </div>

        {/* Authentication Instructions - Only show when not authenticated */}
        {!isAuthenticated && <AuthInstructions />}

        {/* Main Chat Card */}
        <div className={cn(
          "cyber-card p-8 transition-all duration-500",
          parsedResponse && "w-full"
        )}>
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
                {parsedResponse ? (
                  /* Three-section layout for JSON response */
                  <div className="space-y-6">
                    {/* Top row: Usage and Proposal side by side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Usage Section */}
                      <div className="cyber-card p-6">
                        <div className="prose prose-invert prose-slate max-w-none">
                          <div className="markdown-content text-slate-200 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({children}) => <h1 className="text-lg font-bold text-violet-500 mb-3">{children}</h1>,
                                h2: ({children}) => <h2 className="text-md font-semibold text-sky-500 mb-2">{children}</h2>,
                                h3: ({children}) => <h3 className="text-sm font-medium text-pink-500 mb-2">{children}</h3>,
                                p: ({children}) => <p className="mb-3 leading-relaxed text-sm">{children}</p>,
                                ul: ({children}) => <ul className="list-disc list-outside mb-3 space-y-1 ml-4">{children}</ul>,
                                ol: ({children}) => <ol className="mb-3 space-y-1 ml-4">{children}</ol>,
                                li: ({children}) => <li className="text-slate-300 text-sm">{children}</li>,
                                code: ({children}) => <code className="bg-slate-700/50 px-2 py-1 rounded text-emerald-500 font-mono text-xs">{children}</code>,
                                pre: ({children}) => <pre className="bg-slate-900/50 p-3 rounded-lg overflow-x-auto mb-3 border border-slate-700/30 text-xs">{children}</pre>,
                                strong: ({children}) => <strong className="text-violet-500 font-semibold">{children}</strong>,
                                table: ({children}) => <table className="min-w-full border-collapse border border-slate-600 my-3 text-xs">{children}</table>,
                                thead: ({children}) => <thead className="bg-slate-800">{children}</thead>,
                                tbody: ({children}) => <tbody>{children}</tbody>,
                                tr: ({children}) => <tr className="border-b border-slate-700">{children}</tr>,
                                th: ({children}) => <th className="border border-slate-600 px-2 py-1 text-left font-semibold text-violet-400 text-xs">{children}</th>,
                                td: ({children}) => <td className="border border-slate-600 px-2 py-1 text-xs">{children}</td>,
                              }}
                            >
                              {typeof parsedResponse.usage === 'string' ? parsedResponse.usage : JSON.stringify(parsedResponse.usage)}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>

                      {/* Proposal Section */}
                      <div className="cyber-card p-6">
                        <div className="prose prose-invert prose-slate max-w-none">
                          <div className="markdown-content text-slate-200 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({children}) => <h1 className="text-lg font-bold text-violet-500 mb-3">{children}</h1>,
                                h2: ({children}) => <h2 className="text-md font-semibold text-sky-500 mb-2">{children}</h2>,
                                h3: ({children}) => <h3 className="text-sm font-medium text-pink-500 mb-2">{children}</h3>,
                                p: ({children}) => <p className="mb-3 leading-relaxed text-sm">{children}</p>,
                                ul: ({children}) => <ul className="list-disc list-outside mb-3 space-y-1 ml-4">{children}</ul>,
                                ol: ({children}) => <ol className="mb-3 space-y-1 ml-4">{children}</ol>,
                                li: ({children}) => <li className="text-slate-300 text-sm">{children}</li>,
                                code: ({children}) => <code className="bg-slate-700/50 px-2 py-1 rounded text-emerald-500 font-mono text-xs">{children}</code>,
                                pre: ({children}) => <pre className="bg-slate-900/50 p-3 rounded-lg overflow-x-auto mb-3 border border-slate-700/30 text-xs">{children}</pre>,
                                strong: ({children}) => <strong className="text-violet-500 font-semibold">{children}</strong>,
                                table: ({children}) => <table className="min-w-full border-collapse border border-slate-600 my-3 text-xs">{children}</table>,
                                thead: ({children}) => <thead className="bg-slate-800">{children}</thead>,
                                tbody: ({children}) => <tbody>{children}</tbody>,
                                tr: ({children}) => <tr className="border-b border-slate-700">{children}</tr>,
                                th: ({children}) => <th className="border border-slate-600 px-2 py-1 text-left font-semibold text-violet-400 text-xs">{children}</th>,
                                td: ({children}) => <td className="border border-slate-600 px-2 py-1 text-xs">{children}</td>,
                              }}
                            >
                              {typeof parsedResponse.proposal === 'string' ? parsedResponse.proposal : JSON.stringify(parsedResponse.proposal)}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chart Section - Full width */}
                    {parsedResponse.chartData && parsedResponse.chartData.length > 0 && (
                      <UsageChart data={parsedResponse.chartData} />
                    )}

                    {/* Bottom row: Suggestions full width */}
                    <div className="cyber-card p-6">
                      <div className="prose prose-invert prose-slate max-w-none">
                        <div className="markdown-content text-slate-200 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({children}) => <h1 className="text-xl font-bold text-violet-500 mb-4">{children}</h1>,
                              h2: ({children}) => <h2 className="text-lg font-semibold text-sky-500 mb-3">{children}</h2>,
                              h3: ({children}) => <h3 className="text-md font-medium text-pink-500 mb-2">{children}</h3>,
                              p: ({children}) => <p className="mb-4 leading-relaxed">{children}</p>,
                              ul: ({children}) => <ul className="list-disc list-outside mb-4 space-y-1 ml-4">{children}</ul>,
                              ol: ({children}) => <ol className="mb-4 space-y-1 ml-4">{children}</ol>,
                              li: ({children}) => <li className="text-slate-300">{children}</li>,
                              code: ({children}) => <code className="bg-slate-700/50 px-2 py-1 rounded text-emerald-500 font-mono text-sm">{children}</code>,
                              pre: ({children}) => <pre className="bg-slate-900/50 p-4 rounded-lg overflow-x-auto mb-4 border border-slate-700/30">{children}</pre>,
                              blockquote: ({children}) => <blockquote className="border-l-4 border-violet-500 pl-4 italic text-slate-400 mb-4">{children}</blockquote>,
                              strong: ({children}) => <strong className="text-pink-500 font-semibold">{children}</strong>,
                              table: ({children}) => <table className="min-w-full border-collapse border border-slate-600 my-4">{children}</table>,
                              thead: ({children}) => <thead className="bg-slate-800">{children}</thead>,
                              tbody: ({children}) => <tbody>{children}</tbody>,
                              tr: ({children}) => <tr className="border-b border-slate-700">{children}</tr>,
                              th: ({children}) => <th className="border border-slate-600 px-3 py-2 text-left font-semibold text-violet-400">{children}</th>,
                              td: ({children}) => <td className="border border-slate-600 px-3 py-2">{children}</td>,
                            }}
                          >
                            {typeof parsedResponse.suggestions === 'string' ? parsedResponse.suggestions : JSON.stringify(parsedResponse.suggestions)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Fallback for non-JSON response */
                  <div className="prose prose-invert prose-slate max-w-none">
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-6">
                      <div className="text-slate-200 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                          h1: ({children}) => <h1 className="text-xl font-bold text-violet-500 mb-4">{children}</h1>,
                          h2: ({children}) => <h2 className="text-lg font-semibold text-sky-500 mb-3">{children}</h2>,
                          h3: ({children}) => <h3 className="text-md font-medium text-pink-500 mb-2">{children}</h3>,
                          p: ({children}) => <p className="mb-4 leading-relaxed">{children}</p>,
                          ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                          li: ({children}) => <li className="text-slate-300">{children}</li>,
                          code: ({children}) => <code className="bg-slate-700/50 px-2 py-1 rounded text-emerald-500 font-mono text-sm">{children}</code>,
                          pre: ({children}) => <pre className="bg-slate-900/50 p-4 rounded-lg overflow-x-auto mb-4 border border-slate-700/30">{children}</pre>,
                          blockquote: ({children}) => <blockquote className="border-l-4 border-violet-500 pl-4 italic text-slate-400 mb-4">{children}</blockquote>,
                          table: ({children}) => <table className="min-w-full border-collapse border border-slate-600 my-4">{children}</table>,
                          thead: ({children}) => <thead className="bg-slate-800">{children}</thead>,
                          tbody: ({children}) => <tbody>{children}</tbody>,
                          tr: ({children}) => <tr className="border-b border-slate-700">{children}</tr>,
                          th: ({children}) => <th className="border border-slate-600 px-3 py-2 text-left font-semibold text-violet-400">{children}</th>,
                          td: ({children}) => <td className="border border-slate-600 px-3 py-2">{children}</td>,
                        }}
                        >
                          {typeof response === 'string' ? response : JSON.stringify(response)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}