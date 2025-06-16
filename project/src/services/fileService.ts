import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface FileData {
  id: string;
  name: string;
  type: 'csv' | 'xlsx';
  size: number;
  uploadedAt: string;
  data: any[];
  columns: string[];
  rowCount: number;
  preview: any[];
}

export interface ParsedData {
  data: any[];
  columns: string[];
  rowCount: number;
  preview: any[];
}

class FileService {
  private readonly STORAGE_KEY = 'balanced_card_uploaded_files';
  private files: Map<string, FileData> = new Map();

  constructor() {
    this.loadFilesFromStorage();
  }

  // Parse CSV files
  async parseCSV(file: File): Promise<ParsedData> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
            return;
          }

          const data = results.data as any[];
          const columns = results.meta.fields || [];
          const rowCount = data.length;
          const preview = data.slice(0, 10);

          resolve({
            data,
            columns,
            rowCount,
            preview
          });
        },
        error: (error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      });
    });
  }

  // Parse XLSX files
  async parseXLSX(file: File): Promise<ParsedData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            reject(new Error('Excel file is empty'));
            return;
          }

          // First row as headers
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];
          
          // Convert rows to objects
          const processedData = rows.map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });

          const columns = headers;
          const rowCount = processedData.length;
          const preview = processedData.slice(0, 10);

          resolve({
            data: processedData,
            columns,
            rowCount,
            preview
          });
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read Excel file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  // Upload and process file
  async uploadFile(file: File): Promise<FileData> {
    const fileType = this.getFileType(file.name);
    if (!fileType) {
      throw new Error('Unsupported file type. Please upload CSV or XLSX files.');
    }

    let parsedData: ParsedData;

    try {
      switch (fileType) {
        case 'csv':
          parsedData = await this.parseCSV(file);
          break;
        case 'xlsx':
          parsedData = await this.parseXLSX(file);
          break;
        default:
          throw new Error('Unsupported file type');
      }
    } catch (error) {
      throw new Error(`Failed to process file: ${error}`);
    }

    const fileData: FileData = {
      id: this.generateId(),
      name: file.name,
      type: fileType,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      data: parsedData.data,
      columns: parsedData.columns,
      rowCount: parsedData.rowCount,
      preview: parsedData.preview
    };

    this.files.set(fileData.id, fileData);
    this.saveFilesToStorage();

    return fileData;
  }

  // Get all uploaded files
  getFiles(): FileData[] {
    return Array.from(this.files.values()).sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  // Get file by ID
  getFile(id: string): FileData | null {
    return this.files.get(id) || null;
  }

  // Delete file
  deleteFile(id: string): boolean {
    const deleted = this.files.delete(id);
    if (deleted) {
      this.saveFilesToStorage();
    }
    return deleted;
  }

  // Search within file data
  searchInFile(fileId: string, query: string): any[] {
    const file = this.files.get(fileId);
    if (!file) return [];

    const lowerQuery = query.toLowerCase();
    
    return file.data.filter(row => {
      return Object.values(row).some(value => 
        String(value).toLowerCase().includes(lowerQuery)
      );
    });
  }

  // Get file statistics
  getFileStats(fileId: string): any {
    const file = this.files.get(fileId);
    if (!file) return null;

    const stats: any = {
      totalRows: file.rowCount,
      totalColumns: file.columns.length,
      fileSize: this.formatFileSize(file.size),
      uploadedAt: new Date(file.uploadedAt).toLocaleDateString()
    };

    // Calculate basic statistics for numeric columns
    const numericColumns = file.columns.filter(col => {
      const sample = file.data.slice(0, 100);
      return sample.every(row => !isNaN(Number(row[col])) && row[col] !== '');
    });

    stats.numericColumns = numericColumns.length;
    stats.textColumns = file.columns.length - numericColumns.length;

    // Calculate basic stats for first numeric column
    if (numericColumns.length > 0) {
      const firstNumCol = numericColumns[0];
      const values = file.data
        .map(row => Number(row[firstNumCol]))
        .filter(val => !isNaN(val));
      
      if (values.length > 0) {
        stats.sampleStats = {
          column: firstNumCol,
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          count: values.length
        };
      }
    }

    return stats;
  }

  // Private helper methods
  private getFileType(filename: string): 'csv' | 'xlsx' | null {
    const extension = filename.toLowerCase().split('.').pop();
    switch (extension) {
      case 'csv':
        return 'csv';
      case 'xlsx':
      case 'xls':
        return 'xlsx';
      default:
        return null;
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private loadFilesFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const fileData = JSON.parse(stored);
        this.files = new Map(Object.entries(fileData));
      }
    } catch (error) {
      console.error('Failed to load files from storage:', error);
    }
  }

  private saveFilesToStorage(): void {
    try {
      const fileData = Object.fromEntries(this.files);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(fileData));
    } catch (error) {
      console.error('Failed to save files to storage:', error);
    }
  }
}

export const fileService = new FileService();