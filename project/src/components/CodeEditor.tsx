import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Copy, Download, Settings, RefreshCw, Code2, FileText, Zap, Code, Eye } from 'lucide-react';

interface AnalyticsProject {
  id: string;
  name: string;
  description: string;
  code: string;
  data: any[];
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'dashboard';
  createdAt: string;
  updatedAt: string;
}

interface CodeEditorProps {
  project: AnalyticsProject | null;
  onProjectUpdate: (project: AnalyticsProject) => void;
  activeView?: 'code' | 'preview';
  onViewChange?: (view: 'code' | 'preview') => void;
  onRunCode?: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  project, 
  onProjectUpdate, 
  activeView = 'code', 
  onViewChange, 
  onRunCode 
}) => {
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'data' | 'config'>('code');

  useEffect(() => {
    if (project) {
      setCode(project.code);
    }
  }, [project]);

  const handleRunCode = async () => {
    if (!project) return;
    
    setIsRunning(true);
    
    // Simulate code execution
    setTimeout(() => {
      const updatedProject = {
        ...project,
        code,
        updatedAt: new Date().toISOString()
      };
      onProjectUpdate(updatedProject);
      setIsRunning(false);
      
      // Call parent run handler if provided
      if (onRunCode) {
        onRunCode();
      }
    }, 1000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name || 'visualization'}.jsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'code', label: 'Code', icon: Code2 },
    { id: 'data', label: 'Data', icon: FileText },
    { id: 'config', label: 'Config', icon: Settings }
  ];

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Code2 className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Project Selected</h3>
          <p className="text-gray-500">Create a visualization from the chat to see the generated code here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Code2 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{project.name}</h2>
              <p className="text-sm text-gray-500">Last updated: {new Date(project.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Code/Preview Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <motion.button
              onClick={() => onViewChange?.('code')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors text-sm ${
                activeView === 'code' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Code</span>
            </motion.button>
            
            <motion.button
              onClick={() => onViewChange?.('preview')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors text-sm ${
                activeView === 'preview' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </motion.button>
          </div>
          
          <motion.button
            onClick={handleCopyCode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Copy code"
          >
            <Copy className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={handleDownloadCode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Download code"
          >
            <Download className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={handleRunCode}
            disabled={isRunning}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-gray-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : ''}`} />
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'code' && (
          <div className="h-full">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 font-mono text-sm bg-white text-gray-900 border-none resize-none focus:outline-none"
              placeholder="// Your visualization code will appear here..."
              spellCheck={false}
            />
          </div>
        )}

        {activeTab === 'data' && (
          <div className="h-full overflow-auto p-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Data Preview</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {project.data.length > 0 && Object.keys(project.data[0]).map((key) => (
                        <th key={key} className="text-left p-2 font-medium text-gray-700">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {project.data.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="p-2 text-gray-600">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {project.data.length > 10 && (
                <p className="text-xs text-gray-600 mt-2">
                  Showing 10 of {project.data.length} rows
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="h-full overflow-auto p-4">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Chart Configuration</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chart Type
                    </label>
                    <select 
                      value={project.chartType}
                      onChange={(e) => {
                        const updatedProject = {
                          ...project,
                          chartType: e.target.value as any,
                          updatedAt: new Date().toISOString()
                        };
                        onProjectUpdate(updatedProject);
                      }}
                      className="w-full p-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bar">Bar Chart</option>
                      <option value="dashboard">Complete Dashboard</option>
                      <option value="line">Line Chart</option>
                      <option value="pie">Pie Chart</option>
                      <option value="area">Area Chart</option>
                      <option value="scatter">Scatter Plot</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => {
                        const updatedProject = {
                          ...project,
                          name: e.target.value,
                          updatedAt: new Date().toISOString()
                        };
                        onProjectUpdate(updatedProject);
                      }}
                      className="w-full p-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={project.description}
                      onChange={(e) => {
                        const updatedProject = {
                          ...project,
                          description: e.target.value,
                          updatedAt: new Date().toISOString()
                        };
                        onProjectUpdate(updatedProject);
                      }}
                      rows={3}
                      className="w-full p-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium text-blue-600">Pro Tips</h4>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use the Run button to update the preview</li>
                  <li>• Modify the code to customize your visualization</li>
                  <li>• Download the code to use in your own projects</li>
                  <li>• Switch chart types to see different perspectives</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;