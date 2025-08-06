import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AuthService } from '../services/authService';
import type { AuthState, AuthTokens, OAuthCredentials } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (clientId: string) => void;
  logout: () => void;
  setManualToken: (token: string) => void;
  handleCallback: (code: string, state: string, credentials: OAuthCredentials) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: AuthTokens }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'SET_AUTHENTICATED':
      return {
        isAuthenticated: true,
        tokens: action.payload,
        isLoading: false,
        error: null
      };
    case 'SET_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        isAuthenticated: false,
        tokens: null,
        isLoading: false,
        error: null
      };
    default:
      return state;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    tokens: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const tokens = AuthService.getStoredTokens();
    if (tokens && AuthService.isTokenValid(tokens)) {
      dispatch({ type: 'SET_AUTHENTICATED', payload: tokens });
    } else {
      AuthService.clearTokens();
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = (clientId: string) => {
    const authUrl = AuthService.generateAuthUrl(clientId);
    window.location.href = authUrl;
  };

  const logout = () => {
    AuthService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const setManualToken = (token: string) => {
    try {
      const tokens = AuthService.setManualToken(token);
      dispatch({ type: 'SET_AUTHENTICATED', payload: tokens });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid token';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const handleCallback = async (code: string, state: string, credentials: OAuthCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const tokens = await AuthService.handleCallback(code, state, credentials);
      dispatch({ type: 'SET_AUTHENTICATED', payload: tokens });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        ...state,
        login,
        logout,
        setManualToken,
        handleCallback
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}