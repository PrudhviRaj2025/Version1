import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileType = getFileType(file.name)
    if (!fileType) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    let parsedData: any

    if (fileType === 'csv') {
      parsedData = await parseCSV(file)
    } else if (fileType === 'xlsx') {
      parsedData = await parseXLSX(file)
    }

    const fileData = {
      id: generateId(),
      name: file.name,
      type: fileType,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      data: parsedData.data,
      columns: parsedData.columns,
      rowCount: parsedData.rowCount,
      preview: parsedData.preview
    }

    return NextResponse.json(fileData)
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 })
  }
}

function getFileType(filename: string): 'csv' | 'xlsx' | null {
  const extension = filename.toLowerCase().split('.').pop()
  switch (extension) {
    case 'csv':
      return 'csv'
    case 'xlsx':
    case 'xls':
      return 'xlsx'
    default:
      return null
  }
}

async function parseCSV(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${results.errors[0].message}`))
            return
          }

          const data = results.data as any[]
          const columns = results.meta.fields || []
          const rowCount = data.length
          const preview = data.slice(0, 10)

          resolve({
            data,
            columns,
            rowCount,
            preview
          })
        },
        error: (error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`))
        }
      })
    }
    reader.readAsText(file)
  })
}

async function parseXLSX(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        if (jsonData.length === 0) {
          reject(new Error('Excel file is empty'))
          return
        }

        // First row as headers
        const headers = jsonData[0] as string[]
        const rows = jsonData.slice(1) as any[][]
        
        // Convert rows to objects
        const processedData = rows.map(row => {
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header] = row[index] || ''
          })
          return obj
        })

        const columns = headers
        const rowCount = processedData.length
        const preview = processedData.slice(0, 10)

        resolve({
          data: processedData,
          columns,
          rowCount,
          preview
        })
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'))
    }

    reader.readAsArrayBuffer(file)
  })
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}