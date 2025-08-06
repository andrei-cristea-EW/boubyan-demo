import { Routes, Route } from 'react-router-dom'
import ChatInterface from './components/ChatInterface'
import OAuthCallback from './components/OAuthCallback'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<ChatInterface />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="*" element={<ChatInterface />} />
      </Routes>
    </AuthProvider>
  )
}

export default App