export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  authUrl: string;
  scopes: string[];
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  provider: string;
  userInfo: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

class AuthService {
  private readonly STORAGE_KEY = 'balanced_card_auth_tokens';
  private tokens: Map<string, AuthToken> = new Map();

  constructor() {
    this.loadTokensFromStorage();
  }

  // OAuth Providers Configuration
  getProviders(): OAuthProvider[] {
    return [
      {
        id: 'jira',
        name: 'Atlassian (Jira)',
        icon: '🔷',
        color: '#0052CC',
        authUrl: 'https://auth.atlassian.com/authorize',
        scopes: ['read:jira-work', 'read:jira-user', 'offline_access']
      },
      {
        id: 'github',
        name: 'GitHub',
        icon: '🐙',
        color: '#24292e',
        authUrl: 'https://github.com/login/oauth/authorize',
        scopes: ['repo', 'user', 'project']
      },
      {
        id: 'google',
        name: 'Google Workspace',
        icon: '🔍',
        color: '#4285f4',
        authUrl: 'https://accounts.google.com/oauth2/v2/auth',
        scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']
      },
      {
        id: 'microsoft',
        name: 'Microsoft 365',
        icon: '📊',
        color: '#0078d4',
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        scopes: ['https://graph.microsoft.com/Files.Read', 'https://graph.microsoft.com/Sites.Read.All']
      },
      {
        id: 'slack',
        name: 'Slack',
        icon: '💬',
        color: '#4A154B',
        authUrl: 'https://slack.com/oauth/v2/authorize',
        scopes: ['channels:read', 'chat:read', 'users:read']
      },
      {
        id: 'salesforce',
        name: 'Salesforce',
        icon: '☁️',
        color: '#00A1E0',
        authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
        scopes: ['api', 'refresh_token']
      }
    ];
  }

  // Generate OAuth URL with PKCE
  generateAuthUrl(provider: OAuthProvider): string {
    const clientId = this.getClientId(provider.id);
    const redirectUri = `${window.location.origin}/auth/callback/${provider.id}`;
    const state = this.generateState();
    const codeChallenge = this.generateCodeChallenge();
    
    // Store state and code verifier for validation
    sessionStorage.setItem(`oauth_state_${provider.id}`, state);
    sessionStorage.setItem(`oauth_code_verifier_${provider.id}`, codeChallenge);

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: provider.scopes.join(' '),
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    return `${provider.authUrl}?${params.toString()}`;
  }

  // Handle OAuth callback
  async handleCallback(providerId: string, code: string, state: string): Promise<AuthToken> {
    const storedState = sessionStorage.getItem(`oauth_state_${providerId}`);
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    const codeVerifier = sessionStorage.getItem(`oauth_code_verifier_${providerId}`);
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    // Exchange code for token
    const token = await this.exchangeCodeForToken(providerId, code, codeVerifier);
    
    // Store token
    this.tokens.set(providerId, token);
    this.saveTokensToStorage();
    
    // Clean up session storage
    sessionStorage.removeItem(`oauth_state_${providerId}`);
    sessionStorage.removeItem(`oauth_code_verifier_${providerId}`);

    return token;
  }

  // Check if user is authenticated for a provider
  isAuthenticated(providerId: string): boolean {
    const token = this.tokens.get(providerId);
    if (!token) return false;
    
    return Date.now() < token.expiresAt;
  }

  // Get access token for API calls
  getAccessToken(providerId: string): string | null {
    const token = this.tokens.get(providerId);
    if (!token || Date.now() >= token.expiresAt) {
      return null;
    }
    return token.accessToken;
  }

  // Get user info
  getUserInfo(providerId: string) {
    const token = this.tokens.get(providerId);
    return token?.userInfo || null;
  }

  // Logout from a provider
  logout(providerId: string): void {
    this.tokens.delete(providerId);
    this.saveTokensToStorage();
  }

  // Logout from all providers
  logoutAll(): void {
    this.tokens.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Private helper methods
  private getClientId(providerId: string): string {
    // In production, these would be environment variables
    const clientIds: Record<string, string> = {
      jira: 'your-atlassian-client-id',
      github: 'your-github-client-id',
      google: 'your-google-client-id',
      microsoft: 'your-microsoft-client-id',
      slack: 'your-slack-client-id',
      salesforce: 'your-salesforce-client-id'
    };
    return clientIds[providerId] || '';
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private generateCodeChallenge(): string {
    // Simplified PKCE implementation
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private async exchangeCodeForToken(providerId: string, code: string, codeVerifier: string): Promise<AuthToken> {
    // This would make actual API calls to exchange the code for tokens
    // For demo purposes, returning mock data
    return {
      accessToken: `mock_access_token_${providerId}_${Date.now()}`,
      refreshToken: `mock_refresh_token_${providerId}_${Date.now()}`,
      expiresAt: Date.now() + (3600 * 1000), // 1 hour
      provider: providerId,
      userInfo: {
        id: `user_${Date.now()}`,
        name: 'John Doe',
        email: 'john.doe@company.com',
        avatar: `https://ui-avatars.com/api/?name=John+Doe&background=random`
      }
    };
  }

  private loadTokensFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const tokenData = JSON.parse(stored);
        this.tokens = new Map(Object.entries(tokenData));
      }
    } catch (error) {
      console.error('Failed to load auth tokens:', error);
    }
  }

  private saveTokensToStorage(): void {
    try {
      const tokenData = Object.fromEntries(this.tokens);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokenData));
    } catch (error) {
      console.error('Failed to save auth tokens:', error);
    }
  }
}

export const authService = new AuthService();