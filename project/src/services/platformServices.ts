import { authService } from './authService';

// Generic interface for all platform services
export interface PlatformService {
  isAuthenticated(): boolean;
  getProjects(): Promise<any[]>;
  getIssues(projectId?: string): Promise<any[]>;
  searchData(query: string): Promise<any[]>;
  getAnalytics(): Promise<any>;
}

// Jira Service with OAuth
class JiraOAuthService implements PlatformService {
  isAuthenticated(): boolean {
    return authService.isAuthenticated('jira');
  }

  async getProjects(): Promise<any[]> {
    const token = authService.getAccessToken('jira');
    if (!token) throw new Error('Not authenticated');

    // Mock implementation - replace with actual Atlassian API calls
    return [
      { id: '1', key: 'PROJ', name: 'Sample Project', lead: 'John Doe' },
      { id: '2', key: 'DEV', name: 'Development', lead: 'Jane Smith' }
    ];
  }

  async getIssues(projectId?: string): Promise<any[]> {
    const token = authService.getAccessToken('jira');
    if (!token) throw new Error('Not authenticated');

    // Mock implementation
    return [
      {
        id: '1',
        key: 'PROJ-1',
        summary: 'Sample Issue',
        status: 'In Progress',
        priority: 'High',
        assignee: 'John Doe'
      }
    ];
  }

  async searchData(query: string): Promise<any[]> {
    const token = authService.getAccessToken('jira');
    if (!token) throw new Error('Not authenticated');

    // Mock search implementation
    return [];
  }

  async getAnalytics(): Promise<any> {
    const token = authService.getAccessToken('jira');
    if (!token) throw new Error('Not authenticated');

    return {
      totalIssues: 150,
      openIssues: 45,
      resolvedThisMonth: 23,
      statusBreakdown: {
        'To Do': 20,
        'In Progress': 25,
        'Done': 105
      }
    };
  }
}

// GitHub Service with OAuth
class GitHubOAuthService implements PlatformService {
  isAuthenticated(): boolean {
    return authService.isAuthenticated('github');
  }

  async getProjects(): Promise<any[]> {
    const token = authService.getAccessToken('github');
    if (!token) throw new Error('Not authenticated');

    // Mock GitHub repositories
    return [
      { id: '1', name: 'web-app', fullName: 'company/web-app', language: 'TypeScript' },
      { id: '2', name: 'api-service', fullName: 'company/api-service', language: 'Python' }
    ];
  }

  async getIssues(projectId?: string): Promise<any[]> {
    const token = authService.getAccessToken('github');
    if (!token) throw new Error('Not authenticated');

    return [
      {
        id: '1',
        number: 42,
        title: 'Bug in user authentication',
        state: 'open',
        assignee: 'developer1',
        labels: ['bug', 'high-priority']
      }
    ];
  }

  async searchData(query: string): Promise<any[]> {
    const token = authService.getAccessToken('github');
    if (!token) throw new Error('Not authenticated');

    return [];
  }

  async getAnalytics(): Promise<any> {
    const token = authService.getAccessToken('github');
    if (!token) throw new Error('Not authenticated');

    return {
      totalRepos: 25,
      openIssues: 12,
      pullRequests: 8,
      commits: 156
    };
  }
}

// Google Workspace Service
class GoogleWorkspaceService implements PlatformService {
  isAuthenticated(): boolean {
    return authService.isAuthenticated('google');
  }

  async getProjects(): Promise<any[]> {
    const token = authService.getAccessToken('google');
    if (!token) throw new Error('Not authenticated');

    return [
      { id: '1', name: 'Q4 Reports', type: 'spreadsheet' },
      { id: '2', name: 'Project Documentation', type: 'document' }
    ];
  }

  async getIssues(): Promise<any[]> {
    return []; // Google Workspace doesn't have "issues"
  }

  async searchData(query: string): Promise<any[]> {
    const token = authService.getAccessToken('google');
    if (!token) throw new Error('Not authenticated');

    return [];
  }

  async getAnalytics(): Promise<any> {
    const token = authService.getAccessToken('google');
    if (!token) throw new Error('Not authenticated');

    return {
      totalFiles: 1250,
      sharedFiles: 340,
      recentActivity: 45
    };
  }
}

// Service factory
export class PlatformServiceFactory {
  static getService(platform: string): PlatformService {
    switch (platform) {
      case 'jira':
        return new JiraOAuthService();
      case 'github':
        return new GitHubOAuthService();
      case 'google':
        return new GoogleWorkspaceService();
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  static getAvailableServices(): string[] {
    return ['jira', 'github', 'google', 'microsoft', 'slack', 'salesforce'];
  }

  static getConnectedServices(): string[] {
    return this.getAvailableServices().filter(service => 
      authService.isAuthenticated(service)
    );
  }
}