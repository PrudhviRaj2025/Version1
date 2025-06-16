import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { authService, OAuthProvider } from '../services/authService';

interface OAuthLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (provider: string) => void;
}

const OAuthLogin: React.FC<OAuthLoginProps> = ({ isOpen, onClose, onSuccess }) => {
  const [providers] = useState<OAuthProvider[]>(authService.getProviders());
  const [authenticating, setAuthenticating] = useState<string | null>(null);
  const [connectedProviders, setConnectedProviders] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check which providers are already connected
    const connected = new Set<string>();
    providers.forEach(provider => {
      if (authService.isAuthenticated(provider.id)) {
        connected.add(provider.id);
      }
    });
    setConnectedProviders(connected);
  }, [providers]);

  useEffect(() => {
    // Handle OAuth callback
    const handleCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const providerId = window.location.pathname.split('/').pop();

      if (code && state && providerId) {
        handleOAuthCallback(providerId, code, state);
      }
    };

    handleCallback();
  }, []);

  const handleOAuthCallback = async (providerId: string, code: string, state: string) => {
    try {
      setAuthenticating(providerId);
      await authService.handleCallback(providerId, code, state);
      setConnectedProviders(prev => new Set([...prev, providerId]));
      onSuccess(providerId);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('OAuth callback failed:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setAuthenticating(null);
    }
  };

  const handleConnect = (provider: OAuthProvider) => {
    if (connectedProviders.has(provider.id)) {
      // Already connected, show user info or disconnect option
      return;
    }

    setAuthenticating(provider.id);
    const authUrl = authService.generateAuthUrl(provider);
    
    // Open OAuth popup
    const popup = window.open(
      authUrl,
      'oauth_popup',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    // Monitor popup for completion
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setAuthenticating(null);
      }
    }, 1000);
  };

  const handleDisconnect = (providerId: string) => {
    authService.logout(providerId);
    setConnectedProviders(prev => {
      const newSet = new Set(prev);
      newSet.delete(providerId);
      return newSet;
    });
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
          className="bg-white rounded-xl p-8 w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Connect Your Data Sources</h2>
                <p className="text-sm text-slate-600">Securely connect to your business platforms</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {providers.map((provider) => {
              const isConnected = connectedProviders.has(provider.id);
              const isAuthenticating = authenticating === provider.id;
              const userInfo = authService.getUserInfo(provider.id);

              return (
                <motion.div
                  key={provider.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 border rounded-xl transition-all ${
                    isConnected 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                        style={{ backgroundColor: provider.color }}
                      >
                        {provider.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{provider.name}</h3>
                        {isConnected && userInfo && (
                          <p className="text-xs text-slate-600">{userInfo.email}</p>
                        )}
                      </div>
                    </div>
                    
                    {isConnected ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-2">
                    {isConnected ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onSuccess(provider.id)}
                          className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Use Data
                        </button>
                        <button
                          onClick={() => handleDisconnect(provider.id)}
                          className="px-3 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <motion.button
                        onClick={() => handleConnect(provider)}
                        disabled={isAuthenticating}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                      >
                        {isAuthenticating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <span>Connect</span>
                        )}
                      </motion.button>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    <p>Permissions: {provider.scopes.slice(0, 2).join(', ')}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Secure Authentication</h4>
                <p className="text-xs text-blue-700">
                  We use OAuth 2.0 with PKCE for secure authentication. Your credentials are never stored on our servers. 
                  You can revoke access at any time from your account settings.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Done
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OAuthLogin;