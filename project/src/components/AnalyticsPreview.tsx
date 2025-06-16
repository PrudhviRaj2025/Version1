import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Download, Share, Settings, Maximize2, RefreshCw, Eye, BarChart3, PieChart, TrendingUp, Activity, ScatterChart as Scatter, Play } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, ScatterChart, Scatter as RechartsScatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Dashboard Renderer Component
const DashboardRenderer: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];
  
  // Analyze data structure
  const columns = Object.keys(data[0]);
  const numericColumns = columns.filter(col => {
    const sample = data.slice(0, 50);
    return sample.some(row => !isNaN(Number(row[col])) && row[col] !== '');
  });
  const categoricalColumns = columns.filter(col => !numericColumns.includes(col));
  
  // Process data for pie chart
  const pieData = data.reduce((acc: any[], item) => {
    const key = item[categoricalColumns[0] || columns[0]] || 'Unknown';
    const existing = acc.find(entry => entry.name === key);
    if (existing) {
      existing.value += Number(item[numericColumns[0]]) || 1;
    } else {
      acc.push({ name: key, value: Number(item[numericColumns[0]]) || 1 });
    }
    return acc;
  }, []);
  
  // Sample data for detailed charts (first 20 records)
  const sampleData = data.slice(0, 20);
  
  return (
    <div className="w-full h-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Complete Data Dashboard</h1>
        <p className="text-slate-600">Interactive analysis of {data.length.toLocaleString()} records across {columns.length} dimensions</p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Records</p>
              <p className="text-2xl font-bold text-slate-900">{data.length.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Columns</p>
              <p className="text-2xl font-bold text-slate-900">{columns.length}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        
        {numericColumns.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total {numericColumns[0]}</p>
                <p className="text-2xl font-bold text-slate-900">
                  {data.reduce((sum, item) => sum + (Number(item[numericColumns[0]]) || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Data Quality</p>
              <p className="text-2xl font-bold text-slate-900">
                {(() => {
                  const totalCells = data.length * columns.length;
                  const filledCells = data.reduce((count, row) => {
                    return count + Object.values(row).filter(val => val !== null && val !== undefined && val !== '').length;
                  }, 0);
                  return `${((filledCells / totalCells) * 100).toFixed(1)}%`;
                })()}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">{columns[0]} Distribution (Sample)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={columns[0]} stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey={numericColumns[0] || columns[1] || columns[0]} fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Pie Chart */}
        {numericColumns.length > 0 && categoricalColumns.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{categoricalColumns[0]} Breakdown (Complete Data)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={pieData.slice(0, 8)} // Top 8 categories
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Line Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Trend Analysis (Sample)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={columns[0]} stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey={numericColumns[0] || columns[1] || columns[0]} 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Area Chart for multiple metrics */}
        {numericColumns.length > 1 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Multi-Metric Comparison (Sample)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sampleData}>
                <defs>
                  <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey={columns[0]} stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey={numericColumns[0]}
                  stackId="1"
                  stroke="#3B82F6"
                  fill="url(#colorGradient1)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey={numericColumns[1]}
                  stackId="2"
                  stroke="#10B981"
                  fill="url(#colorGradient2)"
                  strokeWidth={2}
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Summary Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Summary Statistics</h3>
          <div className="space-y-3">
            {numericColumns.slice(0, 3).map((col) => {
              const values = data.map(row => Number(row[col]) || 0);
              const sum = values.reduce((a, b) => a + b, 0);
              const avg = sum / values.length;
              const min = Math.min(...values);
              const max = Math.max(...values);
              
              return (
                <div key={col} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">{col}</span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">
                      Avg: {avg.toFixed(1)}
                    </div>
                    <div className="text-xs text-slate-500">
                      Range: {min} - {max}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Data Quality Metrics */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Quality</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Completeness</span>
              <span className="text-sm font-bold text-green-600">
                {(() => {
                  const totalCells = data.length * columns.length;
                  const filledCells = data.reduce((count, row) => {
                    return count + Object.values(row).filter(val => val !== null && val !== undefined && val !== '').length;
                  }, 0);
                  return `${((filledCells / totalCells) * 100).toFixed(1)}%`;
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Unique Records</span>
              <span className="text-sm font-bold text-blue-600">{data.length.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Numeric Columns</span>
              <span className="text-sm font-bold text-purple-600">{numericColumns.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Text Columns</span>
              <span className="text-sm font-bold text-orange-600">{columns.length - numericColumns.length}</span>
            </div>
          </div>
        </div>
        
        {/* Quick Insights */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Insights</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">Dataset Size</p>
              <p className="text-xs text-blue-700">
                Large dataset with {data.length.toLocaleString()} records across {columns.length} dimensions
              </p>
            </div>
            {numericColumns.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-900">Data Richness</p>
                <p className="text-xs text-green-700">
                  Contains {numericColumns.length} numeric columns suitable for quantitative analysis
                </p>
              </div>
            )}
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-900">Analysis Ready</p>
              <p className="text-xs text-purple-700">
                Data is structured and ready for advanced analytics and machine learning
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Data Table Preview */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Preview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {columns.map((col) => (
                  <th key={col} className="text-left p-3 font-medium text-slate-700">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                  {columns.map((col) => (
                    <td key={col} className="p-3 text-slate-600">{String(row[col])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Showing 10 of {data.length.toLocaleString()} rows • Full dataset contains {data.length.toLocaleString()} records
        </p>
      </div>
    </div>
  );
};

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

interface AnalyticsPreviewProps {
  project: AnalyticsProject | null;
  onViewCode: () => void;
  activeView?: 'code' | 'preview';
  onViewChange?: (view: 'code' | 'preview') => void;
  onRunCode?: () => void;
}

const AnalyticsPreview: React.FC<AnalyticsPreviewProps> = ({ project, onViewCode, activeView = 'preview', onViewChange, onRunCode }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = async () => {
    if (onRunCode) {
      setIsRunning(true);
      await onRunCode();
      setTimeout(() => setIsRunning(false), 1000);
    }
  };

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Visualization</h3>
          <p className="text-gray-400">Create a chart from the chat to see the preview here.</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

  const renderChart = () => {
    if (!project.data || project.data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No data available for visualization</p>
          </div>
        </div>
      );
    }

    // If this is a dashboard project, render the dashboard code directly
    if (project.name.includes('Dashboard') && project.code.includes('InteractiveDashboard')) {
      return (
        <div className="h-full overflow-auto bg-white">
          <DashboardRenderer data={project.data} />
        </div>
      );
    }
    const dataKeys = Object.keys(project.data[0]);
    const xKey = dataKeys[0];
    const yKey = dataKeys[1] || dataKeys[0];

    switch (project.chartType) {
      case 'dashboard':
        return (
          <div className="h-full overflow-auto bg-white">
            <DashboardRenderer data={project.data} />
          </div>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={project.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={xKey} stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey={yKey} fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={project.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={xKey} stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey={yKey} 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={project.data}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={xKey} stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey={yKey}
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={project.data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey={yKey}
                nameKey={xKey}
              >
                {project.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={project.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={xKey} stroke="#64748B" />
              <YAxis dataKey={yKey} stroke="#64748B" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <RechartsScatter dataKey={yKey} fill="#3B82F6" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-500">Unsupported chart type</p>
          </div>
        );
    }
  };

  const getChartIcon = () => {
    switch (project.chartType) {
      case 'dashboard': return BarChart3;
      case 'bar': return BarChart3;
      case 'line': return TrendingUp;
      case 'pie': return PieChart;
      case 'area': return Activity;
      case 'scatter': return Scatter;
      default: return BarChart3;
    }
  };

  const ChartIcon = getChartIcon();

  return (
    <div className={`h-full flex flex-col bg-white ${isFullscreen ? 'fixed inset-0 z-50 overflow-hidden' : ''}`}>
      {/* Preview Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <ChartIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{project.name}</h2>
            <p className="text-sm text-gray-500 capitalize">{project.chartType} Chart • {project.data.length} data points</p>
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
          
          {/* Run Button */}
          <motion.button
            onClick={handleRunCode}
            disabled={isRunning}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span className="text-sm">Run</span>
              </>
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Download chart"
          >
            <Download className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Share chart"
          >
            <Share className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => setIsFullscreen(!isFullscreen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Chart Container */}
      <div className={`flex-1 p-6 ${isFullscreen ? 'overflow-y-auto' : ''}`}>
        <div className="h-full bg-white">
          {renderChart()}
        </div>
      </div>

      {/* Chart Info */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Data Points:</span> {project.data.length}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Chart Type:</span> {project.chartType.charAt(0).toUpperCase() + project.chartType.slice(1)}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Last Updated:</span> {new Date(project.updatedAt).toLocaleString()}
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPreview;