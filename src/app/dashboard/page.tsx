'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QueryInterface from '@/components/QueryInterface'
import DataSources from '@/components/DataSources'
import Dashboard from '@/components/Dashboard'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('studio')
  const [user] = useState({
    id: '1',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3B82F6&color=fff'
  })

  const renderContent = () => {
    switch (activeTab) {
      case 'studio':
        return <QueryInterface onNavigate={setActiveTab} />
      case 'sources':
        return <DataSources />
      case 'dashboard':
        return <Dashboard />
      default:
        return <QueryInterface onNavigate={setActiveTab} />
    }
  }

  return (
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
  )
}