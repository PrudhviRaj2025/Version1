export interface DataSourceConfig {
  id: string;
  name: string;
  category: 'database' | 'file' | 'cloud' | 'business' | 'productivity' | 'marketing';
  type: 'oauth' | 'api_key' | 'connection_string' | 'file_upload';
  icon: string;
  color: string;
  description: string;
  authUrl?: string;
  scopes?: string[];
  requiredFields?: string[];
  testEndpoint?: string;
  documentation?: string;
}

export interface ConnectionConfig {
  id: string;
  sourceId: string;
  name: string;
  credentials: Record<string, any>;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastSync?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface DataSourceResult {
  success: boolean;
  data?: any[];
  error?: string;
  metadata?: {
    totalRecords?: number;
    columns?: string[];
    lastUpdated?: string;
  };
}

class DataSourceService {
  private readonly STORAGE_KEY = 'balanced_card_connections';
  private connections: Map<string, ConnectionConfig> = new Map();

  constructor() {
    this.loadConnectionsFromStorage();
  }

  // All 55 data sources configuration
  getDataSources(): DataSourceConfig[] {
    return [
      // Databases (Relational & NoSQL)
      {
        id: 'postgresql',
        name: 'PostgreSQL',
        category: 'database',
        type: 'connection_string',
        icon: '🐘',
        color: '#336791',
        description: 'Open source relational database',
        requiredFields: ['host', 'port', 'database', 'username', 'password'],
        testEndpoint: 'SELECT 1',
        documentation: 'https://www.postgresql.org/docs/'
      },
      {
        id: 'mysql',
        name: 'MySQL / MariaDB',
        category: 'database',
        type: 'connection_string',
        icon: '🐬',
        color: '#4479A1',
        description: 'Popular open source relational database',
        requiredFields: ['host', 'port', 'database', 'username', 'password'],
        testEndpoint: 'SELECT 1',
        documentation: 'https://dev.mysql.com/doc/'
      },
      {
        id: 'sqlserver',
        name: 'Microsoft SQL Server',
        category: 'database',
        type: 'connection_string',
        icon: '🏢',
        color: '#CC2927',
        description: 'Microsoft enterprise database system',
        requiredFields: ['server', 'database', 'username', 'password'],
        testEndpoint: 'SELECT 1',
        documentation: 'https://docs.microsoft.com/en-us/sql/'
      },
      {
        id: 'oracle',
        name: 'Oracle Database',
        category: 'database',
        type: 'connection_string',
        icon: '🔴',
        color: '#F80000',
        description: 'Enterprise-grade relational database',
        requiredFields: ['host', 'port', 'service_name', 'username', 'password'],
        testEndpoint: 'SELECT 1 FROM DUAL',
        documentation: 'https://docs.oracle.com/database/'
      },
      {
        id: 'aurora',
        name: 'Amazon Aurora',
        category: 'database',
        type: 'connection_string',
        icon: '☁️',
        color: '#FF9900',
        description: 'AWS managed relational database',
        requiredFields: ['endpoint', 'port', 'database', 'username', 'password'],
        testEndpoint: 'SELECT 1',
        documentation: 'https://docs.aws.amazon.com/aurora/'
      },
      {
        id: 'cloudsql',
        name: 'Google Cloud SQL',
        category: 'database',
        type: 'api_key',
        icon: '🔵',
        color: '#4285F4',
        description: 'Google Cloud managed database service',
        requiredFields: ['project_id', 'instance_id', 'database', 'service_account_key'],
        documentation: 'https://cloud.google.com/sql/docs'
      },
      {
        id: 'db2',
        name: 'IBM Db2',
        category: 'database',
        type: 'connection_string',
        icon: '🔷',
        color: '#1F70C1',
        description: 'IBM enterprise database system',
        requiredFields: ['hostname', 'port', 'database', 'username', 'password'],
        testEndpoint: 'SELECT 1 FROM SYSIBM.SYSDUMMY1',
        documentation: 'https://www.ibm.com/docs/en/db2'
      },
      {
        id: 'snowflake',
        name: 'Snowflake',
        category: 'database',
        type: 'api_key',
        icon: '❄️',
        color: '#29B5E8',
        description: 'Cloud data warehouse platform',
        requiredFields: ['account', 'username', 'password', 'warehouse', 'database', 'schema'],
        documentation: 'https://docs.snowflake.com/'
      },
      {
        id: 'databricks',
        name: 'Databricks',
        category: 'database',
        type: 'api_key',
        icon: '🧱',
        color: '#FF3621',
        description: 'Unified analytics platform',
        requiredFields: ['workspace_url', 'access_token'],
        documentation: 'https://docs.databricks.com/'
      },
      {
        id: 'bigquery',
        name: 'Google BigQuery',
        category: 'database',
        type: 'api_key',
        icon: '📊',
        color: '#4285F4',
        description: 'Google Cloud data warehouse',
        requiredFields: ['project_id', 'service_account_key'],
        documentation: 'https://cloud.google.com/bigquery/docs'
      },
      {
        id: 'redshift',
        name: 'Amazon Redshift',
        category: 'database',
        type: 'connection_string',
        icon: '🔴',
        color: '#FF9900',
        description: 'AWS data warehouse service',
        requiredFields: ['host', 'port', 'database', 'username', 'password'],
        testEndpoint: 'SELECT 1',
        documentation: 'https://docs.aws.amazon.com/redshift/'
      },
      {
        id: 'azuresql',
        name: 'Azure SQL Database',
        category: 'database',
        type: 'connection_string',
        icon: '🔷',
        color: '#0078D4',
        description: 'Microsoft Azure managed SQL database',
        requiredFields: ['server', 'database', 'username', 'password'],
        testEndpoint: 'SELECT 1',
        documentation: 'https://docs.microsoft.com/en-us/azure/sql-database/'
      },
      {
        id: 'clickhouse',
        name: 'ClickHouse',
        category: 'database',
        type: 'connection_string',
        icon: '⚡',
        color: '#FFCC01',
        description: 'Fast columnar database for analytics',
        requiredFields: ['host', 'port', 'database', 'username', 'password'],
        testEndpoint: 'SELECT 1',
        documentation: 'https://clickhouse.com/docs/'
      },
      {
        id: 'cockroachdb',
        name: 'CockroachDB',
        category: 'database',
        type: 'connection_string',
        icon: '🪳',
        color: '#6933FF',
        description: 'Distributed SQL database',
        requiredFields: ['host', 'port', 'database', 'username', 'password'],
        testEndpoint: 'SELECT 1',
        documentation: 'https://www.cockroachlabs.com/docs/'
      },
      {
        id: 'mongodb',
        name: 'MongoDB',
        category: 'database',
        type: 'connection_string',
        icon: '🍃',
        color: '#47A248',
        description: 'Document-oriented NoSQL database',
        requiredFields: ['connection_string'],
        documentation: 'https://docs.mongodb.com/'
      },
      {
        id: 'cassandra',
        name: 'Cassandra',
        category: 'database',
        type: 'connection_string',
        icon: '🏛️',
        color: '#1287B1',
        description: 'Distributed NoSQL database',
        requiredFields: ['hosts', 'keyspace', 'username', 'password'],
        documentation: 'https://cassandra.apache.org/doc/'
      },
      {
        id: 'firebase',
        name: 'Firebase Realtime Database',
        category: 'database',
        type: 'api_key',
        icon: '🔥',
        color: '#FFCA28',
        description: 'Google Firebase real-time database',
        requiredFields: ['project_id', 'service_account_key'],
        documentation: 'https://firebase.google.com/docs/database'
      },
      {
        id: 'dynamodb',
        name: 'DynamoDB',
        category: 'database',
        type: 'api_key',
        icon: '⚡',
        color: '#FF9900',
        description: 'AWS NoSQL database service',
        requiredFields: ['region', 'access_key_id', 'secret_access_key'],
        documentation: 'https://docs.aws.amazon.com/dynamodb/'
      },

      // File-Based & Flat Data Sources
      {
        id: 'csv',
        name: 'CSV Files',
        category: 'file',
        type: 'file_upload',
        icon: '📄',
        color: '#10B981',
        description: 'Comma-separated values files',
        documentation: 'Built-in file upload support'
      },
      {
        id: 'excel',
        name: 'Excel Files',
        category: 'file',
        type: 'file_upload',
        icon: '📊',
        color: '#217346',
        description: 'Microsoft Excel spreadsheets (.xlsx/.xls)',
        documentation: 'Built-in file upload support'
      },
      {
        id: 'googlesheets',
        name: 'Google Sheets',
        category: 'file',
        type: 'oauth',
        icon: '📋',
        color: '#34A853',
        description: 'Google Sheets spreadsheets',
        authUrl: 'https://accounts.google.com/oauth2/v2/auth',
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        documentation: 'https://developers.google.com/sheets/api'
      },
      {
        id: 'parquet',
        name: 'Parquet Files',
        category: 'file',
        type: 'file_upload',
        icon: '🗂️',
        color: '#6366F1',
        description: 'Columnar storage file format',
        documentation: 'Upload parquet files for analysis'
      },
      {
        id: 'json',
        name: 'JSON Files',
        category: 'file',
        type: 'file_upload',
        icon: '📋',
        color: '#F59E0B',
        description: 'JavaScript Object Notation files',
        documentation: 'Built-in JSON file support'
      },
      {
        id: 'xml',
        name: 'XML Files',
        category: 'file',
        type: 'file_upload',
        icon: '📄',
        color: '#EF4444',
        description: 'Extensible Markup Language files',
        documentation: 'Built-in XML file support'
      },
      {
        id: 'avro',
        name: 'Apache Avro Files',
        category: 'file',
        type: 'file_upload',
        icon: '🗃️',
        color: '#8B5CF6',
        description: 'Apache Avro data serialization files',
        documentation: 'Upload Avro files for analysis'
      },

      // Cloud Storage / Lakehouses
      {
        id: 's3',
        name: 'Amazon S3',
        category: 'cloud',
        type: 'api_key',
        icon: '☁️',
        color: '#FF9900',
        description: 'Amazon Simple Storage Service',
        requiredFields: ['region', 'access_key_id', 'secret_access_key', 'bucket'],
        documentation: 'https://docs.aws.amazon.com/s3/'
      },
      {
        id: 'azureblob',
        name: 'Azure Blob Storage',
        category: 'cloud',
        type: 'api_key',
        icon: '☁️',
        color: '#0078D4',
        description: 'Microsoft Azure blob storage',
        requiredFields: ['account_name', 'account_key', 'container'],
        documentation: 'https://docs.microsoft.com/en-us/azure/storage/blobs/'
      },
      {
        id: 'gcs',
        name: 'Google Cloud Storage',
        category: 'cloud',
        type: 'api_key',
        icon: '☁️',
        color: '#4285F4',
        description: 'Google Cloud Storage buckets',
        requiredFields: ['project_id', 'service_account_key', 'bucket'],
        documentation: 'https://cloud.google.com/storage/docs'
      },
      {
        id: 'deltalake',
        name: 'Delta Lake',
        category: 'cloud',
        type: 'connection_string',
        icon: '🏞️',
        color: '#00ADD8',
        description: 'Open-source storage layer for data lakes',
        requiredFields: ['storage_path', 'credentials'],
        documentation: 'https://docs.delta.io/'
      },
      {
        id: 'unity_catalog',
        name: 'Databricks Unity Catalog',
        category: 'cloud',
        type: 'api_key',
        icon: '🏛️',
        color: '#FF3621',
        description: 'Databricks unified governance solution',
        requiredFields: ['workspace_url', 'access_token', 'catalog'],
        documentation: 'https://docs.databricks.com/data-governance/unity-catalog/'
      },
      {
        id: 'minio',
        name: 'MinIO',
        category: 'cloud',
        type: 'api_key',
        icon: '🗄️',
        color: '#C72E29',
        description: 'S3-compatible object storage',
        requiredFields: ['endpoint', 'access_key', 'secret_key', 'bucket'],
        documentation: 'https://docs.min.io/'
      },

      // Business Applications & SaaS Tools
      {
        id: 'salesforce',
        name: 'Salesforce',
        category: 'business',
        type: 'oauth',
        icon: '☁️',
        color: '#00A1E0',
        description: 'Customer relationship management platform',
        authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
        scopes: ['api', 'refresh_token'],
        documentation: 'https://developer.salesforce.com/docs/'
      },
      {
        id: 'hubspot',
        name: 'HubSpot',
        category: 'business',
        type: 'oauth',
        icon: '🧡',
        color: '#FF7A59',
        description: 'Inbound marketing and sales platform',
        authUrl: 'https://app.hubspot.com/oauth/authorize',
        scopes: ['contacts', 'content'],
        documentation: 'https://developers.hubspot.com/docs/api'
      },
      {
        id: 'zendesk',
        name: 'Zendesk',
        category: 'business',
        type: 'api_key',
        icon: '🎫',
        color: '#03363D',
        description: 'Customer service and support platform',
        requiredFields: ['subdomain', 'email', 'api_token'],
        documentation: 'https://developer.zendesk.com/api-reference/'
      },
      {
        id: 'shopify',
        name: 'Shopify',
        category: 'business',
        type: 'oauth',
        icon: '🛍️',
        color: '#96BF48',
        description: 'E-commerce platform',
        authUrl: 'https://accounts.shopify.com/oauth/authorize',
        scopes: ['read_orders', 'read_products', 'read_customers'],
        documentation: 'https://shopify.dev/api'
      },
      {
        id: 'stripe',
        name: 'Stripe',
        category: 'business',
        type: 'api_key',
        icon: '💳',
        color: '#635BFF',
        description: 'Payment processing platform',
        requiredFields: ['secret_key'],
        documentation: 'https://stripe.com/docs/api'
      },
      {
        id: 'quickbooks',
        name: 'QuickBooks',
        category: 'business',
        type: 'oauth',
        icon: '💰',
        color: '#0077C5',
        description: 'Accounting software',
        authUrl: 'https://appcenter.intuit.com/connect/oauth2',
        scopes: ['com.intuit.quickbooks.accounting'],
        documentation: 'https://developer.intuit.com/app/developer/qbo/docs/api'
      },
      {
        id: 'xero',
        name: 'Xero',
        category: 'business',
        type: 'oauth',
        icon: '📊',
        color: '#13B5EA',
        description: 'Cloud-based accounting software',
        authUrl: 'https://login.xero.com/identity/connect/authorize',
        scopes: ['accounting.transactions', 'accounting.contacts'],
        documentation: 'https://developer.xero.com/documentation/'
      },
      {
        id: 'marketo',
        name: 'Marketo',
        category: 'business',
        type: 'api_key',
        icon: '📧',
        color: '#5C4C9F',
        description: 'Marketing automation platform',
        requiredFields: ['endpoint', 'client_id', 'client_secret'],
        documentation: 'https://developers.marketo.com/rest-api/'
      },
      {
        id: 'mailchimp',
        name: 'Mailchimp',
        category: 'business',
        type: 'oauth',
        icon: '🐵',
        color: '#FFE01B',
        description: 'Email marketing platform',
        authUrl: 'https://login.mailchimp.com/oauth2/authorize',
        scopes: ['read'],
        documentation: 'https://mailchimp.com/developer/marketing/api/'
      },
      {
        id: 'servicenow',
        name: 'ServiceNow',
        category: 'business',
        type: 'api_key',
        icon: '🔧',
        color: '#62D84E',
        description: 'IT service management platform',
        requiredFields: ['instance', 'username', 'password'],
        documentation: 'https://docs.servicenow.com/bundle/tokyo-application-development/page/integrate/inbound-rest/concept/c_RESTAPI.html'
      },
      {
        id: 'workday',
        name: 'Workday',
        category: 'business',
        type: 'oauth',
        icon: '👥',
        color: '#F68B1F',
        description: 'Human capital management platform',
        authUrl: 'https://wd2-impl-services1.workday.com/ccx/oauth2/authorize',
        scopes: ['system'],
        documentation: 'https://community.workday.com/sites/default/files/file-hosting/restapi/index.html'
      },
      {
        id: 'netsuite',
        name: 'NetSuite',
        category: 'business',
        type: 'oauth',
        icon: '🏢',
        color: '#FF6600',
        description: 'Enterprise resource planning platform',
        authUrl: 'https://system.netsuite.com/app/login/oauth2/authorize.nl',
        scopes: ['restlets', 'rest_webservices'],
        documentation: 'https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_1540391670.html'
      },
      {
        id: 'adp',
        name: 'ADP',
        category: 'business',
        type: 'oauth',
        icon: '👔',
        color: '#D50000',
        description: 'Human resources management system',
        authUrl: 'https://accounts.adp.com/auth/oauth/v2/authorize',
        scopes: ['api'],
        documentation: 'https://developers.adp.com/articles/api'
      },

      // Productivity & Collaboration Tools
      {
        id: 'airtable',
        name: 'Airtable',
        category: 'productivity',
        type: 'api_key',
        icon: '📋',
        color: '#18BFFF',
        description: 'Cloud collaboration service',
        requiredFields: ['api_key', 'base_id'],
        documentation: 'https://airtable.com/api'
      },
      {
        id: 'notion',
        name: 'Notion',
        category: 'productivity',
        type: 'oauth',
        icon: '📝',
        color: '#000000',
        description: 'All-in-one workspace',
        authUrl: 'https://api.notion.com/v1/oauth/authorize',
        scopes: ['read'],
        documentation: 'https://developers.notion.com/'
      },
      {
        id: 'trello',
        name: 'Trello',
        category: 'productivity',
        type: 'oauth',
        icon: '📋',
        color: '#0079BF',
        description: 'Project management tool',
        authUrl: 'https://trello.com/1/authorize',
        scopes: ['read'],
        documentation: 'https://developer.atlassian.com/cloud/trello/rest/'
      },
      {
        id: 'asana',
        name: 'Asana',
        category: 'productivity',
        type: 'oauth',
        icon: '✅',
        color: '#F06A6A',
        description: 'Team collaboration and project management',
        authUrl: 'https://app.asana.com/-/oauth_authorize',
        scopes: ['default'],
        documentation: 'https://developers.asana.com/docs'
      },
      {
        id: 'jira',
        name: 'Jira / Jira Service Management',
        category: 'productivity',
        type: 'oauth',
        icon: '🔷',
        color: '#0052CC',
        description: 'Issue tracking and project management',
        authUrl: 'https://auth.atlassian.com/authorize',
        scopes: ['read:jira-work', 'read:jira-user'],
        documentation: 'https://developer.atlassian.com/cloud/jira/platform/rest/v3/'
      },
      {
        id: 'confluence',
        name: 'Confluence',
        category: 'productivity',
        type: 'oauth',
        icon: '📚',
        color: '#172B4D',
        description: 'Team collaboration and knowledge base',
        authUrl: 'https://auth.atlassian.com/authorize',
        scopes: ['read:confluence-content.all'],
        documentation: 'https://developer.atlassian.com/cloud/confluence/rest/'
      },
      {
        id: 'slack',
        name: 'Slack',
        category: 'productivity',
        type: 'oauth',
        icon: '💬',
        color: '#4A154B',
        description: 'Team communication platform',
        authUrl: 'https://slack.com/oauth/v2/authorize',
        scopes: ['channels:read', 'chat:read'],
        documentation: 'https://api.slack.com/'
      },

      // Marketing & Web Analytics
      {
        id: 'ga4',
        name: 'Google Analytics 4',
        category: 'marketing',
        type: 'oauth',
        icon: '📈',
        color: '#E37400',
        description: 'Web analytics platform',
        authUrl: 'https://accounts.google.com/oauth2/v2/auth',
        scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
        documentation: 'https://developers.google.com/analytics/devguides/reporting/ga4'
      },
      {
        id: 'facebook_ads',
        name: 'Facebook Ads',
        category: 'marketing',
        type: 'oauth',
        icon: '📘',
        color: '#1877F2',
        description: 'Facebook advertising platform',
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        scopes: ['ads_read'],
        documentation: 'https://developers.facebook.com/docs/marketing-api'
      },
      {
        id: 'google_ads',
        name: 'Google Ads',
        category: 'marketing',
        type: 'oauth',
        icon: '🎯',
        color: '#4285F4',
        description: 'Google advertising platform',
        authUrl: 'https://accounts.google.com/oauth2/v2/auth',
        scopes: ['https://www.googleapis.com/auth/adwords'],
        documentation: 'https://developers.google.com/google-ads/api'
      },
      {
        id: 'linkedin_ads',
        name: 'LinkedIn Ads',
        category: 'marketing',
        type: 'oauth',
        icon: '💼',
        color: '#0A66C2',
        description: 'LinkedIn advertising platform',
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        scopes: ['r_ads', 'r_ads_reporting'],
        documentation: 'https://docs.microsoft.com/en-us/linkedin/marketing/'
      }
    ];
  }

  // Get data sources by category
  getDataSourcesByCategory(category: string): DataSourceConfig[] {
    return this.getDataSources().filter(source => source.category === category);
  }

  // Get data source by ID
  getDataSource(id: string): DataSourceConfig | null {
    return this.getDataSources().find(source => source.id === id) || null;
  }

  // Create a new connection
  async createConnection(sourceId: string, name: string, credentials: Record<string, any>): Promise<ConnectionConfig> {
    const source = this.getDataSource(sourceId);
    if (!source) {
      throw new Error(`Data source ${sourceId} not found`);
    }

    const connection: ConnectionConfig = {
      id: this.generateId(),
      sourceId,
      name,
      credentials,
      status: 'connecting',
      metadata: {}
    };

    this.connections.set(connection.id, connection);
    this.saveConnectionsToStorage();

    // Test the connection
    try {
      const testResult = await this.testConnection(connection.id);
      if (testResult.success) {
        connection.status = 'connected';
        connection.lastSync = new Date().toISOString();
      } else {
        connection.status = 'error';
        connection.error = testResult.error;
      }
    } catch (error) {
      connection.status = 'error';
      connection.error = error instanceof Error ? error.message : 'Connection failed';
    }

    this.connections.set(connection.id, connection);
    this.saveConnectionsToStorage();

    return connection;
  }

  // Test a connection
  async testConnection(connectionId: string): Promise<DataSourceResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return { success: false, error: 'Connection not found' };
    }

    const source = this.getDataSource(connection.sourceId);
    if (!source) {
      return { success: false, error: 'Data source configuration not found' };
    }

    try {
      // Simulate connection testing based on source type
      switch (source.type) {
        case 'oauth':
          return await this.testOAuthConnection(source, connection);
        case 'api_key':
          return await this.testApiKeyConnection(source, connection);
        case 'connection_string':
          return await this.testDatabaseConnection(source, connection);
        case 'file_upload':
          return { success: true, data: [] };
        default:
          return { success: false, error: 'Unsupported connection type' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }

  // Fetch data from a connection
  async fetchData(connectionId: string, query?: string): Promise<DataSourceResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return { success: false, error: 'Connection not found' };
    }

    if (connection.status !== 'connected') {
      return { success: false, error: 'Connection is not active' };
    }

    const source = this.getDataSource(connection.sourceId);
    if (!source) {
      return { success: false, error: 'Data source configuration not found' };
    }

    try {
      // Simulate data fetching based on source type
      const mockData = this.generateMockData(source, query);
      
      // Update last sync
      connection.lastSync = new Date().toISOString();
      this.connections.set(connectionId, connection);
      this.saveConnectionsToStorage();

      return {
        success: true,
        data: mockData,
        metadata: {
          totalRecords: mockData.length,
          columns: mockData.length > 0 ? Object.keys(mockData[0]) : [],
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Data fetch failed' 
      };
    }
  }

  // Get all connections
  getConnections(): ConnectionConfig[] {
    return Array.from(this.connections.values());
  }

  // Get connection by ID
  getConnection(id: string): ConnectionConfig | null {
    return this.connections.get(id) || null;
  }

  // Delete a connection
  deleteConnection(id: string): boolean {
    const deleted = this.connections.delete(id);
    if (deleted) {
      this.saveConnectionsToStorage();
    }
    return deleted;
  }

  // Update connection
  updateConnection(id: string, updates: Partial<ConnectionConfig>): boolean {
    const connection = this.connections.get(id);
    if (!connection) return false;

    Object.assign(connection, updates);
    this.connections.set(id, connection);
    this.saveConnectionsToStorage();
    return true;
  }

  // Private helper methods
  private async testOAuthConnection(source: DataSourceConfig, connection: ConnectionConfig): Promise<DataSourceResult> {
    // Simulate OAuth token validation
    if (!connection.credentials.access_token) {
      return { success: false, error: 'Access token required' };
    }

    // Mock successful OAuth validation
    return { success: true, data: [] };
  }

  private async testApiKeyConnection(source: DataSourceConfig, connection: ConnectionConfig): Promise<DataSourceResult> {
    // Validate required fields
    if (source.requiredFields) {
      for (const field of source.requiredFields) {
        if (!connection.credentials[field]) {
          return { success: false, error: `${field} is required` };
        }
      }
    }

    // Mock successful API key validation
    return { success: true, data: [] };
  }

  private async testDatabaseConnection(source: DataSourceConfig, connection: ConnectionConfig): Promise<DataSourceResult> {
    // Validate required fields
    if (source.requiredFields) {
      for (const field of source.requiredFields) {
        if (!connection.credentials[field]) {
          return { success: false, error: `${field} is required` };
        }
      }
    }

    // Mock successful database connection
    return { success: true, data: [] };
  }

  private generateMockData(source: DataSourceConfig, query?: string): any[] {
    // Generate mock data based on source type
    const mockData = [];
    const recordCount = Math.floor(Math.random() * 100) + 10;

    for (let i = 0; i < recordCount; i++) {
      switch (source.category) {
        case 'database':
          mockData.push({
            id: i + 1,
            name: `Record ${i + 1}`,
            value: Math.floor(Math.random() * 1000),
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          });
          break;
        case 'business':
          mockData.push({
            id: i + 1,
            customer_name: `Customer ${i + 1}`,
            amount: Math.floor(Math.random() * 10000),
            status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          });
          break;
        case 'marketing':
          mockData.push({
            campaign_id: i + 1,
            impressions: Math.floor(Math.random() * 100000),
            clicks: Math.floor(Math.random() * 5000),
            cost: Math.floor(Math.random() * 1000),
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          });
          break;
        default:
          mockData.push({
            id: i + 1,
            title: `Item ${i + 1}`,
            description: `Description for item ${i + 1}`,
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          });
      }
    }

    return mockData;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private loadConnectionsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const connectionData = JSON.parse(stored);
        this.connections = new Map(Object.entries(connectionData));
      }
    } catch (error) {
      console.error('Failed to load connections from storage:', error);
    }
  }

  private saveConnectionsToStorage(): void {
    try {
      const connectionData = Object.fromEntries(this.connections);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(connectionData));
    } catch (error) {
      console.error('Failed to save connections to storage:', error);
    }
  }
}

export const dataSourceService = new DataSourceService();