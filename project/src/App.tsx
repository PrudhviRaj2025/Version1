import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QueryInterface from './components/QueryInterface';
import DataSources from './components/DataSources';
import HomePage from './components/HomePage';
import { AppProvider } from './context/AppContext';

function App() {
  const [activeTab, setActiveTab] = useState('studio');
  const [user, setUser] = useState<any>(null);

  const handleLogin = (userData: any) => {
    setUser(userData);
    // If user has an initial query, go to query interface
    if (userData.initialQuery) {
      setActiveTab('studio');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('studio');
  };

  // Show homepage if user is not logged in
  if (!user) {
    return <HomePage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'studio':
        return <QueryInterface onNavigate={setActiveTab} />;
      case 'sources':
        return <DataSources />;
      default:
        return <QueryInterface onNavigate={setActiveTab} />;
    }
  };

  return (
    <AppProvider>
      <main className="h-screen overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </AppProvider>
  );
}

export default App;