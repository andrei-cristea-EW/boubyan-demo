export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  obtained_at: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
}

export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
}

export class AuthService {
  private static readonly ZOHO_BASE_URL = 'https://accounts.zoho.eu';
  private static readonly REDIRECT_URI = `${window.location.origin}/oauth/callback`;
  private static readonly SCOPE = 'DesktopCentralCloud.Common.READ,DesktopCentralCloud.Common.Update,DesktopCentralCloud.Inventory.READ';
  private static readonly STORAGE_KEY = 'desktop_central_tokens';

  static generateAuthUrl(clientId: string): string {
    const state = crypto.getRandomValues(new Uint32Array(4)).join('');
    sessionStorage.setItem('oauth_state', state);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: this.SCOPE,
      redirect_uri: this.REDIRECT_URI,
      access_type: 'offline',
      prompt: 'consent',
      state: state
    });

    return `${this.ZOHO_BASE_URL}/oauth/v2/auth?${params.toString()}`;
  }

  static setManualToken(token: string): AuthTokens {
    const tokens: AuthTokens = {
      access_token: token,
      obtained_at: Date.now()
    };
    this.saveTokens(tokens);
    return tokens;
  }

  static async handleCallback(code: string, state: string, credentials: OAuthCredentials): Promise<AuthTokens> {
    const savedState = sessionStorage.getItem('oauth_state');
    if (state !== savedState) {
      throw new Error('Invalid OAuth state parameter - possible security issue');
    }
    
    sessionStorage.removeItem('oauth_state');
    
    try {
      const params = new URLSearchParams({
        code: code,
        grant_type: 'authorization_code',
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        redirect_uri: this.REDIRECT_URI,
        scope: this.SCOPE
      });

      const response = await fetch(`${this.ZOHO_BASE_URL}/oauth/v2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token exchange failed:', response.status, response.statusText, errorText);
        throw new Error(`Failed to exchange authorization code for tokens: ${response.status} ${response.statusText}`);
      }

      const tokenResponse = await response.json();
      
      const tokens: AuthTokens = {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        expires_in: tokenResponse.expires_in,
        obtained_at: Date.now()
      };

      this.saveTokens(tokens);
      return tokens;
    } catch (error) {
      console.error('Error during token exchange:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error: Unable to connect to Zoho OAuth server. Please check your internet connection.');
      }
      throw error;
    }
  }

  static saveTokens(tokens: AuthTokens): void {
    const tokenData = {
      ...tokens,
      obtained_at: Date.now()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokenData));
  }

  static getStoredTokens(): AuthTokens | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  static clearTokens(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static isTokenValid(tokens: AuthTokens | null): boolean {
    if (!tokens || !tokens.access_token) return false;
    
    if (tokens.expires_in && tokens.obtained_at) {
      const expiresAt = tokens.obtained_at + (tokens.expires_in * 1000);
      const now = Date.now();
      const buffer = 5 * 60 * 1000; // 5 minute buffer
      
      return now < (expiresAt - buffer);
    }
    
    return true;
  }

  static getCurrentToken(): string | null {
    const tokens = this.getStoredTokens();
    if (!tokens || !this.isTokenValid(tokens)) {
      return null;
    }
    return tokens.access_token;
  }

  static logout(): void {
    this.clearTokens();
  }
}