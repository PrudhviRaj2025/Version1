import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Filter, CheckCircle, AlertCircle, ExternalLink, Key, Database, Cloud, Briefcase, Users, TrendingUp } from 'lucide-react';
import { dataSourceService, DataSourceConfig, ConnectionConfig } from '../services/dataSourceService';

interface DataSourceConnectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionCreated: (connection: ConnectionConfig) => void;
}

const DataSourceConnector: React.FC<DataSourceConnectorProps> = ({ isOpen, onClose, onConnectionCreated }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<DataSourceConfig | null>(null);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [connectionData, setConnectionData] = useState<Record<string, any>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Sources', icon: Database, count: 55 },
    { id: 'database', label: 'Databases', icon: Database, count: 18 },
    { id: 'file', label: 'Files', icon: Database, count: 7 },
    { id: 'cloud', label: 'Cloud Storage', icon: Cloud, count: 6 },
    { id: 'business', label: 'Business Apps', icon: Briefcase, count: 13 },
    { id: 'productivity', label: 'Productivity', icon: Users, count: 7 },
    { id: 'marketing', label: 'Marketing', icon: TrendingUp, count: 4 }
  ];

  const dataSources = dataSourceService.getDataSources();
  const filteredSources = dataSources.filter(source => {
    const matchesCategory = selectedCategory === 'all' || source.category === selectedCategory;
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         source.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSourceSelect = (source: DataSourceConfig) => {
    setSelectedSource(source);
    setShowConnectionForm(true);
    setConnectionData({});
    setError('');
  };

  const handleConnectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSource) return;

    setIsConnecting(true);
    setError('');

    try {
      // Validate required fields
      if (selectedSource.requiredFields) {
        for (const field of selectedSource.requiredFields) {
          if (!connectionData[field]) {
            throw new Error(`${field.replace('_', ' ')} is required`);
          }
        }
      }

      const connection = await dataSourceService.createConnection(
        selectedSource.id,
        connectionData.name || selectedSource.name,
        connectionData
      );

      onConnectionCreated(connection);
      setShowConnectionForm(false);
      setSelectedSource(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create connection');
    } finally {
      setIsConnecting(false);
    }
  };

  const getConnectionTypeIcon = (type: string) => {
    switch (type) {
      case 'oauth': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'api_key': return <Key className="w-4 h-4 text-blue-600" />;
      case 'connection_string': return <Database className="w-4 h-4 text-purple-600" />;
      case 'file_upload': return <Database className="w-4 h-4 text-orange-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConnectionTypeLabel = (type: string) => {
    switch (type) {
      case 'oauth': return 'OAuth 2.0';
      case 'api_key': return 'API Key';
      case 'connection_string': return 'Direct Connection';
      case 'file_upload': return 'File Upload';
      default: return 'Unknown';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="bg-white rounded-xl w-full max-w-6xl mx-4 shadow-2xl max-h-[90vh] overflow-hidden"
        >
          {!showConnectionForm ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Connect Data Source</h2>
                  <p className="text-slate-600 mt-1">Choose from 55+ supported data sources</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex h-[600px]">
                {/* Sidebar */}
                <div className="w-64 border-r border-slate-200 p-4">
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <motion.button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="w-4 h-4" />
                            <span className="font-medium text-sm">{category.label}</span>
                          </div>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                            {category.count}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                  {/* Search */}
                  <div className="p-4 border-b border-slate-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search data sources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Data Sources Grid */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredSources.map((source, index) => (
                        <motion.div
                          key={source.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleSourceSelect(source)}
                          className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                                style={{ backgroundColor: source.color }}
                              >
                                {source.icon}
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-900 text-sm">{source.name}</h3>
                                <p className="text-xs text-slate-500 capitalize">{source.category}</p>
                              </div>
                            </div>
                            {getConnectionTypeIcon(source.type)}
                          </div>

                          <p className="text-xs text-slate-600 mb-3 line-clamp-2">{source.description}</p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              {getConnectionTypeLabel(source.type)}
                            </span>
                            {source.documentation && (
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {filteredSources.length === 0 && (
                      <div className="text-center py-12">
                        <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No data sources found matching your criteria</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Connection Form */
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowConnectionForm(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: selectedSource?.color }}
                  >
                    {selectedSource?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Connect to {selectedSource?.name}</h2>
                    <p className="text-sm text-slate-600">{selectedSource?.description}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleConnectionSubmit} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Connection Name
                  </label>
                  <input
                    type="text"
                    value={connectionData.name || ''}
                    onChange={(e) => setConnectionData({...connectionData, name: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`My ${selectedSource?.name} Connection`}
                    required
                  />
                </div>

                {selectedSource?.type === 'oauth' && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">OAuth Authentication</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      You'll be redirected to {selectedSource.name} to authorize access to your data.
                    </p>
                    <div className="text-xs text-blue-600">
                      <strong>Permissions:</strong> {selectedSource.scopes?.join(', ')}
                    </div>
                  </div>
                )}

                {selectedSource?.requiredFields?.map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <input
                      type={field.includes('password') || field.includes('secret') || field.includes('key') ? 'password' : 'text'}
                      value={connectionData[field] || ''}
                      onChange={(e) => setConnectionData({...connectionData, [field]: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter ${field.replace('_', ' ')}`}
                      required
                    />
                  </div>
                ))}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => setShowConnectionForm(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isConnecting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <span>Connect</span>
                    )}
                  </motion.button>
                </div>
              </form>

              {selectedSource?.documentation && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">Need Help?</h4>
                  <p className="text-sm text-slate-600 mb-2">
                    Check the official documentation for setup instructions and API details.
                  </p>
                  <a
                    href={selectedSource.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <span>View Documentation</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DataSourceConnector;