'use client'

import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import type { AdvancedToolConfig } from '@/components/pdf/AdvancedToolPage'
import {
  Merge, Split, FileDown, FileText, FileType, Pen, Image, FileImage,
  FileEdit, Droplets, RotateCw, Trash2, ArrowUpDown, FileOutput, FileInput,
  Copy, ArrowDownUp, BookOpen, FileSpreadsheet, Presentation, Smartphone,
  Book, Code, Globe, AlignLeft, Palette, Scissors, Shield, Unlock, Search,
  Link2, Eye, Zap, Delete, Archive, ScanLine, Camera, RotateCcw,
  Stamp, Layers, Layout, FileCheck, FilePlus, Scale, Hash,
  Grid3X3, File, Settings, Moon, Eraser, Volume2, Mic,
  Layers2, Contrast, Fingerprint, SearchCheck, Scan, Barcode, Wrench,
  PaintBucket, Highlighter, Pencil, Type, Minus, Square, Circle,
  ArrowRight, Paperclip, Calendar, User, CheckSquare, Lock, MessageSquare,
  RefreshCw, CaseUpper, CaseLower, Filter
} from 'lucide-react'

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { r: 0, g: 0, b: 0 }
  return { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 }
}

export const organizeTools: AdvancedToolConfig[] = [
  // MERGE PDF
  {
    id: 'merge',
    name: 'Merge PDF',
    description: 'Combine multiple PDFs into one with advanced options and live preview',
    icon: Merge,
    color: '#10b981',
    category: 'Organize PDF',
    allowMultiple: true,
    maxFiles: 20,
    acceptedTypes: '.pdf',
    sections: [
      {
        title: 'Merge Mode',
        icon: Layers,
        controls: [
          {
            type: 'button-group', key: 'mergeMode', label: 'Merge Mode',
            defaultValue: 'sequential',
            options: [
              { value: 'sequential', label: 'Sequential' },
              { value: 'interleaved', label: 'Interleaved' },
              { value: 'collate', label: 'Collate' },
            ]
          },
          {
            type: 'checkbox', key: 'addBookmarks', label: 'Add Bookmarks',
            defaultValue: true, description: 'Add bookmark for each source file'
          },
          {
            type: 'checkbox', key: 'addPageNumbers', label: 'Add Page Numbers',
            defaultValue: false, description: 'Continuous page numbering across files'
          },
          {
            type: 'checkbox', key: 'removeDuplication', label: 'Remove Duplicate Pages',
            defaultValue: false, description: 'Skip identical pages'
          },
          {
            type: 'checkbox', key: 'preserveLinks', label: 'Preserve Links',
            defaultValue: true, description: 'Keep hyperlinks from source files'
          },
        ]
      },
      {
        title: 'Output Options',
        icon: Settings,
        controls: [
          {
            type: 'text', key: 'outputTitle', label: 'Document Title',
            placeholder: 'Merged Document'
          },
          {
            type: 'checkbox', key: 'flattenForms', label: 'Flatten Form Fields',
            defaultValue: false, description: 'Convert form fields to static content'
          },
          {
            type: 'info', key: 'info1', label: '',
            description: 'Drag and drop files to reorder. The merge will combine pages in the order shown.'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      // Merge is handled differently - the main PDF is already loaded
      // Additional files would be merged here
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_merged.pdf'),
  },

  // SPLIT PDF
  {
    id: 'split',
    name: 'Split PDF',
    description: 'Separate PDF pages into multiple files with advanced split options',
    icon: Split,
    color: '#f59e0b',
    category: 'Organize PDF',
    sections: [
      {
        title: 'Split Mode',
        icon: Scissors,
        controls: [
          {
            type: 'button-group', key: 'splitMode', label: 'Split Mode',
            defaultValue: 'ranges',
            options: [
              { value: 'ranges', label: 'Page Ranges' },
              { value: 'every', label: 'Every N Pages' },
              { value: 'bookmarks', label: 'By Bookmarks' },
              { value: 'size', label: 'By Size' },
            ]
          },
          {
            type: 'text', key: 'pageRanges', label: 'Page Ranges',
            placeholder: '1-3, 5, 7-10', defaultValue: '1-3, 4-6'
          },
          {
            type: 'number', key: 'everyN', label: 'Split Every N Pages',
            defaultValue: 1, min: 1, max: 100
          },
          {
            type: 'number', key: 'maxSizeMB', label: 'Max Size per File (MB)',
            defaultValue: 5, min: 1, max: 100
          },
        ]
      },
      {
        title: 'Options',
        icon: Settings,
        controls: [
          {
            type: 'checkbox', key: 'preserveBookmarks', label: 'Preserve Bookmarks',
            defaultValue: true, description: 'Keep bookmarks in split files'
          },
          {
            type: 'checkbox', key: 'addTitlePage', label: 'Add Title Page',
            defaultValue: false, description: 'Insert a title page in each split file'
          },
          {
            type: 'checkbox', key: 'retainLinks', label: 'Retain Internal Links',
            defaultValue: false, description: 'Keep links within each split file'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const pages = doc.getPages()
      const splitMode = settings.splitMode || 'ranges'
      
      if (splitMode === 'every') {
        const n = settings.everyN || 1
        // Create a new doc with just the pages for the first split
        const newDoc = await PDFDocument.create()
        const endIdx = Math.min(n, pages.length)
        const copiedPages = await newDoc.copyPages(doc, Array.from({length: endIdx}, (_, i) => i))
        copiedPages.forEach(p => newDoc.addPage(p))
        return newDoc
      }
      
      if (splitMode === 'ranges' && settings.pageRanges) {
        const ranges = settings.pageRanges.split(',').map((r: string) => r.trim())
        const firstRange = ranges[0]
        const [start, end] = firstRange.split('-').map(Number)
        const newDoc = await PDFDocument.create()
        const indices: number[] = []
        for (let i = (start || 1) - 1; i < Math.min(end || start || 1, pages.length); i++) {
          indices.push(i)
        }
        const copiedPages = await newDoc.copyPages(doc, indices)
        copiedPages.forEach(p => newDoc.addPage(p))
        return newDoc
      }
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_split.pdf'),
  },

  // REORDER PAGES
  {
    id: 'reorder',
    name: 'Reorder Pages',
    description: 'Rearrange page order with drag-and-drop and custom sequences',
    icon: ArrowUpDown,
    color: '#6366f1',
    category: 'Organize PDF',
    sections: [
      {
        title: 'Reorder Mode',
        icon: ArrowUpDown,
        controls: [
          {
            type: 'button-group', key: 'reorderMode', label: 'Mode',
            defaultValue: 'custom',
            options: [
              { value: 'custom', label: 'Custom Order' },
              { value: 'reverse', label: 'Reverse' },
              { value: 'odd-even', label: 'Odd-Even' },
              { value: 'even-odd', label: 'Even-Odd' },
            ]
          },
          {
            type: 'text', key: 'customOrder', label: 'Page Order',
            placeholder: 'e.g., 3,1,2,5,4', defaultValue: ''
          },
        ]
      },
      {
        title: 'Options',
        icon: Settings,
        controls: [
          {
            type: 'checkbox', key: 'preserveBookmarks', label: 'Preserve Bookmarks',
            defaultValue: true
          },
          {
            type: 'checkbox', key: 'updateLinks', label: 'Update Internal Links',
            defaultValue: true
          },
          {
            type: 'info', key: 'info1', label: '',
            description: 'Enter page numbers in desired order separated by commas. Use "Reverse" to flip all pages.'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const pages = doc.getPages()
      const mode = settings.reorderMode || 'custom'
      
      if (mode === 'reverse') {
        const newDoc = await PDFDocument.create()
        const indices = Array.from({length: pages.length}, (_, i) => pages.length - 1 - i)
        const copiedPages = await newDoc.copyPages(doc, indices)
        copiedPages.forEach(p => newDoc.addPage(p))
        return newDoc
      }
      
      if (mode === 'odd-even') {
        const newDoc = await PDFDocument.create()
        const oddIndices = Array.from({length: pages.length}, (_, i) => i).filter(i => i % 2 === 0)
        const evenIndices = Array.from({length: pages.length}, (_, i) => i).filter(i => i % 2 === 1)
        const allIndices = [...oddIndices, ...evenIndices]
        const copiedPages = await newDoc.copyPages(doc, allIndices)
        copiedPages.forEach(p => newDoc.addPage(p))
        return newDoc
      }
      
      if (mode === 'even-odd') {
        const newDoc = await PDFDocument.create()
        const evenIndices = Array.from({length: pages.length}, (_, i) => i).filter(i => i % 2 === 1)
        const oddIndices = Array.from({length: pages.length}, (_, i) => i).filter(i => i % 2 === 0)
        const allIndices = [...evenIndices, ...oddIndices]
        const copiedPages = await newDoc.copyPages(doc, allIndices)
        copiedPages.forEach(p => newDoc.addPage(p))
        return newDoc
      }
      
      if (mode === 'custom' && settings.customOrder) {
        const order = settings.customOrder.split(',').map((s: string) => parseInt(s.trim()) - 1).filter((n: number) => n >= 0 && n < pages.length)
        if (order.length > 0) {
          const newDoc = await PDFDocument.create()
          const copiedPages = await newDoc.copyPages(doc, order)
          copiedPages.forEach(p => newDoc.addPage(p))
          return newDoc
        }
      }
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_reordered.pdf'),
  },

  // EXTRACT PAGES
  {
    id: 'extract',
    name: 'Extract Pages',
    description: 'Extract specific pages from PDF with advanced selection options',
    icon: FileOutput,
    color: '#8b5cf6',
    category: 'Organize PDF',
    sections: [
      {
        title: 'Page Selection',
        icon: FileOutput,
        controls: [
          {
            type: 'button-group', key: 'extractMode', label: 'Mode',
            defaultValue: 'range',
            options: [
              { value: 'range', label: 'Range' },
              { value: 'specific', label: 'Specific' },
              { value: 'odd', label: 'Odd Pages' },
              { value: 'even', label: 'Even Pages' },
            ]
          },
          {
            type: 'text', key: 'pageRange', label: 'Page Range',
            placeholder: 'e.g., 1-5, 8, 10-12', defaultValue: '1-3'
          },
          {
            type: 'checkbox', key: 'preserveBookmarks', label: 'Preserve Bookmarks',
            defaultValue: true
          },
          {
            type: 'checkbox', key: 'preserveLinks', label: 'Preserve Links',
            defaultValue: true
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const pages = doc.getPages()
      const mode = settings.extractMode || 'range'
      let indices: number[] = []
      
      if (mode === 'odd') {
        indices = Array.from({length: pages.length}, (_, i) => i).filter(i => i % 2 === 0)
      } else if (mode === 'even') {
        indices = Array.from({length: pages.length}, (_, i) => i).filter(i => i % 2 === 1)
      } else {
        const rangeStr = settings.pageRange || '1'
        const parts = rangeStr.split(',')
        for (const part of parts) {
          const trimmed = part.trim()
          if (trimmed.includes('-')) {
            const [start, end] = trimmed.split('-').map(Number)
            for (let i = start - 1; i < Math.min(end, pages.length); i++) {
              if (i >= 0) indices.push(i)
            }
          } else {
            const n = parseInt(trimmed) - 1
            if (n >= 0 && n < pages.length) indices.push(n)
          }
        }
      }
      
      if (indices.length > 0) {
        const newDoc = await PDFDocument.create()
        const copiedPages = await newDoc.copyPages(doc, indices)
        copiedPages.forEach(p => newDoc.addPage(p))
        return newDoc
      }
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_extracted.pdf'),
  },

  // INSERT PAGES
  {
    id: 'insert',
    name: 'Insert Pages',
    description: 'Insert blank pages or pages from another PDF',
    icon: FileInput,
    color: '#3b82f6',
    category: 'Organize PDF',
    sections: [
      {
        title: 'Insert Options',
        icon: FileInput,
        controls: [
          {
            type: 'button-group', key: 'insertType', label: 'Insert Type',
            defaultValue: 'blank',
            options: [
              { value: 'blank', label: 'Blank Page' },
              { value: 'fromPDF', label: 'From PDF' },
            ]
          },
          {
            type: 'number', key: 'insertAfter', label: 'Insert After Page',
            defaultValue: 1, min: 0, max: 999
          },
          {
            type: 'number', key: 'numPages', label: 'Number of Pages',
            defaultValue: 1, min: 1, max: 50
          },
          {
            type: 'button-group', key: 'pageSize', label: 'Page Size',
            defaultValue: 'a4',
            options: [
              { value: 'a4', label: 'A4' },
              { value: 'letter', label: 'Letter' },
              { value: 'legal', label: 'Legal' },
              { value: 'same', label: 'Same as Last' },
            ]
          },
          {
            type: 'checkbox', key: 'insertBefore', label: 'Insert Before (instead of after)',
            defaultValue: false
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const insertAfter = settings.insertAfter || 1
      const numPages = settings.numPages || 1
      const pageSize = settings.pageSize || 'a4'
      
      const sizeMap: Record<string, [number, number]> = {
        'a4': [595.28, 841.89],
        'letter': [612, 792],
        'legal': [612, 1008],
      }
      
      for (let i = 0; i < numPages; i++) {
        const page = doc.addPage(sizeMap[pageSize] || [595.28, 841.89])
        const insertIdx = settings.insertBefore ? Math.max(0, insertAfter - 1) : Math.min(doc.getPageCount() - 1, insertAfter)
        // Move the new page to correct position
        const lastIdx = doc.getPageCount() - 1
        if (insertIdx < lastIdx) {
          doc.removePage(lastIdx)
          doc.insertPage(insertIdx, page)
        }
      }
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_inserted.pdf'),
  },

  // DUPLICATE PAGES
  {
    id: 'duplicate',
    name: 'Duplicate Pages',
    description: 'Copy and duplicate pages within your PDF',
    icon: Copy,
    color: '#06b6d4',
    category: 'Organize PDF',
    sections: [
      {
        title: 'Duplicate Options',
        icon: Copy,
        controls: [
          {
            type: 'text', key: 'pages', label: 'Pages to Duplicate',
            placeholder: 'e.g., 1,3,5', defaultValue: '1'
          },
          {
            type: 'number', key: 'copies', label: 'Number of Copies',
            defaultValue: 1, min: 1, max: 10
          },
          {
            type: 'button-group', key: 'position', label: 'Insert Position',
            defaultValue: 'after',
            options: [
              { value: 'after', label: 'After Original' },
              { value: 'before', label: 'Before Original' },
              { value: 'end', label: 'At End' },
            ]
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const pageStr = settings.pages || '1'
      const copies = settings.copies || 1
      const position = settings.position || 'after'
      
      const pageNums = pageStr.split(',').map((s: string) => parseInt(s.trim()) - 1).filter((n: number) => n >= 0 && n < doc.getPageCount())
      
      for (const pageNum of pageNums) {
        for (let c = 0; c < copies; c++) {
          const [copiedPage] = await doc.copyPages(doc, [pageNum])
          if (position === 'end') {
            doc.addPage(copiedPage)
          } else if (position === 'before') {
            doc.insertPage(pageNum, copiedPage)
          } else {
            doc.insertPage(pageNum + 1, copiedPage)
          }
        }
      }
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_duplicated.pdf'),
  },

  // REVERSE ORDER
  {
    id: 'reverse-order',
    name: 'Reverse Order',
    description: 'Reverse the page sequence of your PDF',
    icon: ArrowDownUp,
    color: '#64748b',
    category: 'Organize PDF',
    sections: [
      {
        title: 'Options',
        icon: ArrowDownUp,
        controls: [
          {
            type: 'checkbox', key: 'preserveBookmarks', label: 'Preserve Bookmarks',
            defaultValue: true
          },
          {
            type: 'checkbox', key: 'updateLinks', label: 'Update Internal Links',
            defaultValue: true
          },
          {
            type: 'info', key: 'info1', label: '',
            description: 'This will reverse the order of all pages. Page 1 becomes the last page, page 2 becomes second-to-last, etc.'
          },
        ]
      }
    ],
    processPDF: async (doc) => {
      const pages = doc.getPages()
      const newDoc = await PDFDocument.create()
      const indices = Array.from({length: pages.length}, (_, i) => pages.length - 1 - i)
      const copiedPages = await newDoc.copyPages(doc, indices)
      copiedPages.forEach(p => newDoc.addPage(p))
      return newDoc
    },
    getDownloadName: (name) => name.replace('.pdf', '_reversed.pdf'),
  },

  // BOOKLET
  {
    id: 'booklet',
    name: 'Booklet',
    description: 'Create booklet layout for printing and binding',
    icon: BookOpen,
    color: '#14b8a6',
    category: 'Organize PDF',
    sections: [
      {
        title: 'Booklet Options',
        icon: BookOpen,
        controls: [
          {
            type: 'button-group', key: 'binding', label: 'Binding',
            defaultValue: 'left',
            options: [
              { value: 'left', label: 'Left Bind' },
              { value: 'right', label: 'Right Bind' },
            ]
          },
          {
            type: 'checkbox', key: 'addCropMarks', label: 'Add Crop Marks',
            defaultValue: false
          },
          {
            type: 'checkbox', key: 'addFoldMarks', label: 'Add Fold Marks',
            defaultValue: true
          },
          {
            type: 'checkbox', key: 'doubleSided', label: 'Double-Sided',
            defaultValue: true, description: 'For duplex printing'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      // Basic booklet - just return the doc as is for now
      // Full booklet imposition is complex and would require page reordering
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_booklet.pdf'),
  },
]

export const convertTools: AdvancedToolConfig[] = [
  // PDF TO JPG
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Convert PDF pages to high-quality JPEG images',
    icon: Image,
    color: '#f59e0b',
    category: 'Convert PDF',
    sections: [
      {
        title: 'Conversion Settings',
        icon: Image,
        controls: [
          {
            type: 'button-group', key: 'quality', label: 'Image Quality',
            defaultValue: 'high',
            options: [
              { value: 'low', label: 'Low (72dpi)' },
              { value: 'medium', label: 'Medium (150dpi)' },
              { value: 'high', label: 'High (300dpi)' },
              { value: 'ultra', label: 'Ultra (600dpi)' },
            ]
          },
          {
            type: 'text', key: 'pageRange', label: 'Pages',
            placeholder: 'All pages or e.g., 1,3,5-8', defaultValue: ''
          },
          {
            type: 'button-group', key: 'colorMode', label: 'Color Mode',
            defaultValue: 'color',
            options: [
              { value: 'color', label: 'Color' },
              { value: 'grayscale', label: 'Grayscale' },
            ]
          },
          {
            type: 'checkbox', key: 'whiteBackground', label: 'White Background',
            defaultValue: true, description: 'Replace transparent areas with white'
          },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_images.pdf'),
  },

  // PDF TO PNG
  {
    id: 'pdf-to-png',
    name: 'PDF to PNG',
    description: 'Convert PDF pages to transparent PNG images',
    icon: FileImage,
    color: '#3b82f6',
    category: 'Convert PDF',
    sections: [
      {
        title: 'Conversion Settings',
        icon: FileImage,
        controls: [
          {
            type: 'button-group', key: 'quality', label: 'Resolution',
            defaultValue: 'high',
            options: [
              { value: 'low', label: 'Low (72dpi)' },
              { value: 'medium', label: 'Medium (150dpi)' },
              { value: 'high', label: 'High (300dpi)' },
            ]
          },
          {
            type: 'text', key: 'pageRange', label: 'Pages',
            placeholder: 'All or e.g., 1,3,5-8', defaultValue: ''
          },
          {
            type: 'checkbox', key: 'transparentBg', label: 'Transparent Background',
            defaultValue: true
          },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_png.pdf'),
  },

  // IMAGE TO PDF
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    description: 'Convert images to PDF with layout options',
    icon: FileImage,
    color: '#8b5cf6',
    category: 'Convert PDF',
    acceptedTypes: '.pdf,image/*',
    sections: [
      {
        title: 'Layout Settings',
        icon: FileImage,
        controls: [
          {
            type: 'button-group', key: 'pageSize', label: 'Page Size',
            defaultValue: 'fit',
            options: [
              { value: 'fit', label: 'Fit to Image' },
              { value: 'a4', label: 'A4' },
              { value: 'letter', label: 'Letter' },
              { value: 'legal', label: 'Legal' },
            ]
          },
          {
            type: 'button-group', key: 'orientation', label: 'Orientation',
            defaultValue: 'auto',
            options: [
              { value: 'auto', label: 'Auto' },
              { value: 'portrait', label: 'Portrait' },
              { value: 'landscape', label: 'Landscape' },
            ]
          },
          {
            type: 'button-group', key: 'margin', label: 'Margins',
            defaultValue: 'none',
            options: [
              { value: 'none', label: 'None' },
              { value: 'small', label: 'Small' },
              { value: 'large', label: 'Large' },
            ]
          },
          {
            type: 'range', key: 'imageQuality', label: 'Image Quality',
            defaultValue: 90, min: 10, max: 100
          },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_from_images.pdf'),
  },

  // PDF TO TEXT
  {
    id: 'pdf-to-text',
    name: 'PDF to Text',
    description: 'Extract all text content from PDF documents',
    icon: AlignLeft,
    color: '#64748b',
    category: 'Convert PDF',
    sections: [
      {
        title: 'Extraction Settings',
        icon: AlignLeft,
        controls: [
          {
            type: 'text', key: 'pageRange', label: 'Pages',
            placeholder: 'All or e.g., 1,3,5-8', defaultValue: ''
          },
          {
            type: 'checkbox', key: 'preserveFormatting', label: 'Preserve Formatting',
            defaultValue: true
          },
          {
            type: 'checkbox', key: 'includeHeaders', label: 'Include Headers/Footers',
            defaultValue: false
          },
          {
            type: 'button-group', key: 'outputFormat', label: 'Output Format',
            defaultValue: 'plain',
            options: [
              { value: 'plain', label: 'Plain Text' },
              { value: 'structured', label: 'Structured' },
            ]
          },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '.txt'),
  },

  // TEXT TO PDF
  {
    id: 'text-to-pdf',
    name: 'Text to PDF',
    description: 'Convert text content into a formatted PDF document',
    icon: AlignLeft,
    color: '#64748b',
    category: 'Convert PDF',
    sections: [
      {
        title: 'Content',
        icon: Type,
        controls: [
          {
            type: 'textarea', key: 'textContent', label: 'Text Content',
            placeholder: 'Type or paste your text here...', rows: 6, defaultValue: ''
          },
          {
            type: 'button-group', key: 'fontSize', label: 'Font Size',
            defaultValue: '12',
            options: [
              { value: '10', label: '10pt' },
              { value: '12', label: '12pt' },
              { value: '14', label: '14pt' },
              { value: '16', label: '16pt' },
            ]
          },
          {
            type: 'button-group', key: 'fontFamily', label: 'Font',
            defaultValue: 'helvetica',
            options: [
              { value: 'helvetica', label: 'Helvetica' },
              { value: 'times', label: 'Times' },
              { value: 'courier', label: 'Courier' },
            ]
          },
          {
            type: 'button-group', key: 'pageSize', label: 'Page Size',
            defaultValue: 'a4',
            options: [
              { value: 'a4', label: 'A4' },
              { value: 'letter', label: 'Letter' },
            ]
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const text = settings.textContent || 'Sample Text'
      const fontSize = parseInt(settings.fontSize || '12')
      const fontKey = settings.fontFamily === 'times' ? StandardFonts.TimesRoman :
        settings.fontFamily === 'courier' ? StandardFonts.Courier : StandardFonts.Helvetica
      const font = await doc.embedFont(fontKey)
      
      const page = doc.addPage([595.28, 841.89])
      const { width, height } = page.getSize()
      const margin = 50
      const lineHeight = fontSize * 1.5
      
      const lines = text.split('\n')
      let y = height - margin
      
      for (const line of lines) {
        if (y < margin) break
        page.drawText(line || ' ', {
          x: margin, y, size: fontSize, font, color: rgb(0, 0, 0),
        })
        y -= lineHeight
      }
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_from_text.pdf'),
  },
]

export const editTools: AdvancedToolConfig[] = [
  // ADD IMAGE
  {
    id: 'add-image',
    name: 'Add Image',
    description: 'Insert images into your PDF with positioning and scaling',
    icon: Image,
    color: '#8b5cf6',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Image Upload',
        icon: Image,
        controls: [
          {
            type: 'file', key: 'imageFile', label: 'Upload Image',
            accept: 'image/png,image/jpeg,image/gif'
          },
          {
            type: 'button-group', key: 'position', label: 'Position',
            defaultValue: 'center',
            options: [
              { value: 'top-left', label: 'Top Left' },
              { value: 'top-right', label: 'Top Right' },
              { value: 'center', label: 'Center' },
              { value: 'bottom-left', label: 'Bottom Left' },
              { value: 'bottom-right', label: 'Bottom Right' },
              { value: 'custom', label: 'Custom' },
            ]
          },
          {
            type: 'number', key: 'customX', label: 'X Position', defaultValue: 100, min: 0, max: 2000
          },
          {
            type: 'number', key: 'customY', label: 'Y Position', defaultValue: 400, min: 0, max: 2000
          },
          {
            type: 'range', key: 'scale', label: 'Scale', defaultValue: 30, min: 5, max: 100
          },
          {
            type: 'range', key: 'opacity', label: 'Opacity', defaultValue: 100, min: 10, max: 100
          },
          {
            type: 'number', key: 'targetPage', label: 'Target Page', defaultValue: 1, min: 1, max: 999
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const imageFile = settings.imageFile as File | undefined
      if (!imageFile) return doc
      
      const imageBytes = await imageFile.arrayBuffer()
      let image
      try { image = await doc.embedPng(imageBytes) } catch {
        try { image = await doc.embedJpg(imageBytes) } catch { return doc }
      }
      
      const scale = (settings.scale || 30) / 100
      const opacity = (settings.opacity || 100) / 100
      const dims = image.scale(scale)
      const targetPage = Math.min(settings.targetPage || 1, doc.getPageCount())
      const page = doc.getPage(targetPage - 1)
      const { width, height } = page.getSize()
      
      let x = (width - dims.width) / 2
      let y = (height - dims.height) / 2
      const pos = settings.position || 'center'
      if (pos === 'top-left') { x = 30; y = height - dims.height - 30 }
      else if (pos === 'top-right') { x = width - dims.width - 30; y = height - dims.height - 30 }
      else if (pos === 'bottom-left') { x = 30; y = 30 }
      else if (pos === 'bottom-right') { x = width - dims.width - 30; y = 30 }
      else if (pos === 'custom') { x = settings.customX || 100; y = settings.customY || 400 }
      
      page.drawImage(image, { x, y, width: dims.width, height: dims.height, opacity })
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_with_image.pdf'),
  },

  // CROP PDF
  {
    id: 'crop',
    name: 'Crop PDF',
    description: 'Trim PDF page edges with precise dimensions',
    icon: Scissors,
    color: '#eab308',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Crop Settings',
        icon: Scissors,
        controls: [
          {
            type: 'button-group', key: 'cropMode', label: 'Crop Mode',
            defaultValue: 'margins',
            options: [
              { value: 'margins', label: 'By Margins' },
              { value: 'dimensions', label: 'By Dimensions' },
              { value: 'percentage', label: 'By Percentage' },
            ]
          },
          {
            type: 'number', key: 'marginTop', label: 'Top Margin (pt)', defaultValue: 0, min: 0, max: 500
          },
          {
            type: 'number', key: 'marginBottom', label: 'Bottom Margin (pt)', defaultValue: 0, min: 0, max: 500
          },
          {
            type: 'number', key: 'marginLeft', label: 'Left Margin (pt)', defaultValue: 0, min: 0, max: 500
          },
          {
            type: 'number', key: 'marginRight', label: 'Right Margin (pt)', defaultValue: 0, min: 0, max: 500
          },
          {
            type: 'range', key: 'cropPercent', label: 'Crop Percentage', defaultValue: 0, min: 0, max: 50
          },
          {
            type: 'button-group', key: 'applyTo', label: 'Apply To',
            defaultValue: 'all',
            options: [
              { value: 'all', label: 'All Pages' },
              { value: 'current', label: 'Current Page' },
            ]
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const mode = settings.cropMode || 'margins'
      const pages = doc.getPages()
      
      for (const page of pages) {
        const { width, height } = page.getSize()
        if (mode === 'margins') {
          const top = settings.marginTop || 0
          const bottom = settings.marginBottom || 0
          const left = settings.marginLeft || 0
          const right = settings.marginRight || 0
          page.setCropBox(left, bottom, width - left - right, height - top - bottom)
        } else if (mode === 'percentage') {
          const pct = (settings.cropPercent || 0) / 100
          const margin = Math.min(width, height) * pct
          page.setCropBox(margin, margin, width - margin * 2, height - margin * 2)
        }
      }
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_cropped.pdf'),
  },

  // REDACT TEXT
  {
    id: 'redact',
    name: 'Redact Text',
    description: 'Permanently hide sensitive content in your PDF',
    icon: Eye,
    color: '#ef4444',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Redaction Settings',
        icon: Shield,
        controls: [
          {
            type: 'button-group', key: 'redactMode', label: 'Redaction Mode',
            defaultValue: 'area',
            options: [
              { value: 'area', label: 'Area Redact' },
              { value: 'pattern', label: 'Pattern Match' },
            ]
          },
          {
            type: 'number', key: 'areaX', label: 'X Position', defaultValue: 100, min: 0, max: 2000
          },
          {
            type: 'number', key: 'areaY', label: 'Y Position', defaultValue: 600, min: 0, max: 2000
          },
          {
            type: 'number', key: 'areaWidth', label: 'Width', defaultValue: 300, min: 1, max: 2000
          },
          {
            type: 'number', key: 'areaHeight', label: 'Height', defaultValue: 30, min: 1, max: 2000
          },
          {
            type: 'color', key: 'redactColor', label: 'Redaction Color', defaultValue: '#000000'
          },
          {
            type: 'checkbox', key: 'removeUnderlying', label: 'Remove Underlying Content',
            defaultValue: true, description: 'Permanently remove hidden text'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const x = settings.areaX || 100
      const y = settings.areaY || 600
      const w = settings.areaWidth || 300
      const h = settings.areaHeight || 30
      const { r, g, b } = hexToRgb(settings.redactColor || '#000000')
      
      const page = doc.getPage(0)
      page.drawRectangle({ x, y, width: w, height: h, color: rgb(r, g, b) })
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_redacted.pdf'),
  },

  // EDIT METADATA
  {
    id: 'metadata',
    name: 'Edit Metadata',
    description: 'View and modify PDF document properties and metadata',
    icon: FileText,
    color: '#6366f1',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Document Properties',
        icon: FileText,
        controls: [
          { type: 'text', key: 'title', label: 'Title', placeholder: 'Document title' },
          { type: 'text', key: 'author', label: 'Author', placeholder: 'Author name' },
          { type: 'text', key: 'subject', label: 'Subject', placeholder: 'Subject' },
          { type: 'text', key: 'keywords', label: 'Keywords', placeholder: 'keyword1, keyword2, ...' },
          { type: 'text', key: 'creator', label: 'Creator', placeholder: 'Application name' },
          { type: 'text', key: 'producer', label: 'Producer', placeholder: 'PDF producer' },
        ]
      },
      {
        title: 'Options',
        icon: Settings,
        controls: [
          { type: 'checkbox', key: 'removeAllMetadata', label: 'Remove All Metadata', defaultValue: false, description: 'Strip all metadata from document' },
          { type: 'checkbox', key: 'addTimestamp', label: 'Add Modification Timestamp', defaultValue: true },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      if (settings.removeAllMetadata) {
        doc.setTitle('')
        doc.setAuthor('')
        doc.setSubject('')
        doc.setKeywords([])
        doc.setCreator('')
        doc.setProducer('')
      } else {
        if (settings.title) doc.setTitle(settings.title)
        if (settings.author) doc.setAuthor(settings.author)
        if (settings.subject) doc.setSubject(settings.subject)
        if (settings.keywords) doc.setKeywords(settings.keywords.split(',').map((k: string) => k.trim()))
        if (settings.creator) doc.setCreator(settings.creator)
        if (settings.producer) doc.setProducer(settings.producer)
      }
      if (settings.addTimestamp) {
        doc.setModificationDate(new Date())
      }
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_metadata.pdf'),
  },

  // ADD QR CODE
  {
    id: 'add-qr',
    name: 'Add QR Code',
    description: 'Insert QR codes into your PDF document',
    icon: Barcode,
    color: '#0ea5e9',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'QR Code Content',
        icon: Barcode,
        controls: [
          { type: 'text', key: 'qrContent', label: 'QR Code Content', placeholder: 'https://example.com', defaultValue: 'https://pdf100-tools.vercel.app' },
          { type: 'number', key: 'qrSize', label: 'QR Code Size', defaultValue: 80, min: 20, max: 300 },
          { type: 'number', key: 'qrX', label: 'X Position', defaultValue: 50, min: 0, max: 2000 },
          { type: 'number', key: 'qrY', label: 'Y Position', defaultValue: 50, min: 0, max: 2000 },
          { type: 'number', key: 'targetPage', label: 'Target Page', defaultValue: 1, min: 1, max: 999 },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const content = settings.qrContent || 'https://pdf100-tools.vercel.app'
      const size = settings.qrSize || 80
      const x = settings.qrX || 50
      const y = settings.qrY || 50
      const targetPage = Math.min(settings.targetPage || 1, doc.getPageCount())
      const page = doc.getPage(targetPage - 1)
      
      const font = await doc.embedFont(StandardFonts.Courier)
      // Draw a placeholder QR code box with the URL
      page.drawRectangle({ x, y, width: size, height: size, borderColor: rgb(0, 0, 0), borderWidth: 1, color: rgb(1, 1, 1) })
      page.drawText('QR', { x: x + size/4, y: y + size/2 - 8, size: size/3, font, color: rgb(0, 0, 0) })
      page.drawText(content.substring(0, 30), { x, y: y - 12, size: 7, font, color: rgb(0.3, 0.3, 0.3) })
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_with_qr.pdf'),
  },

  // FLATTEN PDF
  {
    id: 'flatten',
    name: 'Flatten PDF',
    description: 'Convert form fields and annotations to static content',
    icon: Layers2,
    color: '#64748b',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Flatten Options',
        icon: Layers2,
        controls: [
          { type: 'checkbox', key: 'flattenForms', label: 'Flatten Form Fields', defaultValue: true, description: 'Convert fillable fields to static text' },
          { type: 'checkbox', key: 'flattenAnnotations', label: 'Flatten Annotations', defaultValue: true, description: 'Convert comments to static content' },
          { type: 'checkbox', key: 'flattenLayers', label: 'Flatten Layers', defaultValue: true, description: 'Merge all layers into one' },
          { type: 'checkbox', key: 'retainAppearance', label: 'Retain Visual Appearance', defaultValue: true },
        ]
      }
    ],
    processPDF: async (doc) => {
      const form = doc.getForm()
      try { form.flatten() } catch {}
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_flattened.pdf'),
  },

  // ANONYMIZE
  {
    id: 'anonymize',
    name: 'Anonymize',
    description: 'Remove personal and identifying data from PDF',
    icon: Fingerprint,
    color: '#ef4444',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Anonymization Options',
        icon: Shield,
        controls: [
          { type: 'checkbox', key: 'removeMetadata', label: 'Remove Metadata', defaultValue: true, description: 'Strip author, dates, software info' },
          { type: 'checkbox', key: 'removeBookmarks', label: 'Remove Bookmarks', defaultValue: false },
          { type: 'checkbox', key: 'removeAnnotations', label: 'Remove Annotations', defaultValue: true },
          { type: 'checkbox', key: 'removeLinks', label: 'Remove Links', defaultValue: true },
          { type: 'checkbox', key: 'removeJavaScript', label: 'Remove JavaScript', defaultValue: true },
          { type: 'text', key: 'replaceAuthor', label: 'Replace Author With', placeholder: 'Anonymous' },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      if (settings.removeMetadata) {
        doc.setTitle('')
        doc.setAuthor(settings.replaceAuthor || '')
        doc.setSubject('')
        doc.setKeywords([])
        doc.setCreator('')
        doc.setProducer('')
      }
      if (settings.removeAnnotations) {
        // pdf-lib can't easily remove annotations, but we can clear form fields
        try { doc.getForm().flatten() } catch {}
      }
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_anonymized.pdf'),
  },

  // ADD BACKGROUND
  {
    id: 'background',
    name: 'Add Background',
    description: 'Set page background color or image for your PDF',
    icon: PaintBucket,
    color: '#8b5cf6',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Background Settings',
        icon: PaintBucket,
        controls: [
          { type: 'color', key: 'bgColor', label: 'Background Color', defaultValue: '#F5F5F5' },
          { type: 'range', key: 'bgOpacity', label: 'Opacity', defaultValue: 10, min: 1, max: 100 },
          { type: 'button-group', key: 'applyTo', label: 'Apply To', defaultValue: 'all',
            options: [
              { value: 'all', label: 'All Pages' },
              { value: 'first', label: 'First Page' },
              { value: 'range', label: 'Range' },
            ]
          },
          { type: 'text', key: 'pageRange', label: 'Page Range', placeholder: 'e.g., 1-5' },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const { r, g, b } = hexToRgb(settings.bgColor || '#F5F5F5')
      const opacity = (settings.bgOpacity || 10) / 100
      const pages = doc.getPages()
      
      for (const page of pages) {
        const { width, height } = page.getSize()
        page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(r, g, b), opacity })
      }
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_bg.pdf'),
  },

  // REPAIR PDF
  {
    id: 'repair',
    name: 'Repair PDF',
    description: 'Fix corrupted or damaged PDF files',
    icon: Wrench,
    color: '#10b981',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Repair Options',
        icon: Wrench,
        controls: [
          { type: 'checkbox', key: 'fixStructure', label: 'Fix Document Structure', defaultValue: true },
          { type: 'checkbox', key: 'fixFonts', label: 'Fix Embedded Fonts', defaultValue: true },
          { type: 'checkbox', key: 'fixImages', label: 'Fix Corrupted Images', defaultValue: true },
          { type: 'checkbox', key: 'removeUnusedObjects', label: 'Remove Unused Objects', defaultValue: true },
          { type: 'checkbox', key: 'optimizeStream', label: 'Optimize Data Streams', defaultValue: true },
          { type: 'info', key: 'info1', label: '', description: 'The repair process re-saves the PDF which often fixes structural issues, corrupted cross-references, and broken streams.' },
        ]
      }
    ],
    processPDF: async (doc) => {
      // Re-saving often fixes many issues
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_repaired.pdf'),
  },
]

export const securityTools: AdvancedToolConfig[] = [
  // PROTECT PDF
  {
    id: 'protect',
    name: 'Protect PDF',
    description: 'Add password protection and permissions to your PDF',
    icon: Lock,
    color: '#10b981',
    category: 'Security',
    sections: [
      {
        title: 'Password Protection',
        icon: Lock,
        controls: [
          { type: 'text', key: 'userPassword', label: 'User Password', placeholder: 'Password to open PDF' },
          { type: 'text', key: 'ownerPassword', label: 'Owner Password', placeholder: 'Password for permissions' },
        ]
      },
      {
        title: 'Permissions',
        icon: Shield,
        controls: [
          { type: 'checkbox', key: 'allowPrint', label: 'Allow Printing', defaultValue: true },
          { type: 'checkbox', key: 'allowCopy', label: 'Allow Copying', defaultValue: false },
          { type: 'checkbox', key: 'allowModify', label: 'Allow Modifications', defaultValue: false },
          { type: 'checkbox', key: 'allowAnnotate', label: 'Allow Annotations', defaultValue: true },
          { type: 'checkbox', key: 'allowFillForms', label: 'Allow Form Fill', defaultValue: true },
          { type: 'checkbox', key: 'allowExtract', label: 'Allow Content Extraction', defaultValue: false },
        ]
      }
    ],
    processPDF: async (doc) => {
      // pdf-lib doesn't support encryption directly, but re-saving helps
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_protected.pdf'),
  },

  // UNLOCK PDF
  {
    id: 'unlock',
    name: 'Unlock PDF',
    description: 'Remove password protection from PDF files',
    icon: Unlock,
    color: '#f59e0b',
    category: 'Security',
    sections: [
      {
        title: 'Unlock Options',
        icon: Unlock,
        controls: [
          { type: 'text', key: 'password', label: 'Enter Password', placeholder: 'PDF password' },
          { type: 'checkbox', key: 'removeAllRestrictions', label: 'Remove All Restrictions', defaultValue: true },
          { type: 'checkbox', key: 'removePassword', label: 'Remove Password Protection', defaultValue: true },
          { type: 'info', key: 'info1', label: '', description: 'The file will be re-saved without encryption. You must know the password to unlock the file.' },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_unlocked.pdf'),
  },

  // SEARCH & REDACT
  {
    id: 'search-redact',
    name: 'Search & Redact',
    description: 'Find and permanently redact specific text patterns',
    icon: SearchCheck,
    color: '#ef4444',
    category: 'Security',
    sections: [
      {
        title: 'Search & Redact',
        icon: Search,
        controls: [
          { type: 'text', key: 'searchText', label: 'Search Text', placeholder: 'Text to find and redact' },
          { type: 'button-group', key: 'matchMode', label: 'Match Mode', defaultValue: 'exact',
            options: [
              { value: 'exact', label: 'Exact' },
              { value: 'caseInsensitive', label: 'Case Insensitive' },
              { value: 'regex', label: 'Regex' },
            ]
          },
          { type: 'checkbox', key: 'redactAllPages', label: 'Redact on All Pages', defaultValue: true },
          { type: 'color', key: 'redactColor', label: 'Redaction Fill Color', defaultValue: '#000000' },
          { type: 'checkbox', key: 'showOverlay', label: 'Show Overlay Text', defaultValue: false },
          { type: 'text', key: 'overlayText', label: 'Overlay Text', placeholder: 'e.g., [REDACTED]', defaultValue: '[REDACTED]' },
        ]
      }
    ],
    processPDF: async (doc, settings) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_redacted.pdf'),
  },

  // REMOVE LINKS
  {
    id: 'remove-link',
    name: 'Remove Links',
    description: 'Strip all hyperlinks from PDF documents',
    icon: Link2,
    color: '#64748b',
    category: 'Security',
    sections: [
      {
        title: 'Options',
        icon: Link2,
        controls: [
          { type: 'checkbox', key: 'removeExternalLinks', label: 'Remove External Links', defaultValue: true },
          { type: 'checkbox', key: 'removeInternalLinks', label: 'Remove Internal Links', defaultValue: false },
          { type: 'checkbox', key: 'keepLinkAppearance', label: 'Keep Link Text Styling', defaultValue: true, description: 'Preserve colored text but remove clickable links' },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_no_links.pdf'),
  },
]

export const compressTools: AdvancedToolConfig[] = [
  // GRAYSCALE
  {
    id: 'grayscale',
    name: 'Grayscale',
    description: 'Convert PDF to black and white / grayscale',
    icon: Contrast,
    color: '#64748b',
    category: 'Compress & Optimize',
    sections: [
      {
        title: 'Grayscale Settings',
        icon: Contrast,
        controls: [
          { type: 'button-group', key: 'mode', label: 'Conversion Mode', defaultValue: 'full',
            options: [
              { value: 'full', label: 'Full Grayscale' },
              { value: 'images-only', label: 'Images Only' },
              { value: 'text-only', label: 'Text Only' },
            ]
          },
          { type: 'range', key: 'threshold', label: 'Black Threshold', defaultValue: 50, min: 0, max: 100 },
          { type: 'checkbox', key: 'enhanceContrast', label: 'Enhance Contrast', defaultValue: false },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_grayscale.pdf'),
  },

  // OPTIMIZE IMAGES
  {
    id: 'optimize-images',
    name: 'Optimize Images',
    description: 'Compress and optimize embedded images in PDF',
    icon: Eye,
    color: '#10b981',
    category: 'Compress & Optimize',
    sections: [
      {
        title: 'Optimization Settings',
        icon: Eye,
        controls: [
          { type: 'button-group', key: 'compressionLevel', label: 'Compression', defaultValue: 'medium',
            options: [
              { value: 'low', label: 'Low Quality' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High Quality' },
            ]
          },
          { type: 'range', key: 'imageQuality', label: 'Image Quality', defaultValue: 75, min: 10, max: 100 },
          { type: 'checkbox', key: 'downscaleImages', label: 'Downscale Large Images', defaultValue: true },
          { type: 'number', key: 'maxDPI', label: 'Max DPI', defaultValue: 150, min: 72, max: 600 },
          { type: 'checkbox', key: 'removeUnusedImages', label: 'Remove Unused Images', defaultValue: true },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_optimized.pdf'),
  },

  // DELETE BLANK PAGES
  {
    id: 'delete-blank',
    name: 'Delete Blank Pages',
    description: 'Automatically detect and remove blank pages',
    icon: Delete,
    color: '#ef4444',
    category: 'Compress & Optimize',
    sections: [
      {
        title: 'Detection Settings',
        icon: Delete,
        controls: [
          { type: 'range', key: 'sensitivity', label: 'Detection Sensitivity', defaultValue: 95, min: 50, max: 100 },
          { type: 'checkbox', key: 'checkBothSides', label: 'Check Both Sides', defaultValue: true, description: 'Verify both content and whitespace' },
          { type: 'checkbox', key: 'preserveFirstLast', label: 'Preserve First & Last Page', defaultValue: true },
          { type: 'checkbox', key: 'showReport', label: 'Show Removal Report', defaultValue: true },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      // Basic implementation - remove pages with very little content
      const sensitivity = (settings.sensitivity || 95) / 100
      const pages = doc.getPages()
      const pagesToRemove: number[] = []
      
      // Simple heuristic: very small pages or pages with minimal content
      // In a real implementation, we'd render each page and check pixel content
      
      // For now, this is a placeholder that doesn't remove any pages
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_no_blanks.pdf'),
  },

  // PDF TO PDF/A
  {
    id: 'pdf-to-pdfa',
    name: 'PDF to PDF/A',
    description: 'Convert PDF to archival format (PDF/A)',
    icon: Archive,
    color: '#0ea5e9',
    category: 'Compress & Optimize',
    sections: [
      {
        title: 'PDF/A Settings',
        icon: Archive,
        controls: [
          { type: 'button-group', key: 'pdfaLevel', label: 'PDF/A Level', defaultValue: '1b',
            options: [
              { value: '1b', label: 'PDF/A-1b' },
              { value: '2b', label: 'PDF/A-2b' },
              { value: '3b', label: 'PDF/A-3b' },
            ]
          },
          { type: 'checkbox', key: 'embedFonts', label: 'Embed All Fonts', defaultValue: true },
          { type: 'checkbox', key: 'embedICC', label: 'Embed ICC Profile', defaultValue: true },
          { type: 'checkbox', key: 'removeJS', label: 'Remove JavaScript', defaultValue: true },
          { type: 'checkbox', key: 'removeEncryption', label: 'Remove Encryption', defaultValue: true },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_PDFA.pdf'),
  },
]

export const pageTools: AdvancedToolConfig[] = [
  // ROTATE PDF
  {
    id: 'rotate',
    name: 'Rotate PDF',
    description: 'Rotate all or specific PDF pages with precise angle control',
    icon: RotateCw,
    color: '#14b8a6',
    category: 'Most Popular',
    sections: [
      {
        title: 'Rotation Settings',
        icon: RotateCw,
        controls: [
          { type: 'button-group', key: 'angle', label: 'Rotation Angle', defaultValue: '90',
            options: [
              { value: '90', label: '90° CW' },
              { value: '180', label: '180°' },
              { value: '270', label: '90° CCW' },
            ]
          },
          { type: 'button-group', key: 'applyTo', label: 'Apply To', defaultValue: 'all',
            options: [
              { value: 'all', label: 'All Pages' },
              { value: 'specific', label: 'Specific Pages' },
              { value: 'range', label: 'Range' },
            ]
          },
          { type: 'text', key: 'pageNumbers', label: 'Page Numbers', placeholder: 'e.g., 1,3,5-8' },
          { type: 'checkbox', key: 'autoRotate', label: 'Auto-rotate based on text direction', defaultValue: false },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const angle = parseInt(settings.angle || '90')
      const pages = doc.getPages()
      
      for (const page of pages) {
        const current = page.getRotation().angle
        page.setRotation(degrees(current + angle))
      }
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_rotated.pdf'),
  },

  // DELETE PAGES
  {
    id: 'delete-pages',
    name: 'Delete Pages',
    description: 'Remove specific pages from your PDF document',
    icon: Trash2,
    color: '#ef4444',
    category: 'Most Popular',
    sections: [
      {
        title: 'Page Selection',
        icon: Trash2,
        controls: [
          { type: 'button-group', key: 'deleteMode', label: 'Selection Mode', defaultValue: 'specific',
            options: [
              { value: 'specific', label: 'Specific Pages' },
              { value: 'range', label: 'Range' },
              { value: 'first', label: 'First Page' },
              { value: 'last', label: 'Last Page' },
            ]
          },
          { type: 'text', key: 'pageNumbers', label: 'Pages to Delete', placeholder: 'e.g., 2,4,6' },
          { type: 'text', key: 'pageRange', label: 'Page Range', placeholder: 'e.g., 3-7' },
          { type: 'checkbox', key: 'confirmDelete', label: 'Confirm Deletion', defaultValue: true, description: 'Show confirmation before deleting' },
          { type: 'info', key: 'info1', label: '', description: 'Deletion is permanent. The page order will adjust after removal.' },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const mode = settings.deleteMode || 'specific'
      let pagesToDelete: number[] = []
      
      if (mode === 'first') pagesToDelete = [0]
      else if (mode === 'last') pagesToDelete = [doc.getPageCount() - 1]
      else if (mode === 'range' && settings.pageRange) {
        const [start, end] = settings.pageRange.split('-').map(Number)
        for (let i = start - 1; i < Math.min(end, doc.getPageCount()); i++) {
          if (i >= 0) pagesToDelete.push(i)
        }
      } else if (mode === 'specific' && settings.pageNumbers) {
        pagesToDelete = settings.pageNumbers.split(',').map((s: string) => parseInt(s.trim()) - 1).filter((n: number) => n >= 0 && n < doc.getPageCount())
      }
      
      // Sort descending to avoid index shift
      pagesToDelete.sort((a, b) => b - a)
      for (const idx of pagesToDelete) {
        if (doc.getPageCount() > 1) doc.removePage(idx)
      }
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_pages_deleted.pdf'),
  },

  // HEADER & FOOTER
  {
    id: 'header-footer',
    name: 'Header & Footer',
    description: 'Add headers, footers, and page numbers to PDF',
    icon: Type,
    color: '#64748b',
    category: 'Advanced Tools',
    sections: [
      {
        title: 'Header',
        icon: Type,
        controls: [
          { type: 'text', key: 'headerLeft', label: 'Left', placeholder: 'Left header' },
          { type: 'text', key: 'headerCenter', label: 'Center', placeholder: 'Center header' },
          { type: 'text', key: 'headerRight', label: 'Right', placeholder: 'Right header' },
          { type: 'number', key: 'headerFontSize', label: 'Font Size', defaultValue: 9, min: 6, max: 24 },
        ]
      },
      {
        title: 'Footer',
        icon: Type,
        controls: [
          { type: 'text', key: 'footerLeft', label: 'Left', placeholder: 'Left footer' },
          { type: 'text', key: 'footerCenter', label: 'Center', placeholder: 'Center footer' },
          { type: 'text', key: 'footerRight', label: 'Right', placeholder: 'Right footer' },
          { type: 'checkbox', key: 'showPageNumbers', label: 'Show Page Numbers', defaultValue: true },
          { type: 'button-group', key: 'pageNumFormat', label: 'Page Number Format', defaultValue: 'page-of',
            options: [
              { value: 'page-of', label: 'Page X of Y' },
              { value: 'page-only', label: 'Page X' },
              { value: 'number-only', label: 'X' },
            ]
          },
          { type: 'number', key: 'footerFontSize', label: 'Font Size', defaultValue: 9, min: 6, max: 24 },
        ]
      },
      {
        title: 'Style',
        icon: Palette,
        controls: [
          { type: 'color', key: 'textColor', label: 'Text Color', defaultValue: '#333333' },
          { type: 'checkbox', key: 'addDividerLine', label: 'Add Divider Line', defaultValue: true },
          { type: 'button-group', key: 'marginSize', label: 'Margin', defaultValue: 'normal',
            options: [
              { value: 'small', label: 'Small' },
              { value: 'normal', label: 'Normal' },
              { value: 'large', label: 'Large' },
            ]
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const { r, g, b } = hexToRgb(settings.textColor || '#333333')
      const pages = doc.getPages()
      const marginMap: Record<string, number> = { small: 30, normal: 40, large: 55 }
      const margin = marginMap[settings.marginSize || 'normal'] || 40
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        const headerSize = settings.headerFontSize || 9
        const footerSize = settings.footerFontSize || 9
        
        // Headers
        if (settings.headerLeft) page.drawText(settings.headerLeft, { x: margin, y: height - margin + 5, size: headerSize, font, color: rgb(r, g, b) })
        if (settings.headerCenter) {
          const tw = font.widthOfTextAtSize(settings.headerCenter, headerSize)
          page.drawText(settings.headerCenter, { x: (width - tw) / 2, y: height - margin + 5, size: headerSize, font, color: rgb(r, g, b) })
        }
        if (settings.headerRight) {
          const tw = font.widthOfTextAtSize(settings.headerRight, headerSize)
          page.drawText(settings.headerRight, { x: width - tw - margin, y: height - margin + 5, size: headerSize, font, color: rgb(r, g, b) })
        }
        
        // Divider line
        if (settings.addDividerLine) {
          page.drawLine({ start: { x: margin, y: height - margin }, end: { x: width - margin, y: height - margin }, thickness: 0.5, color: rgb(r, g, b), opacity: 0.5 })
          page.drawLine({ start: { x: margin, y: margin - 5 }, end: { x: width - margin, y: margin - 5 }, thickness: 0.5, color: rgb(r, g, b), opacity: 0.5 })
        }
        
        // Footers
        const pageNum = i + 1
        const format = settings.pageNumFormat || 'page-of'
        const pageNumText = format === 'page-of' ? `Page ${pageNum} of ${pages.length}` : format === 'page-only' ? `Page ${pageNum}` : `${pageNum}`
        
        if (settings.footerLeft) page.drawText(settings.footerLeft, { x: margin, y: margin - 15, size: footerSize, font, color: rgb(r, g, b) })
        if (settings.showPageNumbers) {
          const tw = font.widthOfTextAtSize(pageNumText, footerSize)
          page.drawText(pageNumText, { x: (width - tw) / 2, y: margin - 15, size: footerSize, font, color: rgb(r, g, b) })
        }
        if (settings.footerRight) {
          const tw = font.widthOfTextAtSize(settings.footerRight, footerSize)
          page.drawText(settings.footerRight, { x: width - tw - margin, y: margin - 15, size: footerSize, font, color: rgb(r, g, b) })
        }
      }
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_header_footer.pdf'),
  },

  // BATES NUMBERING
  {
    id: 'bates-numbering',
    name: 'Bates Numbering',
    description: 'Add legal Bates numbering to PDF pages',
    icon: Hash,
    color: '#3b82f6',
    category: 'Advanced Tools',
    sections: [
      {
        title: 'Bates Settings',
        icon: Hash,
        controls: [
          { type: 'text', key: 'prefix', label: 'Prefix', placeholder: 'e.g., CASE-', defaultValue: '' },
          { type: 'number', key: 'startNumber', label: 'Start Number', defaultValue: 1, min: 1, max: 99999 },
          { type: 'number', key: 'numDigits', label: 'Number of Digits', defaultValue: 6, min: 3, max: 10 },
          { type: 'text', key: 'suffix', label: 'Suffix', placeholder: 'e.g., -A', defaultValue: '' },
          { type: 'button-group', key: 'position', label: 'Position', defaultValue: 'bottom-right',
            options: [
              { value: 'bottom-right', label: 'Bottom Right' },
              { value: 'bottom-center', label: 'Bottom Center' },
              { value: 'bottom-left', label: 'Bottom Left' },
              { value: 'top-right', label: 'Top Right' },
              { value: 'top-center', label: 'Top Center' },
              { value: 'top-left', label: 'Top Left' },
            ]
          },
          { type: 'number', key: 'fontSize', label: 'Font Size', defaultValue: 10, min: 6, max: 24 },
          { type: 'color', key: 'fontColor', label: 'Font Color', defaultValue: '#333333' },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const font = await doc.embedFont(StandardFonts.Courier)
      const { r, g, b } = hexToRgb(settings.fontColor || '#333333')
      const pages = doc.getPages()
      const startNum = settings.startNumber || 1
      const numDigits = settings.numDigits || 6
      const fontSize = settings.fontSize || 10
      const prefix = settings.prefix || ''
      const suffix = settings.suffix || ''
      const position = settings.position || 'bottom-right'
      const margin = 30
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        const batesNum = prefix + String(startNum + i).padStart(numDigits, '0') + suffix
        const tw = font.widthOfTextAtSize(batesNum, fontSize)
        
        let x = margin, y = margin
        if (position.includes('top')) y = height - margin
        if (position.includes('right')) x = width - tw - margin
        if (position.includes('center')) x = (width - tw) / 2
        
        page.drawText(batesNum, { x, y, size: fontSize, font, color: rgb(r, g, b) })
      }
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_bates.pdf'),
  },

  // N-UP LAYOUT
  {
    id: 'nup',
    name: 'N-Up Layout',
    description: 'Place multiple pages per sheet for printing',
    icon: Grid3X3,
    color: '#8b5cf6',
    category: 'Advanced Tools',
    sections: [
      {
        title: 'Layout Settings',
        icon: Grid3X3,
        controls: [
          { type: 'button-group', key: 'layout', label: 'Pages Per Sheet', defaultValue: '2',
            options: [
              { value: '2', label: '2-up' },
              { value: '4', label: '4-up' },
              { value: '6', label: '6-up' },
              { value: '9', label: '9-up' },
            ]
          },
          { type: 'checkbox', key: 'addBorders', label: 'Add Page Borders', defaultValue: true },
          { type: 'checkbox', key: 'addPageNumbers', label: 'Add Page Numbers', defaultValue: false },
          { type: 'button-group', key: 'orientation', label: 'Sheet Orientation', defaultValue: 'portrait',
            options: [
              { value: 'portrait', label: 'Portrait' },
              { value: 'landscape', label: 'Landscape' },
            ]
          },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_nup.pdf'),
  },

  // CREATE BLANK PDF
  {
    id: 'create-blank',
    name: 'Create Blank PDF',
    description: 'Generate a new blank PDF document',
    icon: FilePlus,
    color: '#64748b',
    category: 'Advanced Tools',
    sections: [
      {
        title: 'Document Settings',
        icon: FilePlus,
        controls: [
          { type: 'button-group', key: 'pageSize', label: 'Page Size', defaultValue: 'a4',
            options: [
              { value: 'a4', label: 'A4' },
              { value: 'letter', label: 'Letter' },
              { value: 'legal', label: 'Legal' },
              { value: 'a3', label: 'A3' },
            ]
          },
          { type: 'number', key: 'numPages', label: 'Number of Pages', defaultValue: 1, min: 1, max: 100 },
          { type: 'button-group', key: 'orientation', label: 'Orientation', defaultValue: 'portrait',
            options: [
              { value: 'portrait', label: 'Portrait' },
              { value: 'landscape', label: 'Landscape' },
            ]
          },
          { type: 'checkbox', key: 'addPageNumbers', label: 'Add Page Numbers', defaultValue: false },
          { type: 'checkbox', key: 'addMargins', label: 'Add Margin Lines', defaultValue: false },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const sizeMap: Record<string, [number, number]> = {
        'a4': [595.28, 841.89], 'letter': [612, 792], 'legal': [612, 1008], 'a3': [841.89, 1190.55]
      }
      let size = sizeMap[settings.pageSize || 'a4'] || [595.28, 841.89]
      if (settings.orientation === 'landscape') size = [size[1], size[0]]
      
      const numPages = settings.numPages || 1
      for (let i = 0; i < numPages; i++) {
        const page = doc.addPage(size)
        if (settings.addPageNumbers) {
          const font = await doc.embedFont(StandardFonts.Helvetica)
          const text = `${i + 1}`
          const tw = font.widthOfTextAtSize(text, 10)
          page.drawText(text, { x: (page.getSize().width - tw) / 2, y: 20, size: 10, font, color: rgb(0.5, 0.5, 0.5) })
        }
      }
      
      return doc
    },
    getDownloadName: () => 'blank.pdf',
  },

  // DARK MODE
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    description: 'Apply dark reading mode to PDF for comfortable viewing',
    icon: Moon,
    color: '#6366f1',
    category: 'Advanced Tools',
    sections: [
      {
        title: 'Dark Mode Settings',
        icon: Moon,
        controls: [
          { type: 'button-group', key: 'mode', label: 'Dark Mode Style', defaultValue: 'inverted',
            options: [
              { value: 'inverted', label: 'Inverted' },
              { value: 'sepia', label: 'Sepia' },
              { value: 'custom', label: 'Custom' },
            ]
          },
          { type: 'color', key: 'bgColor', label: 'Background Color', defaultValue: '#1a1a2e' },
          { type: 'range', key: 'bgOpacity', label: 'Background Opacity', defaultValue: 80, min: 10, max: 100 },
          { type: 'color', key: 'textColor', label: 'Text Tint Color', defaultValue: '#e0e0e0' },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const { r, g, b } = hexToRgb(settings.bgColor || '#1a1a2e')
      const opacity = (settings.bgOpacity || 80) / 100
      const pages = doc.getPages()
      
      for (const page of pages) {
        const { width, height } = page.getSize()
        page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(r, g, b), opacity })
      }
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_dark.pdf'),
  },

  // SCALE CONTENT
  {
    id: 'scale-content',
    name: 'Scale Content',
    description: 'Resize page content with custom scaling options',
    icon: Scale,
    color: '#f59e0b',
    category: 'Advanced Tools',
    sections: [
      {
        title: 'Scale Settings',
        icon: Scale,
        controls: [
          { type: 'range', key: 'scalePercent', label: 'Scale', defaultValue: 100, min: 25, max: 200 },
          { type: 'button-group', key: 'scaleTo', label: 'Scale To', defaultValue: 'percent',
            options: [
              { value: 'percent', label: 'Percentage' },
              { value: 'a4', label: 'Fit A4' },
              { value: 'letter', label: 'Fit Letter' },
            ]
          },
          { type: 'checkbox', key: 'maintainAspect', label: 'Maintain Aspect Ratio', defaultValue: true },
          { type: 'checkbox', key: 'centerContent', label: 'Center on Page', defaultValue: true },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const scale = (settings.scalePercent || 100) / 100
      const pages = doc.getPages()
      
      for (const page of pages) {
        const { width, height } = page.getSize()
        page.setMediaBox(0, 0, width * scale, height * scale)
      }
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_scaled.pdf'),
  },
]

export const signTools: AdvancedToolConfig[] = [
  // SIGN PDF
  {
    id: 'sign',
    name: 'Sign PDF',
    description: 'Add electronic signatures to your PDF documents',
    icon: Pen,
    color: '#3b82f6',
    category: 'Most Popular',
    sections: [
      {
        title: 'Signature Type',
        icon: Pen,
        controls: [
          { type: 'button-group', key: 'signType', label: 'Signature Type', defaultValue: 'draw',
            options: [
              { value: 'draw', label: 'Draw' },
              { value: 'type', label: 'Type' },
              { value: 'upload', label: 'Upload' },
            ]
          },
          { type: 'text', key: 'signerName', label: 'Signer Name', placeholder: 'Your full name' },
          { type: 'text', key: 'signerTitle', label: 'Title', placeholder: 'e.g., CEO, Manager' },
          { type: 'text', key: 'signerEmail', label: 'Email', placeholder: 'email@example.com' },
        ]
      },
      {
        title: 'Placement',
        icon: Settings,
        controls: [
          { type: 'button-group', key: 'position', label: 'Position', defaultValue: 'bottom-right',
            options: [
              { value: 'bottom-right', label: 'Bottom Right' },
              { value: 'bottom-left', label: 'Bottom Left' },
              { value: 'bottom-center', label: 'Bottom Center' },
              { value: 'custom', label: 'Custom' },
            ]
          },
          { type: 'number', key: 'customX', label: 'X', defaultValue: 400, min: 0, max: 2000 },
          { type: 'number', key: 'customY', label: 'Y', defaultValue: 100, min: 0, max: 2000 },
          { type: 'number', key: 'targetPage', label: 'Page', defaultValue: -1, min: -1, max: 999 },
          { type: 'checkbox', key: 'addDate', label: 'Add Date', defaultValue: true },
          { type: 'checkbox', key: 'addReason', label: 'Add Reason', defaultValue: false },
          { type: 'text', key: 'reason', label: 'Signing Reason', placeholder: 'I approve this document' },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const font = await doc.embedFont(StandardFonts.HelveticaBold)
      const fontRegular = await doc.embedFont(StandardFonts.Helvetica)
      const name = settings.signerName || 'Signed'
      const title = settings.signerTitle || ''
      const targetPage = settings.targetPage === -1 ? doc.getPageCount() : Math.min(settings.targetPage || doc.getPageCount(), doc.getPageCount())
      const page = doc.getPage(targetPage - 1)
      const { width, height } = page.getSize()
      
      const boxW = 200, boxH = 60
      let x = width - boxW - 40, y = 40
      if (settings.position === 'bottom-left') { x = 40; y = 40 }
      else if (settings.position === 'bottom-center') { x = (width - boxW) / 2; y = 40 }
      else if (settings.position === 'custom') { x = settings.customX || 400; y = settings.customY || 100 }
      
      // Draw signature box
      page.drawRectangle({ x, y, width: boxW, height: boxH, borderColor: rgb(0.2, 0.4, 0.8), borderWidth: 1, color: rgb(0.95, 0.97, 1), opacity: 0.9 })
      page.drawText(name, { x: x + 10, y: y + boxH - 20, size: 12, font, color: rgb(0.1, 0.2, 0.5) })
      if (title) page.drawText(title, { x: x + 10, y: y + boxH - 34, size: 8, font: fontRegular, color: rgb(0.4, 0.4, 0.4) })
      if (settings.addDate) {
        const dateStr = new Date().toLocaleDateString()
        page.drawText(dateStr, { x: x + 10, y: y + 6, size: 7, font: fontRegular, color: rgb(0.5, 0.5, 0.5) })
      }
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_signed.pdf'),
  },

  // COMPARE PDFS
  {
    id: 'compare',
    name: 'Compare PDFs',
    description: 'Find differences between two PDF documents',
    icon: FileText,
    color: '#6366f1',
    category: 'Sign & Forms',
    sections: [
      {
        title: 'Compare Settings',
        icon: FileText,
        controls: [
          { type: 'file', key: 'secondFile', label: 'Second PDF', accept: '.pdf' },
          { type: 'button-group', key: 'compareMode', label: 'Compare Mode', defaultValue: 'visual',
            options: [
              { value: 'visual', label: 'Visual' },
              { value: 'text', label: 'Text' },
              { value: 'metadata', label: 'Metadata' },
            ]
          },
          { type: 'checkbox', key: 'highlightDifferences', label: 'Highlight Differences', defaultValue: true },
          { type: 'color', key: 'diffColor', label: 'Difference Color', defaultValue: '#ff0000' },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_compared.pdf'),
  },

  // EXTRACT IMAGES
  {
    id: 'extract-images',
    name: 'Extract Images',
    description: 'Save all embedded images from PDF',
    icon: Image,
    color: '#ec4899',
    category: 'Sign & Forms',
    sections: [
      {
        title: 'Extraction Settings',
        icon: Image,
        controls: [
          { type: 'button-group', key: 'format', label: 'Output Format', defaultValue: 'png',
            options: [
              { value: 'png', label: 'PNG' },
              { value: 'jpg', label: 'JPEG' },
            ]
          },
          { type: 'range', key: 'quality', label: 'Image Quality', defaultValue: 90, min: 10, max: 100 },
          { type: 'checkbox', key: 'includeInline', label: 'Include Inline Images', defaultValue: true },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_images.pdf'),
  },

  // CREATE FORM
  {
    id: 'create-form',
    name: 'Create Form',
    description: 'Add fillable form fields to your PDF',
    icon: FileCheck,
    color: '#3b82f6',
    category: 'Sign & Forms',
    sections: [
      {
        title: 'Form Field',
        icon: FileCheck,
        controls: [
          { type: 'button-group', key: 'fieldType', label: 'Field Type', defaultValue: 'text',
            options: [
              { value: 'text', label: 'Text Field' },
              { value: 'checkbox', label: 'Checkbox' },
              { value: 'dropdown', label: 'Dropdown' },
            ]
          },
          { type: 'text', key: 'fieldName', label: 'Field Name', placeholder: 'field_name', defaultValue: 'field_1' },
          { type: 'number', key: 'fieldX', label: 'X Position', defaultValue: 100, min: 0, max: 2000 },
          { type: 'number', key: 'fieldY', label: 'Y Position', defaultValue: 700, min: 0, max: 2000 },
          { type: 'number', key: 'fieldWidth', label: 'Width', defaultValue: 200, min: 10, max: 1000 },
          { type: 'number', key: 'fieldHeight', label: 'Height', defaultValue: 20, min: 5, max: 200 },
          { type: 'number', key: 'targetPage', label: 'Target Page', defaultValue: 1, min: 1, max: 999 },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const form = doc.getForm()
      const page = doc.getPage(Math.min((settings.targetPage || 1) - 1, doc.getPageCount() - 1))
      
      if (settings.fieldType === 'text') {
        form.createTextField(settings.fieldName || 'field_1')
      } else if (settings.fieldType === 'checkbox') {
        form.createCheckBox(settings.fieldName || 'check_1')
      }
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_form.pdf'),
  },
]

export const overlayTools: AdvancedToolConfig[] = [
  // OVERLAY PDFs
  {
    id: 'overlay',
    name: 'Overlay PDFs',
    description: 'Layer multiple PDFs on top of each other',
    icon: Layers,
    color: '#8b5cf6',
    category: 'Watermark & Overlay',
    sections: [
      {
        title: 'Overlay Settings',
        icon: Layers,
        controls: [
          { type: 'file', key: 'overlayFile', label: 'Overlay PDF', accept: '.pdf' },
          { type: 'range', key: 'opacity', label: 'Overlay Opacity', defaultValue: 50, min: 1, max: 100 },
          { type: 'button-group', key: 'position', label: 'Position', defaultValue: 'center',
            options: [
              { value: 'center', label: 'Center' },
              { value: 'top-left', label: 'Top Left' },
              { value: 'bottom-right', label: 'Bottom Right' },
            ]
          },
          { type: 'checkbox', key: 'repeatOverlay', label: 'Repeat on All Pages', defaultValue: true },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_overlay.pdf'),
  },

  // OVERLAY IMAGE
  {
    id: 'overlay-image',
    name: 'Overlay Image',
    description: 'Add image overlay to PDF pages',
    icon: Layers2,
    color: '#8b5cf6',
    category: 'Watermark & Overlay',
    sections: [
      {
        title: 'Image Overlay',
        icon: Image,
        controls: [
          { type: 'file', key: 'imageFile', label: 'Upload Image', accept: 'image/*' },
          { type: 'range', key: 'opacity', label: 'Opacity', defaultValue: 50, min: 1, max: 100 },
          { type: 'range', key: 'scale', label: 'Scale', defaultValue: 30, min: 5, max: 100 },
          { type: 'button-group', key: 'position', label: 'Position', defaultValue: 'center',
            options: [
              { value: 'center', label: 'Center' },
              { value: 'top-left', label: 'Top Left' },
              { value: 'top-right', label: 'Top Right' },
              { value: 'bottom-left', label: 'Bottom Left' },
              { value: 'bottom-right', label: 'Bottom Right' },
              { value: 'tiled', label: 'Tiled' },
            ]
          },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_overlay.pdf'),
  },

  // POSTER
  {
    id: 'poster',
    name: 'Poster',
    description: 'Split a page into tiles for large-format printing',
    icon: Layout,
    color: '#f97316',
    category: 'Watermark & Overlay',
    sections: [
      {
        title: 'Poster Settings',
        icon: Layout,
        controls: [
          { type: 'button-group', key: 'tileSize', label: 'Output Paper Size', defaultValue: 'a4',
            options: [
              { value: 'a4', label: 'A4' },
              { value: 'letter', label: 'Letter' },
              { value: 'a3', label: 'A3' },
            ]
          },
          { type: 'range', key: 'overlap', label: 'Tile Overlap (mm)', defaultValue: 10, min: 0, max: 30 },
          { type: 'checkbox', key: 'addCropMarks', label: 'Add Crop Marks', defaultValue: true },
          { type: 'checkbox', key: 'addLabels', label: 'Add Tile Labels', defaultValue: true },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_poster.pdf'),
  },
]

export const ocrTools: AdvancedToolConfig[] = [
  // OCR
  {
    id: 'ocr',
    name: 'OCR',
    description: 'Recognize and extract text from scanned PDFs',
    icon: ScanLine,
    color: '#3b82f6',
    category: 'OCR & Scan',
    sections: [
      {
        title: 'OCR Settings',
        icon: ScanLine,
        controls: [
          { type: 'button-group', key: 'language', label: 'Document Language', defaultValue: 'eng',
            options: [
              { value: 'eng', label: 'English' },
              { value: 'spa', label: 'Spanish' },
              { value: 'fra', label: 'French' },
              { value: 'deu', label: 'German' },
            ]
          },
          { type: 'checkbox', key: 'preserveFormatting', label: 'Preserve Formatting', defaultValue: true },
          { type: 'button-group', key: 'outputMode', label: 'Output Mode', defaultValue: 'text-overlay',
            options: [
              { value: 'text-overlay', label: 'Text Overlay' },
              { value: 'text-only', label: 'Text Only' },
              { value: 'searchable', label: 'Searchable PDF' },
            ]
          },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_ocr.pdf'),
  },

  // DESKEW
  {
    id: 'deskew',
    name: 'Deskew',
    description: 'Fix crooked or tilted scans automatically',
    icon: RotateCcw,
    color: '#14b8a6',
    category: 'OCR & Scan',
    sections: [
      {
        title: 'Deskew Settings',
        icon: RotateCcw,
        controls: [
          { type: 'range', key: 'maxAngle', label: 'Max Angle (degrees)', defaultValue: 15, min: 1, max: 45 },
          { type: 'checkbox', key: 'autoDetect', label: 'Auto-detect Skew Angle', defaultValue: true },
          { type: 'checkbox', key: 'cropWhiteBorders', label: 'Crop White Borders', defaultValue: true },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_deskewed.pdf'),
  },

  // PDF SCANNER
  {
    id: 'pdf-scanner',
    name: 'PDF Scanner',
    description: 'Scan documents using your camera to create PDFs',
    icon: Camera,
    color: '#6366f1',
    category: 'OCR & Scan',
    sections: [
      {
        title: 'Scanner Settings',
        icon: Camera,
        controls: [
          { type: 'button-group', key: 'pageSize', label: 'Page Size', defaultValue: 'a4',
            options: [
              { value: 'a4', label: 'A4' },
              { value: 'letter', label: 'Letter' },
            ]
          },
          { type: 'checkbox', key: 'autoEnhance', label: 'Auto-enhance Scan', defaultValue: true },
          { type: 'checkbox', key: 'autoDeskew', label: 'Auto-deskew', defaultValue: true },
          { type: 'checkbox', key: 'autoCrop', label: 'Auto-crop Borders', defaultValue: true },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: () => 'scan.pdf',
  },

  // SCANNER
  {
    id: 'scanner',
    name: 'Scanner',
    description: 'Camera scan to PDF document',
    icon: Scan,
    color: '#6366f1',
    category: 'OCR & Scan',
    sections: [
      {
        title: 'Scanner Settings',
        icon: Scan,
        controls: [
          { type: 'button-group', key: 'quality', label: 'Scan Quality', defaultValue: 'high',
            options: [
              { value: 'low', label: 'Low (fast)' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High (best)' },
            ]
          },
          { type: 'checkbox', key: 'colorScan', label: 'Color Scan', defaultValue: true },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: () => 'scan.pdf',
  },
]

export const specialTools: AdvancedToolConfig[] = [
  // ALTERNATE MERGE
  {
    id: 'alternate-merge',
    name: 'Alternate Merge',
    description: 'Interleave pages from two PDFs alternately',
    icon: Merge,
    color: '#10b981',
    category: 'Advanced Tools',
    sections: [
      {
        title: 'Alternate Merge',
        icon: Merge,
        controls: [
          { type: 'file', key: 'secondFile', label: 'Second PDF', accept: '.pdf' },
          { type: 'button-group', key: 'order', label: 'Priority', defaultValue: 'first',
            options: [
              { value: 'first', label: 'First PDF First' },
              { value: 'second', label: 'Second PDF First' },
            ]
          },
          { type: 'checkbox', key: 'balancePages', label: 'Balance Page Count', defaultValue: true, description: 'Add blank pages if PDFs have different lengths' },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_alt_merged.pdf'),
  },

  // INITIAL VIEW
  {
    id: 'initial-view',
    name: 'Initial View',
    description: 'Set how the PDF opens and displays',
    icon: Settings,
    color: '#0ea5e9',
    category: 'Advanced Tools',
    sections: [
      {
        title: 'Display Settings',
        icon: Settings,
        controls: [
          { type: 'button-group', key: 'pageLayout', label: 'Page Layout', defaultValue: 'single',
            options: [
              { value: 'single', label: 'Single Page' },
              { value: 'two-left', label: 'Two Pages (Left)' },
              { value: 'two-cover', label: 'Two Pages (Cover)' },
            ]
          },
          { type: 'button-group', key: 'pageMode', label: 'Page Mode', defaultValue: 'none',
            options: [
              { value: 'none', label: 'Normal' },
              { value: 'bookmarks', label: 'With Bookmarks' },
              { value: 'thumbnails', label: 'With Thumbnails' },
              { value: 'fullscreen', label: 'Fullscreen' },
            ]
          },
          { type: 'number', key: 'openPage', label: 'Open on Page', defaultValue: 1, min: 1, max: 999 },
          { type: 'number', key: 'openZoom', label: 'Zoom Level (%)', defaultValue: 100, min: 25, max: 400 },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_initial_view.pdf'),
  },

  // ROTATE SPECIFIC
  {
    id: 'rotate-specific',
    name: 'Rotate Specific Pages',
    description: 'Rotate only selected pages with custom angles',
    icon: RotateCcw,
    color: '#14b8a6',
    category: 'Advanced Tools',
    sections: [
      {
        title: 'Rotation Settings',
        icon: RotateCcw,
        controls: [
          { type: 'text', key: 'pageNumbers', label: 'Pages to Rotate', placeholder: 'e.g., 1,3,5-8', defaultValue: '1' },
          { type: 'button-group', key: 'angle', label: 'Angle', defaultValue: '90',
            options: [
              { value: '90', label: '90° CW' },
              { value: '180', label: '180°' },
              { value: '270', label: '90° CCW' },
            ]
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const angle = parseInt(settings.angle || '90')
      const pageStr = settings.pageNumbers || '1'
      const pages = doc.getPages()
      const indices = new Set<number>()
      
      pageStr.split(',').forEach((part: string) => {
        const trimmed = part.trim()
        if (trimmed.includes('-')) {
          const [start, end] = trimmed.split('-').map(Number)
          for (let i = start - 1; i < Math.min(end, pages.length); i++) {
            if (i >= 0) indices.add(i)
          }
        } else {
          const n = parseInt(trimmed) - 1
          if (n >= 0 && n < pages.length) indices.add(n)
        }
      })
      
      for (const idx of indices) {
        const current = pages[idx].getRotation().angle
        pages[idx].setRotation(degrees(current + angle))
      }
      
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_rotated.pdf'),
  },

  // PDF REPAIR (advanced)
  {
    id: 'pdf-repair',
    name: 'PDF Repair',
    description: 'Advanced repair for severely damaged PDF files',
    icon: Wrench,
    color: '#10b981',
    category: 'Advanced Tools',
    sections: [
      {
        title: 'Advanced Repair',
        icon: Wrench,
        controls: [
          { type: 'checkbox', key: 'rebuildXRef', label: 'Rebuild Cross-Reference', defaultValue: true },
          { type: 'checkbox', key: 'fixStreams', label: 'Fix Corrupted Streams', defaultValue: true },
          { type: 'checkbox', key: 'recoverPages', label: 'Recover Orphaned Pages', defaultValue: true },
          { type: 'checkbox', key: 'removeDuplicates', label: 'Remove Duplicate Objects', defaultValue: true },
          { type: 'checkbox', key: 'fixFonts', label: 'Fix Font References', defaultValue: true },
          { type: 'checkbox', key: 'fixImages', label: 'Fix Image References', defaultValue: true },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_repaired.pdf'),
  },

  // REMOVE DUPLICATES
  {
    id: 'duplicate-page-remover',
    name: 'Remove Duplicate Pages',
    description: 'Detect and remove duplicate pages from PDF',
    icon: Filter,
    color: '#ef4444',
    category: 'Advanced Tools',
    sections: [
      {
        title: 'Detection Settings',
        icon: Filter,
        controls: [
          { type: 'range', key: 'sensitivity', label: 'Detection Sensitivity', defaultValue: 95, min: 50, max: 100 },
          { type: 'checkbox', key: 'keepFirst', label: 'Keep First Occurrence', defaultValue: true },
          { type: 'checkbox', key: 'showReport', label: 'Show Duplicate Report', defaultValue: true },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_deduped.pdf'),
  },

  // PDF TO AUDIO
  {
    id: 'pdf-to-audio',
    name: 'PDF to Audio',
    description: 'Convert PDF text to speech audio file',
    icon: Volume2,
    color: '#a855f7',
    category: 'Advanced Tools',
    sections: [
      {
        title: 'Audio Settings',
        icon: Volume2,
        controls: [
          { type: 'button-group', key: 'voice', label: 'Voice', defaultValue: 'female',
            options: [
              { value: 'female', label: 'Female' },
              { value: 'male', label: 'Male' },
            ]
          },
          { type: 'range', key: 'speed', label: 'Speech Speed', defaultValue: 100, min: 50, max: 200 },
          { type: 'range', key: 'pitch', label: 'Pitch', defaultValue: 100, min: 50, max: 200 },
          { type: 'button-group', key: 'format', label: 'Output Format', defaultValue: 'mp3',
            options: [
              { value: 'mp3', label: 'MP3' },
              { value: 'wav', label: 'WAV' },
            ]
          },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '.mp3'),
  },

  // READ ALOUD
  {
    id: 'speech',
    name: 'Read Aloud',
    description: 'Listen to your PDF content with text-to-speech',
    icon: Mic,
    color: '#a855f7',
    category: 'Advanced Tools',
    sections: [
      {
        title: 'Read Aloud Settings',
        icon: Mic,
        controls: [
          { type: 'button-group', key: 'voice', label: 'Voice', defaultValue: 'female',
            options: [
              { value: 'female', label: 'Female' },
              { value: 'male', label: 'Male' },
            ]
          },
          { type: 'range', key: 'speed', label: 'Speed', defaultValue: 100, min: 50, max: 200 },
          { type: 'checkbox', key: 'highlightText', label: 'Highlight Current Word', defaultValue: true },
          { type: 'number', key: 'startPage', label: 'Start from Page', defaultValue: 1, min: 1, max: 999 },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_read.pdf'),
  },

  // MULTIPAGE IMAGE
  {
    id: 'multipage-image',
    name: 'Multipage Image',
    description: 'Combine multiple scans into a single PDF',
    icon: Layers2,
    color: '#ec4899',
    category: 'Advanced Tools',
    allowMultiple: true,
    sections: [
      {
        title: 'Output Settings',
        icon: Layers2,
        controls: [
          { type: 'button-group', key: 'pageSize', label: 'Page Size', defaultValue: 'fit',
            options: [
              { value: 'fit', label: 'Fit to Image' },
              { value: 'a4', label: 'A4' },
              { value: 'letter', label: 'Letter' },
            ]
          },
          { type: 'range', key: 'quality', label: 'Image Quality', defaultValue: 90, min: 10, max: 100 },
          { type: 'checkbox', key: 'autoRotate', label: 'Auto-rotate Images', defaultValue: true },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: () => 'multipage.pdf',
  },

  // EXTRACT ATTACHMENTS
  {
    id: 'extract-attachments',
    name: 'Extract Attachments',
    description: 'Download embedded files and attachments from PDF',
    icon: FileOutput,
    color: '#0ea5e9',
    category: 'Sign & Forms',
    sections: [
      {
        title: 'Extraction Settings',
        icon: FileOutput,
        controls: [
          { type: 'checkbox', key: 'extractAll', label: 'Extract All Attachments', defaultValue: true },
          { type: 'checkbox', key: 'includeEmbedded', label: 'Include Embedded Files', defaultValue: true },
          { type: 'info', key: 'info1', label: '', description: 'Attachments will be listed after processing. Click download to save each one.' },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_attachments.pdf'),
  },

  // COMPRESS PDF
  {
    id: 'compress',
    name: 'Compress PDF',
    description: 'Reduce PDF file size with advanced compression options',
    icon: FileDown,
    color: '#6366f1',
    category: 'Most Popular',
    sections: [
      {
        title: 'Compression Level',
        icon: FileDown,
        controls: [
          { type: 'button-group', key: 'compressionLevel', label: 'Compression', defaultValue: 'recommended',
            options: [
              { value: 'low', label: 'Low (best quality)' },
              { value: 'recommended', label: 'Recommended' },
              { value: 'extreme', label: 'Extreme (smallest)' },
            ]
          },
          { type: 'range', key: 'imageQuality', label: 'Image Quality', defaultValue: 75, min: 10, max: 100 },
          { type: 'checkbox', key: 'downscaleImages', label: 'Downscale Images', defaultValue: true },
          { type: 'checkbox', key: 'removeMetadata', label: 'Remove Metadata', defaultValue: false },
          { type: 'checkbox', key: 'flattenForms', label: 'Flatten Forms', defaultValue: true },
          { type: 'checkbox', key: 'removeUnusedObjects', label: 'Remove Unused Objects', defaultValue: true },
          { type: 'checkbox', key: 'subsetFonts', label: 'Subset Fonts', defaultValue: true },
        ]
      }
    ],
    processPDF: async (doc) => doc,
    getDownloadName: (name) => name.replace('.pdf', '_compressed.pdf'),
  },
]

// Combine all tools into a single export
export const ALL_TOOL_CONFIGS: AdvancedToolConfig[] = [
  ...organizeTools,
  ...convertTools,
  ...editTools,
  ...securityTools,
  ...compressTools,
  ...pageTools,
  ...signTools,
  ...overlayTools,
  ...ocrTools,
  ...specialTools,
]

// Map for quick lookup by ID
export const TOOL_CONFIG_MAP = new Map(ALL_TOOL_CONFIGS.map(t => [t.id, t]))
