'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Plus, MessageSquare, X, Edit3, Trash2, Upload, Database, Brain, AlertCircle, File, FileText, BarChart3, TrendingUp, PieChart, Folder, ChevronDown, Copy, Terminal, Eye, Download, Share, Settings, Maximize2, RefreshCw, Play, Code, ChevronRight, Menu } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { fileService } from '@/services/fileService'
import { localLLMService } from '@/services/localLLMService'
import CodeEditor from './CodeEditor'
import AnalyticsPreview from './AnalyticsPreview'
import DataSourceSelector from './DataSourceSelector'
import FileUpload from './FileUpload'
import LLMSettings from './LLMSettings'

interface QueryInterfaceProps {
  onNavigate?: (tab: string) => void
}

interface AnalyticsProject {
  id: string
  name: string
  description: string
  code: string
  data: any[]
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'dashboard'
  createdAt: string
  updatedAt: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: string
  isLoading?: boolean
}

interface ChatSession {
  id: string
  name: string
  messages: ChatMessage[]
  createdAt: string
  lastActivity: string
}

const QueryInterface: React.FC<QueryInterfaceProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('')
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      name: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    }
  ])
  const [currentChatId, setCurrentChatId] = useState('1')
  const [isLoading, setIsLoading] = useState(false)
  const [showLLMSettings, setShowLLMSettings] = useState(false)
  const [llmConnectionStatus, setLLMConnectionStatus] = useState(localLLMService.getConnectionStatus())
  const [showDataSelector, setShowDataSelector] = useState(false)
  const [currentProject, setCurrentProject] = useState<AnalyticsProject | null>(null)
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingChatName, setEditingChatName] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeView, setActiveView] = useState<'code' | 'preview'>('preview')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { jiraData, dataSources } = useApp()
  const [isRunning, setIsRunning] = useState(false)

  const currentChat = chatSessions.find(chat => chat.id === currentChatId)
  const messages = currentChat?.messages || []

  // Check LLM connection status on component mount
  useEffect(() => {
    const checkLLMConnection = async () => {
      const isConnected = await localLLMService.testConnection()
      setLLMConnectionStatus(localLLMService.getConnectionStatus())
    }
    
    checkLLMConnection()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentChatId])

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...message
    }
    
    setChatSessions(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? { 
            ...chat, 
            messages: [...chat.messages, newMessage],
            lastActivity: new Date().toISOString()
          }
        : chat
    ))
  }

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      name: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    }
    
    setChatSessions(prev => [newChat, ...prev])
    setCurrentChatId(newChat.id)
  }

  const deleteChat = (chatId: string) => {
    if (chatSessions.length <= 1) return
    
    setChatSessions(prev => prev.filter(chat => chat.id !== chatId))
    
    if (currentChatId === chatId) {
      const remainingChats = chatSessions.filter(chat => chat.id !== chatId)
      setCurrentChatId(remainingChats[0]?.id || '1')
    }
  }

  const renameChat = (chatId: string, newName: string) => {
    setChatSessions(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, name: newName } : chat
    ))
    setEditingChatId(null)
    setEditingChatName('')
  }

  const handleFileUploaded = (file: any) => {
    addMessage({
      type: 'user',
      content: `Uploaded file: ${file.name}`
    })
    
    addMessage({
      type: 'assistant',
      content: `I've successfully processed your file "${file.name}" with ${file.rowCount} rows and ${file.columns.length} columns. You can now ask questions about this data or create visualizations from it.`
    })
    
    setShowFileUpload(false)
  }

  const handleRunCode = async () => {
    if (!currentProject) return
    
    setIsRunning(true)
    
    // Simulate code execution and update
    setTimeout(() => {
      const updatedProject = {
        ...currentProject,
        updatedAt: new Date().toISOString()
      }
      setCurrentProject(updatedProject)
      setIsRunning(false)
    }, 1000)
  }

  const handleDataSelected = (data: any[], sourceName: string, chartType: string) => {
    const code = generateVisualizationCode(data, chartType, sourceName)
    
    const project: AnalyticsProject = {
      id: Date.now().toString(),
      name: `${sourceName} ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
      description: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart visualization of ${sourceName} data`,
      code,
      data,
      chartType: chartType as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setCurrentProject(project)
    
    addMessage({
      type: 'assistant',
      content: `I've created a ${chartType} chart visualization using data from "${sourceName}". The chart shows ${data.length} data points and is displayed in the preview panel.`
    })
  }

  const generateVisualizationCode = (data: any[], chartType: string, sourceName: string): string => {
    const dataKeys = Object.keys(data[0] || {})
    const xKey = dataKeys[0] || 'x'
    const yKey = dataKeys[1] || 'y'
    
    return `import React from 'react';
import { ${chartType.charAt(0).toUpperCase() + chartType.slice(1)}Chart, ${chartType.charAt(0).toUpperCase() + chartType.slice(1)}, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = ${JSON.stringify(data.slice(0, 20), null, 2)};

const ${sourceName.replace(/[^a-zA-Z0-9]/g, '')}Visualization = () => {
  return (
    <div className="w-full h-96 bg-white p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">${sourceName} - ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart</h2>
      <ResponsiveContainer width="100%" height="100%">
        <${chartType.charAt(0).toUpperCase() + chartType.slice(1)}Chart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="${xKey}" />
          <YAxis />
          <Tooltip />
          <${chartType.charAt(0).toUpperCase() + chartType.slice(1)} dataKey="${yKey}" fill="#3B82F6" />
        </${chartType.charAt(0).toUpperCase() + chartType.slice(1)}Chart>
      </ResponsiveContainer>
    </div>
  );
};

export default ${sourceName.replace(/[^a-zA-Z0-9]/g, '')}Visualization;`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const userMessage = query
    setQuery('')
    
    addMessage({
      type: 'user',
      content: userMessage
    })

    const loadingMessageId = Date.now().toString()
    addMessage({
      type: 'assistant',
      content: '',
      isLoading: true
    })

    setIsLoading(true)
    
    try {
      let response = ''
      const files = fileService.getFiles()
      
      if (llmConnectionStatus === 'connected') {
        try {
          if (files.length > 0 && (
            userMessage.toLowerCase().includes('analyze') ||
            userMessage.toLowerCase().includes('chart') ||
            userMessage.toLowerCase().includes('visualization') ||
            userMessage.toLowerCase().includes('data') ||
            userMessage.toLowerCase().includes('show') ||
            userMessage.toLowerCase().includes('create')
          )) {
            const latestFile = files[0]
            const analysisResult = await localLLMService.analyzeDataWithVisualization(latestFile.data, userMessage)
            response = analysisResult.response
            
            if (analysisResult.shouldCreateVisualization && analysisResult.chartType) {
              setTimeout(() => {
                handleDataSelected(latestFile.data, latestFile.name, analysisResult.chartType!)
              }, 500)
              
              response += `\n\nI've created a ${analysisResult.chartType} visualization for you. Check the preview panel to see your chart!`
            }
          } else {
            const llmResponse = await localLLMService.generateResponse(userMessage)
            response = llmResponse.response
          }
        } catch (error) {
          console.error('LLM error:', error)
          response = `I encountered an error with the local LLM: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your Llama 3.1:8B connection.`
        }
      } else {
        response = 'Please connect your local Llama 3.1:8B model for intelligent responses, or upload some files to get started with basic data analysis.'
      }
      
      setChatSessions(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { 
              ...chat, 
              messages: chat.messages.map(msg => 
                msg.id === loadingMessageId 
                  ? { ...msg, content: response, isLoading: false }
                  : msg
              ),
              lastActivity: new Date().toISOString()
            }
          : chat
      ))
      
    } catch (error) {
      setChatSessions(prev => prev.map(chat => 
        chat.id === currentChatId 
          ? { 
              ...chat, 
              messages: chat.messages.map(msg => 
                msg.id === loadingMessageId 
                  ? { ...msg, content: 'Sorry, I encountered an error processing your request. Please try again.', isLoading: false }
                  : msg
              ),
              lastActivity: new Date().toISOString()
            }
          : chat
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const uploadedFiles = fileService.getFiles()

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left Sidebar - Exact bolt.new style */}
      <motion.div
        initial={false}
        animate={{ 
          width: showSidebar ? (sidebarCollapsed ? 60 : 256) : 0,
          opacity: showSidebar ? 1 : 0
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="bg-gray-50 border-r border-gray-200 flex flex-col relative"
        onMouseEnter={() => setSidebarCollapsed(false)}
        onMouseLeave={() => setSidebarCollapsed(true)}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-2"
              animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              {!sidebarCollapsed && (
                <span className="font-semibold text-gray-900 text-sm">Analytics Studio</span>
              )}
            </motion.div>
            {!sidebarCollapsed && (
              <motion.button
                onClick={createNewChat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                title="New chat"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Chat History */}
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex-1 overflow-y-auto p-2"
          >
            <div className="space-y-1">
              {chatSessions.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative p-2 rounded-md cursor-pointer transition-colors ${
                    currentChatId === chat.id
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {editingChatId === chat.id ? (
                      <input
                        type="text"
                        value={editingChatName}
                        onChange={(e) => setEditingChatName(e.target.value)}
                        onBlur={() => renameChat(chat.id, editingChatName)}
                        onKeyPress={(e) => e.key === 'Enter' && renameChat(chat.id, editingChatName)}
                        className="flex-1 text-sm bg-transparent border-none outline-none text-gray-900"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => setCurrentChatId(chat.id)}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm font-medium truncate">{chat.name}</span>
                        </div>
                      </button>
                    )}
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingChatId(chat.id)
                          setEditingChatName(chat.name)
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      {chatSessions.length > 1 && (
                        <button
                          onClick={() => deleteChat(chat.id)}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Files Section */}
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="border-t border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Files</span>
              <motion.button
                onClick={() => setShowFileUpload(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                title="Upload files"
              >
                <Upload className="w-3 h-3 text-gray-600" />
              </motion.button>
            </div>
            
            {uploadedFiles.length === 0 ? (
              <div className="text-center py-4">
                <File className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No files uploaded</p>
              </div>
            ) : (
              <div className="space-y-1">
                {uploadedFiles.slice(0, 3).map((file) => (
                  <motion.div
                    key={file.id}
                    onClick={() => setQuery(`Analyze ${file.name}`)}
                    whileHover={{ scale: 1.02 }}
                    className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-3 h-3 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.rowCount} rows</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {uploadedFiles.length > 3 && (
                  <button
                    onClick={() => setShowFileUpload(true)}
                    className="w-full text-xs text-gray-500 hover:text-gray-700 transition-colors py-1"
                  >
                    +{uploadedFiles.length - 3} more files
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* LLM Status */}
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="border-t border-gray-200 p-4"
          >
            <motion.button
              onClick={() => setShowLLMSettings(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm ${
                llmConnectionStatus === 'connected'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span className="font-medium">
                {llmConnectionStatus === 'connected' ? 'LLM Connected' : 'Connect LLM'}
              </span>
              {llmConnectionStatus !== 'connected' && (
                <AlertCircle className="w-3 h-3" />
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Collapsed state icon */}
        {sidebarCollapsed && (
          <div className="flex flex-col items-center py-4 space-y-4">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <button
              onClick={createNewChat}
              className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              title="New chat"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Main Content Area - 40% width for chat */}
      <div className="flex-1 flex flex-col min-w-0" style={{ width: '40%' }}>
        {/* Top Header */}
        <div className="border-b border-gray-200 p-4 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{currentChat?.name || 'Analytics Studio'}</h1>
                <p className="text-sm text-gray-500">
                  AI-powered data analysis and visualization
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setShowDataSelector(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Database className="w-4 h-4" />
              <span>Data Sources</span>
            </motion.button>
            <motion.button
              onClick={() => onNavigate?.('sources')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-sm border border-gray-300"
            >
              New Visualization
            </motion.button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Analytics Studio</h2>
              <p className="text-gray-600 mb-6">Upload files and ask questions to get started with AI-powered data analysis</p>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                {[
                  { text: 'Create a bar chart', icon: BarChart3 },
                  { text: 'Show data trends', icon: TrendingUp },
                  { text: 'Generate pie chart', icon: PieChart },
                  { text: 'Build dashboard', icon: Database }
                ].map((action, index) => {
                  const Icon = action.icon
                  return (
                    <motion.button
                      key={index}
                      onClick={() => setQuery(action.text)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-100 transition-all text-left"
                    >
                      <Icon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">{action.text}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 border border-gray-200 text-gray-900'
              } rounded-lg p-4 shadow-sm`}>
                {message.type === 'assistant' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Analytics AI</span>
                  </div>
                )}
                
                {message.isLoading ? (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                ) : (
                  <div className={`${message.type === 'user' ? 'text-white' : 'text-gray-900'}`}>
                    {message.content}
                  </div>
                )}
                
                <div className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <motion.button
              type="button"
              onClick={() => setShowFileUpload(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300 hover:border-gray-400"
              title="Upload files"
            >
              <Upload className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              type="button"
              onClick={() => setShowDataSelector(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300 hover:border-gray-400"
              title="Connect data sources"
            >
              <Database className="w-5 h-5" />
            </motion.button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  uploadedFiles.length > 0
                    ? "Ask about your data or request a visualization..."
                    : "Upload files to get started with data analysis..."
                }
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 text-gray-900 placeholder-gray-500"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {llmConnectionStatus === 'connected' ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="LLM Connected" />
                ) : (
                  <div className="w-2 h-2 bg-red-500 rounded-full" title="LLM Disconnected" />
                )}
              </div>
            </div>
            
            <motion.button
              type="submit"
              disabled={!query.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </form>
        </div>
      </div>

      {/* Right Panel - Engine - 60% width */}
      {currentProject && (
        <div className="border-l border-gray-200 bg-white flex flex-col" style={{ width: '60%' }}>
          {/* Panel Content with integrated controls */}
          <div className="flex-1 overflow-hidden">
            {activeView === 'code' ? (
              <CodeEditor
                project={currentProject}
                onProjectUpdate={setCurrentProject}
                activeView={activeView}
                onViewChange={setActiveView}
                onRunCode={handleRunCode}
              />
            ) : (
              <AnalyticsPreview
                project={currentProject}
                onViewCode={() => setActiveView('code')}
                activeView={activeView}
                onViewChange={setActiveView}
                onRunCode={handleRunCode}
              />
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <DataSourceSelector
        isOpen={showDataSelector}
        onClose={() => setShowDataSelector(false)}
        onDataSelected={handleDataSelected}
      />
      
      <FileUpload
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onFileUploaded={handleFileUploaded}
      />
      
      <LLMSettings
        isOpen={showLLMSettings}
        onClose={() => {
          setShowLLMSettings(false)
          setLLMConnectionStatus(localLLMService.getConnectionStatus())
        }}
      />
    </div>
  )
}

export default QueryInterface