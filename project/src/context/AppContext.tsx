import React, { createContext, useContext, useState, ReactNode } from 'react';
import { JiraConfig, JiraIssue, JiraProject } from '../services/jiraService';

interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'cloud' | 'saas' | 'file';
  status: 'connected' | 'disconnected' | 'connecting';
  lastSync: string;
}

interface Query {
  id: string;
  text: string;
  timestamp: string;
  response: string;
  visualizations?: any[];
}

interface JiraData {
  issues: JiraIssue[];
  projects: JiraProject[];
  isConfigured: boolean;
  isLoading: boolean;
}

interface AppContextType {
  dataSources: DataSource[];
  queries: Query[];
  jiraData: JiraData;
  addDataSource: (source: Omit<DataSource, 'id'>) => void;
  updateDataSource: (id: string, updates: Partial<DataSource>) => void;
  addQuery: (query: Omit<Query, 'id' | 'timestamp'>) => void;
  setJiraData: (data: Partial<JiraData>) => void;
  setJiraConfig: (config: JiraConfig) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: '1',
      name: 'Production Database',
      type: 'database',
      status: 'connected',
      lastSync: '2 minutes ago'
    },
    {
      id: '2',
      name: 'Salesforce CRM',
      type: 'saas',
      status: 'connected',
      lastSync: '5 minutes ago'
    },
    {
      id: '3',
      name: 'AWS S3 Bucket',
      type: 'cloud',
      status: 'disconnected',
      lastSync: '1 hour ago'
    }
  ]);

  const [queries, setQueries] = useState<Query[]>([
    {
      id: '1',
      text: 'Show me the revenue trends for the last quarter',
      timestamp: '2024-01-20 14:30',
      response: 'Based on your data, revenue increased by 23% in Q4 2023 compared to Q3, with the strongest growth in the software division.'
    },
    {
      id: '2',
      text: 'What are the top performing sales regions?',
      timestamp: '2024-01-20 13:45',
      response: 'The top 3 performing regions are: 1) North America (45% of total sales), 2) Europe (32%), 3) Asia-Pacific (18%).'
    }
  ]);

  const [jiraData, setJiraDataState] = useState<JiraData>({
    issues: [],
    projects: [],
    isConfigured: false,
    isLoading: false
  });

  const addDataSource = (source: Omit<DataSource, 'id'>) => {
    const newSource = {
      ...source,
      id: Date.now().toString()
    };
    setDataSources([...dataSources, newSource]);
  };

  const updateDataSource = (id: string, updates: Partial<DataSource>) => {
    setDataSources(sources =>
      sources.map(source =>
        source.id === id ? { ...source, ...updates } : source
      )
    );
  };

  const addQuery = (query: Omit<Query, 'id' | 'timestamp'>) => {
    const newQuery = {
      ...query,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString()
    };
    setQueries([newQuery, ...queries]);
  };

  const setJiraData = (data: Partial<JiraData>) => {
    setJiraDataState(prev => ({ ...prev, ...data }));
  };

  const setJiraConfig = (config: JiraConfig) => {
    setJiraData({ isConfigured: true, isLoading: false });
  };

  return (
    <AppContext.Provider value={{
      dataSources,
      queries,
      jiraData,
      addDataSource,
      updateDataSource,
      addQuery,
      setJiraData,
      setJiraConfig
    }}>
      {children}
    </AppContext.Provider>
  );
};