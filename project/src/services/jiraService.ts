import axios from 'axios';

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  status: string;
  priority: string;
  assignee: string | null;
  reporter: string;
  created: string;
  updated: string;
  resolved: string | null;
  issueType: string;
  project: string;
  storyPoints?: number;
  labels: string[];
  components: string[];
  fixVersions: string[];
  description?: string;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  lead: string;
  issueCount?: number;
}

export interface JiraUser {
  accountId: string;
  displayName: string;
  emailAddress: string;
  active: boolean;
}

class JiraService {
  private config: JiraConfig | null = null;
  private axiosInstance = axios.create();

  setConfig(config: JiraConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: `${config.baseUrl}/rest/api/3`,
      headers: {
        'Authorization': `Basic ${btoa(`${config.email}:${config.apiToken}`)}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.config) throw new Error('Jira not configured');
      
      const response = await this.axiosInstance.get('/myself');
      return response.status === 200;
    } catch (error) {
      console.error('Jira connection test failed:', error);
      return false;
    }
  }

  async getProjects(): Promise<JiraProject[]> {
    try {
      if (!this.config) throw new Error('Jira not configured');
      
      const response = await this.axiosInstance.get('/project/search');
      
      return response.data.values.map((project: any) => ({
        id: project.id,
        key: project.key,
        name: project.name,
        projectTypeKey: project.projectTypeKey,
        lead: project.lead?.displayName || 'Unknown'
      }));
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      throw error;
    }
  }

  async getIssues(projectKey?: string, maxResults: number = 100): Promise<JiraIssue[]> {
    try {
      if (!this.config) throw new Error('Jira not configured');
      
      let jql = 'ORDER BY created DESC';
      if (projectKey) {
        jql = `project = ${projectKey} ORDER BY created DESC`;
      }

      const response = await this.axiosInstance.get('/search', {
        params: {
          jql,
          maxResults,
          fields: [
            'summary',
            'status',
            'priority',
            'assignee',
            'reporter',
            'created',
            'updated',
            'resolved',
            'issuetype',
            'project',
            'customfield_10016', // Story Points (common field)
            'labels',
            'components',
            'fixVersions',
            'description'
          ].join(',')
        }
      });

      return response.data.issues.map((issue: any) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        priority: issue.fields.priority?.name || 'None',
        assignee: issue.fields.assignee?.displayName || null,
        reporter: issue.fields.reporter?.displayName || 'Unknown',
        created: issue.fields.created,
        updated: issue.fields.updated,
        resolved: issue.fields.resolved,
        issueType: issue.fields.issuetype.name,
        project: issue.fields.project.key,
        storyPoints: issue.fields.customfield_10016,
        labels: issue.fields.labels || [],
        components: issue.fields.components?.map((c: any) => c.name) || [],
        fixVersions: issue.fields.fixVersions?.map((v: any) => v.name) || [],
        description: issue.fields.description?.content?.[0]?.content?.[0]?.text || ''
      }));
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      throw error;
    }
  }

  async getIssuesByStatus(): Promise<Record<string, number>> {
    try {
      const issues = await this.getIssues(undefined, 1000);
      const statusCounts: Record<string, number> = {};
      
      issues.forEach(issue => {
        statusCounts[issue.status] = (statusCounts[issue.status] || 0) + 1;
      });
      
      return statusCounts;
    } catch (error) {
      console.error('Failed to get issues by status:', error);
      throw error;
    }
  }

  async getIssuesByPriority(): Promise<Record<string, number>> {
    try {
      const issues = await this.getIssues(undefined, 1000);
      const priorityCounts: Record<string, number> = {};
      
      issues.forEach(issue => {
        priorityCounts[issue.priority] = (priorityCounts[issue.priority] || 0) + 1;
      });
      
      return priorityCounts;
    } catch (error) {
      console.error('Failed to get issues by priority:', error);
      throw error;
    }
  }

  async getIssuesByAssignee(): Promise<Record<string, number>> {
    try {
      const issues = await this.getIssues(undefined, 1000);
      const assigneeCounts: Record<string, number> = {};
      
      issues.forEach(issue => {
        const assignee = issue.assignee || 'Unassigned';
        assigneeCounts[assignee] = (assigneeCounts[assignee] || 0) + 1;
      });
      
      return assigneeCounts;
    } catch (error) {
      console.error('Failed to get issues by assignee:', error);
      throw error;
    }
  }

  async getVelocityData(projectKey: string, sprints: number = 6): Promise<any[]> {
    try {
      if (!this.config) throw new Error('Jira not configured');
      
      // This is a simplified version - in production you'd want to use the Agile API
      const issues = await this.getIssues(projectKey, 500);
      const resolvedIssues = issues.filter(issue => issue.resolved);
      
      // Group by month for velocity tracking
      const monthlyData: Record<string, { completed: number, storyPoints: number }> = {};
      
      resolvedIssues.forEach(issue => {
        const month = new Date(issue.resolved!).toISOString().slice(0, 7);
        if (!monthlyData[month]) {
          monthlyData[month] = { completed: 0, storyPoints: 0 };
        }
        monthlyData[month].completed++;
        monthlyData[month].storyPoints += issue.storyPoints || 1;
      });
      
      return Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-sprints)
        .map(([month, data]) => ({
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          completed: data.completed,
          storyPoints: data.storyPoints
        }));
    } catch (error) {
      console.error('Failed to get velocity data:', error);
      throw error;
    }
  }

  async searchIssues(query: string): Promise<JiraIssue[]> {
    try {
      if (!this.config) throw new Error('Jira not configured');
      
      const jql = `text ~ "${query}" ORDER BY updated DESC`;
      
      const response = await this.axiosInstance.get('/search', {
        params: {
          jql,
          maxResults: 50,
          fields: [
            'summary',
            'status',
            'priority',
            'assignee',
            'reporter',
            'created',
            'updated',
            'issuetype',
            'project'
          ].join(',')
        }
      });

      return response.data.issues.map((issue: any) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        priority: issue.fields.priority?.name || 'None',
        assignee: issue.fields.assignee?.displayName || null,
        reporter: issue.fields.reporter?.displayName || 'Unknown',
        created: issue.fields.created,
        updated: issue.fields.updated,
        resolved: issue.fields.resolved,
        issueType: issue.fields.issuetype.name,
        project: issue.fields.project.key,
        labels: [],
        components: [],
        fixVersions: []
      }));
    } catch (error) {
      console.error('Failed to search issues:', error);
      throw error;
    }
  }
}

export const jiraService = new JiraService();