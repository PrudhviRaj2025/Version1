import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Zap, AlertCircle, CheckCircle, RefreshCw, X, Server, Brain, Sliders } from 'lucide-react';
import { localLLMService, LLMConfig } from '../services/localLLMService';

interface LLMSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const LLMSettings: React.FC<LLMSettingsProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<LLMConfig>(localLLMService.getConfig());
  const [connectionStatus, setConnectionStatus] = useState(localLLMService.getConnectionStatus());
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAvailableModels();
    }
  }, [isOpen]);

  const loadAvailableModels = async () => {
    setIsLoadingModels(true);
    try {
      const models = await localLLMService.getAvailableModels();
      setAvailableModels(models);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      localLLMService.updateConfig(config);
      const isConnected = await localLLMService.testConnection();
      setConnectionStatus(localLLMService.getConnectionStatus());
      
      if (isConnected) {
        await loadAvailableModels();
      }
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveConfig = () => {
    localLLMService.updateConfig(config);
    onClose();
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600 bg-green-50 border-green-200';
      case 'connecting': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return CheckCircle;
      case 'connecting': return RefreshCw;
      case 'error': return AlertCircle;
      default: return Server;
    }
  };

  const StatusIcon = getStatusIcon();

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
          className="bg-white rounded-xl w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Local LLM Settings</h2>
                <p className="text-sm text-slate-600">Configure your Llama 3.1:8B connection</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Connection Status */}
            <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
              <div className="flex items-center space-x-3">
                <StatusIcon className={`w-5 h-5 ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`} />
                <div>
                  <h3 className="font-medium">
                    {connectionStatus === 'connected' && 'Connected to Local LLM'}
                    {connectionStatus === 'connecting' && 'Testing Connection...'}
                    {connectionStatus === 'error' && 'Connection Failed'}
                    {connectionStatus === 'disconnected' && 'Not Connected'}
                  </h3>
                  <p className="text-sm opacity-75">
                    {connectionStatus === 'connected' && `Model: ${config.model}`}
                    {connectionStatus === 'connecting' && 'Attempting to connect to your local LLM...'}
                    {connectionStatus === 'error' && 'Please check your endpoint and model configuration'}
                    {connectionStatus === 'disconnected' && 'Configure and test your connection below'}
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <Server className="w-5 h-5" />
                <span>Connection Settings</span>
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  LLM Endpoint URL
                </label>
                <input
                  type="url"
                  value={config.endpoint}
                  onChange={(e) => setConfig({...config, endpoint: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="http://localhost:11434/api/generate"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Default Ollama endpoint. Change if using a different setup.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Model Name
                </label>
                <div className="flex space-x-2">
                  <select
                    value={config.model}
                    onChange={(e) => setConfig({...config, model: e.target.value})}
                    className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="llama3.1:8b">llama3.1:8b</option>
                    {availableModels.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <motion.button
                    onClick={loadAvailableModels}
                    disabled={isLoadingModels}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-3 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingModels ? 'animate-spin' : ''}`} />
                  </motion.button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Select your model or refresh to load available models from your LLM server.
                </p>
              </div>
            </div>

            {/* Advanced Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <Sliders className="w-5 h-5" />
                <span>Model Parameters</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Temperature: {config.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Controls randomness (0 = deterministic, 2 = very creative)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="8192"
                    value={config.maxTokens}
                    onChange={(e) => setConfig({...config, maxTokens: parseInt(e.target.value)})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Maximum response length
                  </p>
                </div>
              </div>
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                System Prompt
              </label>
              <textarea
                value={config.systemPrompt}
                onChange={(e) => setConfig({...config, systemPrompt: e.target.value})}
                rows={4}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="System instructions for the AI..."
              />
              <p className="text-xs text-slate-500 mt-1">
                Instructions that define the AI's role and behavior.
              </p>
            </div>

            {/* Setup Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>1. Install Ollama: <code className="bg-blue-100 px-1 rounded">curl -fsSL https://ollama.ai/install.sh | sh</code></p>
                <p>2. Pull Llama 3.1: <code className="bg-blue-100 px-1 rounded">ollama pull llama3.1:8b</code></p>
                <p>3. Start Ollama: <code className="bg-blue-100 px-1 rounded">ollama serve</code></p>
                <p>4. Test the connection using the button below</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-slate-200">
            <motion.button
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTestingConnection ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Test Connection</span>
                </>
              )}
            </motion.button>

            <div className="flex space-x-3">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSaveConfig}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LLMSettings;