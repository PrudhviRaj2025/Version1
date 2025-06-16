import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, CheckCircle, AlertCircle, FileText, Table, FileSpreadsheet, Eye, Trash2, Download, BarChart3, TrendingUp, PieChart } from 'lucide-react';
import { fileService, FileData } from '../services/fileService';

interface FileUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUploaded: (file: FileData) => void;
  onFileSelected?: (file: FileData) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ isOpen, onClose, onFileUploaded, onFileSelected }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>(fileService.getFiles());
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'select'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    setError('');
    setUploading(true);

    try {
      for (const file of files) {
        const fileData = await fileService.uploadFile(file);
        setUploadedFiles(prev => [fileData, ...prev]);
        onFileUploaded(fileData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    fileService.deleteFile(fileId);
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  const handleSelectFile = (file: FileData) => {
    if (onFileSelected) {
      onFileSelected(file);
      onClose();
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'csv':
        return Table;
      case 'xlsx':
        return FileSpreadsheet;
      case 'pdf':
        return FileText;
      default:
        return File;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl w-full max-w-4xl mx-4 shadow-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header with Tabs */}
          <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-xl font-bold text-white">Files & Data</h2>
                <p className="text-sm text-gray-400">Upload new files or select from existing ones</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[#2a2a2a]">
            <motion.button
              onClick={() => setActiveTab('upload')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-orange-500 text-orange-400 bg-[#2a2a2a]'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload New Files</span>
              </div>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('select')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'select'
                  ? 'border-orange-500 text-orange-400 bg-[#2a2a2a]'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Select Existing ({uploadedFiles.length})</span>
              </div>
            </motion.button>
          </div>

          {/* Content Area */}
          <div className="flex">
            {/* Upload Section */}
            {activeTab === 'upload' && (
              <div className="w-1/2 p-6 border-r border-[#2a2a2a]">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Upload New Files</h3>
                  <p className="text-sm text-gray-400">CSV, XLSX files supported (up to 10MB)</p>
                </div>

                {/* Drop Zone */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-orange-400 bg-orange-500/10' 
                      : 'border-[#3a3a3a] hover:border-orange-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".csv,.xlsx,.xls"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-orange-400" />
                    </div>
                    
                    <div>
                      <p className="text-lg font-medium text-white mb-2">
                        Drop files here or click to browse
                      </p>
                      <p className="text-sm text-gray-400">
                        Supports CSV and Excel (XLSX) files up to 10MB
                      </p>
                    </div>

                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg hover:from-orange-500 hover:to-red-600 transition-colors"
                    >
                      Choose Files
                    </motion.button>
                  </div>

                  {uploading && (
                    <div className="absolute inset-0 bg-[#1a1a1a] bg-opacity-90 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-400">Processing file...</p>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* File Format Info */}
                <div className="mt-6 space-y-3">
                  <h3 className="font-medium text-white">Supported Formats:</h3>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Table className="w-4 h-4 text-green-600" />
                      <span><strong>CSV:</strong> Comma-separated values for tabular data</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                      <span><strong>XLSX:</strong> Excel spreadsheets with multiple sheets</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* File Selection Section */}
            {activeTab === 'select' && (
              <div className="w-1/2 p-6 border-r border-[#2a2a2a]">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Select File for Analysis</h3>
                  <p className="text-sm text-gray-400">Choose from your uploaded files to analyze or create visualizations</p>
                </div>

                {uploadedFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <File className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 mb-2">No files uploaded yet</p>
                    <motion.button
                      onClick={() => setActiveTab('upload')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg hover:from-orange-500 hover:to-red-600 transition-colors"
                    >
                      Upload Your First File
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {uploadedFiles.map((file) => {
                      const Icon = getFileIcon(file.type);
                      
                      return (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 border border-[#2a2a2a] rounded-lg hover:border-orange-400 hover:bg-[#2a2a2a] transition-all cursor-pointer"
                          onClick={() => handleSelectFile(file)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <Icon className={`w-6 h-6 ${
                                file.type === 'csv' ? 'text-green-600' :
                                file.type === 'xlsx' ? 'text-blue-600' : 'text-red-600'
                              }`} />
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-white truncate">{file.name}</p>
                                <p className="text-sm text-gray-400">
                                  {file.rowCount.toLocaleString()} rows • {file.columns.length} columns • {formatFileSize(file.size)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFile(file);
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 hover:bg-[#3a3a3a] rounded-lg transition-colors"
                                title="Preview data"
                              >
                                <Eye className="w-4 h-4 text-gray-400" />
                              </motion.button>
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFile(file.id);
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Delete file"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </motion.button>
                            </div>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="mt-3 flex items-center space-x-2">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectFile(file);
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs rounded-lg hover:from-orange-500 hover:to-red-600 transition-colors"
                            >
                              <BarChart3 className="w-3 h-3" />
                              <span>Analyze</span>
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Auto-populate with chart creation query
                                if (onFileSelected) {
                                  onFileSelected(file);
                                  onClose();
                                }
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-green-500/20 text-green-400 text-xs rounded-lg hover:bg-green-500/30 transition-colors"
                            >
                              <TrendingUp className="w-3 h-3" />
                              <span>Chart</span>
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onFileSelected) {
                                  onFileSelected(file);
                                  onClose();
                                }
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-purple-500/20 text-purple-400 text-xs rounded-lg hover:bg-purple-500/30 transition-colors"
                            >
                              <PieChart className="w-3 h-3" />
                              <span>Dashboard</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Files List Section - Always visible on right */}
            <div className="w-1/2 p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">
                {activeTab === 'upload' ? 'Recently Uploaded' : 'File Details'} ({uploadedFiles.length})
              </h3>

              {uploadedFiles.length === 0 ? (
                <div className="text-center py-8">
                  <File className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No files uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploadedFiles.map((file) => {
                    const Icon = getFileIcon(file.type);
                    const isSelected = selectedFile?.id === file.id;
                    
                    return (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-orange-500 bg-orange-500/10' 
                            : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                        }`}
                        onClick={() => setSelectedFile(isSelected ? null : file)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <Icon className={`w-5 h-5 ${
                              file.type === 'csv' ? 'text-green-600' :
                              file.type === 'xlsx' ? 'text-blue-600' : 'text-red-600'
                            }`} />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-white truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)} • {file.rowCount} rows
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(file);
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1 hover:bg-[#3a3a3a] rounded"
                            >
                              <Eye className="w-4 h-4 text-gray-400" />
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(file.id);
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1 hover:bg-red-500/20 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </motion.button>
                          </div>
                        </div>

                        {/* File Preview */}
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-slate-200"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>Preview ({file.preview.length} of {file.rowCount} rows)</span>
                                <span>Uploaded {new Date(file.uploadedAt).toLocaleDateString()}</span>
                              </div>
                              
                              <div className="bg-[#0a0a0a] rounded p-2 max-h-32 overflow-auto">
                                <div className="text-xs font-mono">
                                  <div className="grid grid-cols-3 gap-2 font-semibold mb-1">
                                    {file.columns.slice(0, 3).map(col => (
                                      <div key={col} className="truncate text-gray-300">{col}</div>
                                    ))}
                                  </div>
                                  {file.preview.slice(0, 3).map((row: any, index: number) => (
                                    <div key={index} className="grid grid-cols-3 gap-2">
                                      {file.columns.slice(0, 3).map(col => (
                                        <div key={col} className="truncate text-gray-400">{String(row[col])}</div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FileUpload;