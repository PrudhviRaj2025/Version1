import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Database, Cloud, Zap, FileText, MoreVertical, CheckCircle, XCircle, Clock, Trash2, Settings, Shield, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import OAuthLogin from './OAuthLogin';
import FileUpload from './FileUpload';
import { authService } from '../services/authService';
import { fileService, FileData } from '../services/fileService';

const DataSources: React.FC = () => {
  const { dataSources, addDataSource, updateDataSource } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>(fileService.getFiles());
  const [newSource, setNewSource] = useState({
    name: '',
    type: 'database' as const,
    status: 'disconnected' as const,
    lastSync: 'Never'
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'database':
        return Database;
      case 'cloud':
        return Cloud;
      case 'saas':
        return Zap;
      case 'file':
        return FileText;
      default:
        return Database;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50';
      case 'disconnected':
        return 'text-red-600 bg-red-50';
      case 'connecting':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return CheckCircle;
      case 'disconnected':
        return XCircle;
      case 'connecting':
        return Clock;
      default:
        return XCircle;
    }
  };

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.name.trim()) return;

    addDataSource(newSource);
    setNewSource({
      name: '',
      type: 'database',
      status: 'disconnected',
      lastSync: 'Never'
    });
    setShowAddModal(false);
  };

  const handleConnect = (id: string) => {
    updateDataSource(id, { status: 'connecting' });
    
    // Simulate connection process
    setTimeout(() => {
      updateDataSource(id, { 
        status: 'connected',
        lastSync: 'Just now'
      });
    }, 2000);
  };

  const handleFileUploaded = (file: FileData) => {
    setUploadedFiles(prev => [file, ...prev]);
    
    // Add as a data source
    addDataSource({
      name: file.name,
      type: 'file',
      status: 'connected',
      lastSync: 'Just now'
    });
  };

  const sourceTypes = [
    { value: 'database', label: 'Database', icon: Database },
    { value: 'cloud', label: 'Cloud Storage', icon: Cloud },
    { value: 'saas', label: 'SaaS Platform', icon: Zap },
    { value: 'file', label: 'File Upload', icon: FileText }
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Data Sources</h1>
            <p className="text-slate-600 mt-1">Manage your data connections and sources</p>
          </div>
          <motion.button
            onClick={() => setShowAddModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-3"
          >
            <Plus className="w-4 h-4" />
            <span>Add Source</span>
          </motion.button>
          <motion.button
            onClick={() => setShowFileUpload(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mr-3"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Files</span>
          </motion.button>
          <motion.button
            onClick={() => setShowOAuthModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>Connect Platform</span>
          </motion.button>
        </div>

        {/* Data Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dataSources.map((source, index) => {
            const Icon = getIcon(source.type);
            const StatusIcon = getStatusIcon(source.status);
            
            return (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{source.name}</h3>
                      <p className="text-sm text-slate-500 capitalize">{source.type}</p>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Status</span>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(source.status)}`}>
                      <StatusIcon className="w-3 h-3" />
                      <span className="capitalize">{source.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Last Sync</span>
                    <span className="text-sm text-slate-900">{source.lastSync}</span>
                  </div>
                </div>

                <div className="flex space-x-2 mt-6">
                  {source.status === 'disconnected' ? (
                    <motion.button
                      onClick={() => handleConnect(source.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Connect
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Sync Now
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}

          {/* Add New Source Card */}
          <motion.button
            onClick={() => setShowAddModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-slate-600 hover:text-blue-600"
          >
            <Plus className="w-8 h-8 mb-2" />
            <span className="font-medium">Add Data Source</span>
          </motion.button>
        </div>

        {/* Uploaded Files Section */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Uploaded Files</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file, index) => {
                const Icon = getIcon(file.type);
                
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 text-sm">{file.name}</h3>
                          <p className="text-xs text-slate-500 capitalize">{file.type} file</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          fileService.deleteFile(file.id);
                          setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
                        }}
                        className="p-1 hover:bg-slate-100 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Rows:</span>
                        <span className="font-medium">{file.rowCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Columns:</span>
                        <span className="font-medium">{file.columns.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span className="font-medium">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uploaded:</span>
                        <span className="font-medium">{new Date(file.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full mt-3 px-3 py-2 bg-purple-100 text-purple-700 text-xs rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      Analyze Data
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Source Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-4">Add Data Source</h2>
                
                <form onSubmit={handleAddSource} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Source Name
                    </label>
                    <input
                      type="text"
                      value={newSource.name}
                      onChange={(e) => setNewSource({...newSource, name: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter source name..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Source Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {sourceTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <motion.button
                            key={type.value}
                            type="button"
                            onClick={() => setNewSource({...newSource, type: type.value as any})}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-3 border rounded-lg flex items-center space-x-2 transition-colors ${
                              newSource.type === type.value
                                ? 'border-blue-500 bg-blue-50 text-blue-600'
                                : 'border-slate-300 text-slate-600 hover:border-blue-300'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{type.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <motion.button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Source
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OAuth Login Modal */}
        <OAuthLogin
          isOpen={showOAuthModal}
          onClose={() => setShowOAuthModal(false)}
          onSuccess={(provider) => {
            const providerNames: Record<string, string> = {
              jira: 'Jira Cloud',
              github: 'GitHub',
              google: 'Google Workspace',
              microsoft: 'Microsoft 365',
              slack: 'Slack',
              salesforce: 'Salesforce'
            };
            
            addDataSource({
              name: providerNames[provider] || provider,
              type: 'saas',
              status: 'connected',
              lastSync: 'Just now'
            });
            setShowOAuthModal(false);
          }}
        />

        {/* File Upload Modal */}
        <FileUpload
          isOpen={showFileUpload}
          onClose={() => setShowFileUpload(false)}
          onFileUploaded={handleFileUploaded}
        />
      </div>
    </div>
  );
};

export default DataSources;