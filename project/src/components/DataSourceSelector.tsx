import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, FileText, Cloud, X, Search, Filter, CheckCircle, BarChart3, PieChart, TrendingUp, Activity, ScatterChart as Scatter } from 'lucide-react';
import { fileService } from '../services/fileService';
import { useApp } from '../context/AppContext';

interface DataSource {
  id: string;
  name: string;
  type: 'file' | 'database' | 'api';
  icon: React.ComponentType<any>;
  description: string;
  rowCount: number;
  columns: string[];
  lastUpdated: string;
  data?: any[];
}

interface DataSourceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSelected: (data: any[], sourceName: string, chartType: string) => void;
}

const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({ isOpen, onClose, onDataSelected }) => {
  const { dataSources } = useApp();
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [selectedChartType, setSelectedChartType] = useState<string>('bar');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'file' | 'database' | 'api'>('all');

  // Get available data sources
  const getAvailableDataSources = (): DataSource[] => {
    const sources: DataSource[] = [];
    
    // Add uploaded files
    const files = fileService.getFiles();
    files.forEach(file => {
      sources.push({
        id: file.id,
        name: file.name,
        type: 'file',
        icon: FileText,
        description: `${file.type.toUpperCase()} file with ${file.rowCount} rows`,
        rowCount: file.rowCount,
        columns: file.columns,
        lastUpdated: file.uploadedAt,
        data: file.data
      });
    });
    
    // Add connected data sources
    dataSources.forEach(ds => {
      if (ds.status === 'connected') {
        sources.push({
          id: ds.id,
          name: ds.name,
          type: ds.type === 'database' ? 'database' : 'api',
          icon: ds.type === 'database' ? Database : Cloud,
          description: `Connected ${ds.type} source`,
          rowCount: Math.floor(Math.random() * 10000) + 100, // Mock data
          columns: ['id', 'name', 'value', 'category', 'date'], // Mock columns
          lastUpdated: ds.lastSync
        });
      }
    });
    
    return sources;
  };

  const availableSources = getAvailableDataSources();
  
  // Filter sources based on search and type
  const filteredSources = availableSources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         source.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || source.type === filterType;
    return matchesSearch && matchesType;
  });

  const chartTypes = [
    { id: 'dashboard', name: 'Complete Dashboard', icon: BarChart3, description: 'Multi-chart analytics dashboard' },
    { id: 'bar', name: 'Bar Chart', icon: BarChart3, description: 'Compare categories' },
    { id: 'line', name: 'Line Chart', icon: TrendingUp, description: 'Show trends over time' },
    { id: 'pie', name: 'Pie Chart', icon: PieChart, description: 'Show proportions' },
    { id: 'area', name: 'Area Chart', icon: Activity, description: 'Filled line chart' },
    { id: 'scatter', name: 'Scatter Plot', icon: Scatter, description: 'Show correlations' }
  ];

  const handleCreateVisualization = () => {
    if (!selectedSource) return;
    
    let data = selectedSource.data || [];
    
    // If no data available, generate mock data
    if (data.length === 0) {
      data = Array.from({ length: 20 }, (_, i) => ({
        name: `Item ${i + 1}`,
        value: Math.floor(Math.random() * 100) + 10,
        category: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
    }
    
    onDataSelected(data, selectedSource.name, selectedChartType);
    onClose();
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
          className="bg-white rounded-xl w-full max-w-4xl mx-4 shadow-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Create New Visualization</h2>
              <p className="text-slate-600 mt-1">Choose your data source and chart type</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="flex h-[600px]">
            {/* Data Sources Panel */}
            <div className="w-1/2 border-r border-slate-200 flex flex-col">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Select Data Source</h3>
                
                {/* Search and Filter */}
                <div className="space-y-3">
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
                  
                  <div className="flex space-x-2">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'file', label: 'Files' },
                      { id: 'database', label: 'Databases' },
                      { id: 'api', label: 'APIs' }
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setFilterType(filter.id as any)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          filterType === filter.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Sources List */}
              <div className="flex-1 overflow-y-auto p-4">
                {filteredSources.length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No data sources found</p>
                    <p className="text-sm text-slate-400 mt-1">Upload files or connect data sources to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSources.map((source) => {
                      const Icon = source.icon;
                      const isSelected = selectedSource?.id === source.id;
                      
                      return (
                        <motion.div
                          key={source.id}
                          onClick={() => setSelectedSource(source)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                source.type === 'file' ? 'bg-green-50' :
                                source.type === 'database' ? 'bg-blue-50' : 'bg-purple-50'
                              }`}>
                                <Icon className={`w-5 h-5 ${
                                  source.type === 'file' ? 'text-green-600' :
                                  source.type === 'database' ? 'text-blue-600' : 'text-purple-600'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-slate-900 truncate">{source.name}</h4>
                                <p className="text-sm text-slate-600 mt-1">{source.description}</p>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                                  <span>{source.rowCount.toLocaleString()} rows</span>
                                  <span>{source.columns.length} columns</span>
                                  <span>{new Date(source.lastUpdated).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          
                          {/* Column Preview */}
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-3 pt-3 border-t border-slate-200"
                            >
                              <p className="text-sm font-medium text-slate-700 mb-2">Available Columns:</p>
                              <div className="flex flex-wrap gap-1">
                                {source.columns.slice(0, 6).map((column) => (
                                  <span
                                    key={column}
                                    className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded"
                                  >
                                    {column}
                                  </span>
                                ))}
                                {source.columns.length > 6 && (
                                  <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded">
                                    +{source.columns.length - 6} more
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Chart Type Panel */}
            <div className="w-1/2 flex flex-col">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Choose Chart Type</h3>
                <p className="text-sm text-slate-600">Select the best visualization for your data</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 gap-3">
                  {chartTypes.map((chart) => {
                    const Icon = chart.icon;
                    const isSelected = selectedChartType === chart.id;
                    
                    return (
                      <motion.div
                        key={chart.id}
                        onClick={() => setSelectedChartType(chart.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-blue-100' : 'bg-slate-100'
                            }`}>
                              <Icon className={`w-5 h-5 ${
                                isSelected ? 'text-blue-600' : 'text-slate-600'
                              }`} />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">{chart.name}</h4>
                              <p className="text-sm text-slate-600">{chart.description}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Chart Preview */}
                {selectedChartType && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-slate-50 rounded-lg"
                  >
                    <h4 className="font-medium text-slate-900 mb-2">Chart Preview</h4>
                    <div className="h-32 bg-white rounded border border-slate-200 flex items-center justify-center">
                      <div className="text-center">
                        {React.createElement(chartTypes.find(c => c.id === selectedChartType)?.icon || BarChart3, {
                          className: "w-8 h-8 text-slate-400 mx-auto mb-2"
                        })}
                        <p className="text-sm text-slate-500">
                          {chartTypes.find(c => c.id === selectedChartType)?.name} preview
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-200">
                <div className="flex space-x-3">
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleCreateVisualization}
                    disabled={!selectedSource}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Visualization
                  </motion.button>
                </div>
                
                {selectedSource && (
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Creating {chartTypes.find(c => c.id === selectedChartType)?.name.toLowerCase()} from "{selectedSource.name}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DataSourceSelector;