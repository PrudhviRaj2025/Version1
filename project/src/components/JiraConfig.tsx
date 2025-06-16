import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, TestTube, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { jiraService, JiraConfig } from '../services/jiraService';

interface JiraConfigProps {
  onConfigured: (config: JiraConfig) => void;
  isOpen: boolean;
  onClose: () => void;
}

const JiraConfigComponent: React.FC<JiraConfigProps> = ({ onConfigured, isOpen, onClose }) => {
  const [config, setConfig] = useState<JiraConfig>({
    baseUrl: '',
    email: '',
    apiToken: ''
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showApiToken, setShowApiToken] = useState(false);
  const [error, setError] = useState<string>('');

  const handleTestConnection = async () => {
    if (!config.baseUrl || !config.email || !config.apiToken) {
      setError('Please fill in all fields');
      return;
    }

    setIsTestingConnection(true);
    setError('');
    
    try {
      jiraService.setConfig(config);
      const isConnected = await jiraService.testConnection();
      
      if (isConnected) {
        setConnectionStatus('success');
        setTimeout(() => {
          onConfigured(config);
          onClose();
        }, 1500);
      } else {
        setConnectionStatus('error');
        setError('Failed to connect to Jira. Please check your credentials.');
      }
    } catch (err) {
      setConnectionStatus('error');
      setError('Connection failed. Please verify your Jira URL and credentials.');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTestConnection();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Configure Jira</h2>
            <p className="text-sm text-slate-600">Connect to your Jira instance</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Jira Base URL
            </label>
            <input
              type="url"
              value={config.baseUrl}
              onChange={(e) => setConfig({...config, baseUrl: e.target.value})}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://your-domain.atlassian.net"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Your Jira Cloud URL (without /rest/api/3)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={config.email}
              onChange={(e) => setConfig({...config, email: e.target.value})}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your-email@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              API Token
            </label>
            <div className="relative">
              <input
                type={showApiToken ? 'text' : 'password'}
                value={config.apiToken}
                onChange={(e) => setConfig({...config, apiToken: e.target.value})}
                className="w-full p-3 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your Jira API token"
                required
              />
              <button
                type="button"
                onClick={() => setShowApiToken(!showApiToken)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showApiToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Generate at: Account Settings → Security → API tokens
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {connectionStatus === 'success' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-600">Connection successful! Configuring...</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={isTestingConnection}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isTestingConnection ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Testing...</span>
                </>
              ) : connectionStatus === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4" />
                  <span>Test & Connect</span>
                </>
              )}
            </motion.button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Setup Instructions:</h4>
          <ol className="text-xs text-blue-700 space-y-1">
            <li>1. Go to your Jira Cloud instance</li>
            <li>2. Click your profile → Account Settings</li>
            <li>3. Go to Security → API tokens</li>
            <li>4. Create a new token and copy it here</li>
          </ol>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default JiraConfigComponent;