'use client'

import { PDFDocument, rgb, StandardFonts, degrees, PDFName, PDFArray } from 'pdf-lib'
import type { AdvancedToolConfig } from '@/components/pdf/AdvancedToolPage'
import {
  Hash, FileSearch, Contrast, Square, Eraser, FileSpreadsheet, Calendar,
  Maximize, Layers2, Image, FileDigit, EyeOff, Table, RotateCw, FileImage,
  ArrowDownToLine, Settings, Type, Stamp, LayoutGrid
} from 'lucide-react'

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { r: 0, g: 0, b: 0 }
  return { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 }
}

function parsePageRange(rangeStr: string, totalPages: number): number[] {
  if (!rangeStr || rangeStr.trim() === '') return Array.from({ length: totalPages }, (_, i) => i)
  const indices: number[] = []
  const parts = rangeStr.split(',')
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(Number)
      for (let i = start - 1; i < Math.min(end, totalPages); i++) {
        if (i >= 0) indices.push(i)
      }
    } else {
      const n = parseInt(trimmed) - 1
      if (n >= 0 && n < totalPages) indices.push(n)
    }
  }
  return indices
}

export const PART4_CONFIGS: AdvancedToolConfig[] = [
  // 1. ADD PAGE NUMBERS
  {
    id: 'add-page-numbers',
    name: 'Add Page Numbers',
    description: 'Add page numbers with position and format options',
    icon: Hash,
    color: '#0ea5e9',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Page Number Settings',
        icon: Hash,
        controls: [
          {
            type: 'button-group', key: 'position', label: 'Position',
            defaultValue: 'bottom-center',
            options: [
              { value: 'bottom-center', label: 'Bottom Center' },
              { value: 'bottom-right', label: 'Bottom Right' },
              { value: 'bottom-left', label: 'Bottom Left' },
              { value: 'top-center', label: 'Top Center' },
              { value: 'top-right', label: 'Top Right' },
              { value: 'top-left', label: 'Top Left' },
            ]
          },
          {
            type: 'button-group', key: 'format', label: 'Format',
            defaultValue: 'number',
            options: [
              { value: 'number', label: '1, 2, 3' },
              { value: 'dash-number', label: '- 1 -' },
              { value: 'page-of', label: 'Page X of Y' },
              { value: 'slash', label: '1 / N' },
            ]
          },
          {
            type: 'number', key: 'fontSize', label: 'Font Size',
            defaultValue: 10, min: 6, max: 36, step: 1
          },
          {
            type: 'number', key: 'startNumber', label: 'Starting Number',
            defaultValue: 1, min: 0, max: 9999, step: 1
          },
          {
            type: 'number', key: 'margin', label: 'Margin (pt)',
            defaultValue: 30, min: 10, max: 100, step: 5
          },
        ]
      },
      {
        title: 'Appearance',
        icon: Settings,
        controls: [
          {
            type: 'color', key: 'textColor', label: 'Text Color',
            defaultValue: '#000000'
          },
          {
            type: 'button-group', key: 'fontName', label: 'Font',
            defaultValue: 'helvetica',
            options: [
              { value: 'helvetica', label: 'Helvetica' },
              { value: 'times', label: 'Times' },
              { value: 'courier', label: 'Courier' },
            ]
          },
          {
            type: 'checkbox', key: 'skipFirst', label: 'Skip First Page',
            defaultValue: false, description: 'Do not number the first page'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const fontKey = settings.fontName === 'times' ? StandardFonts.TimesRoman
        : settings.fontName === 'courier' ? StandardFonts.Courier
        : StandardFonts.Helvetica
      const font = await doc.embedFont(fontKey)
      const pages = doc.getPages()
      const startNum = settings.startNumber || 1
      const fontSize = settings.fontSize || 10
      const margin = settings.margin || 30
      const format = settings.format || 'number'
      const position = settings.position || 'bottom-center'
      const { r, g, b } = hexToRgb(settings.textColor || '#000000')
      const skipFirst = settings.skipFirst || false

      for (let i = 0; i < pages.length; i++) {
        if (skipFirst && i === 0) continue
        const page = pages[i]
        const { width, height } = page.getSize()
        const pageNum = startNum + i - (skipFirst ? 1 : 0)

        let text: string
        switch (format) {
          case 'dash-number':
            text = `- ${pageNum} -`
            break
          case 'page-of':
            text = `Page ${pageNum} of ${pages.length - (skipFirst ? 1 : 0)}`
            break
          case 'slash':
            text = `${pageNum} / ${pages.length - (skipFirst ? 1 : 0)}`
            break
          default:
            text = `${pageNum}`
        }

        const textWidth = font.widthOfTextAtSize(text, fontSize)
        let x: number, y: number

        if (position.startsWith('top')) {
          y = height - margin
        } else {
          y = margin
        }

        if (position.endsWith('center')) {
          x = (width - textWidth) / 2
        } else if (position.endsWith('right')) {
          x = width - textWidth - margin
        } else {
          x = margin
        }

        page.drawText(text, {
          x, y, size: fontSize, font,
          color: rgb(r, g, b),
        })
      }
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_numbered.pdf'),
  },

  // 2. PDF INFO
  {
    id: 'pdf-info',
    name: 'PDF Info',
    description: 'View detailed PDF document metadata and properties',
    icon: FileSearch,
    color: '#6366f1',
    category: 'View & Analyze',
    sections: [
      {
        title: 'Document Information',
        icon: FileSearch,
        controls: [
          {
            type: 'info', key: 'infoTitle', label: '',
            description: 'Upload a PDF to view its metadata, page count, file size, and other properties.'
          },
          {
            type: 'info', key: 'infoNote', label: '',
            description: 'Properties shown are read-only. Use the Edit Metadata tool to modify them.'
          },
        ]
      },
      {
        title: 'Display Options',
        icon: Settings,
        controls: [
          {
            type: 'checkbox', key: 'showTechnical', label: 'Show Technical Details',
            defaultValue: true, description: 'Display PDF version, encryption status, etc.'
          },
          {
            type: 'checkbox', key: 'showPageInfo', label: 'Show Page Dimensions',
            defaultValue: true, description: 'Display width and height of each page'
          },
        ]
      }
    ],
    processPDF: async (doc) => {
      // PDF Info is a viewer-only tool - return the document as-is
      // Metadata is displayed in the UI from the loaded document
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_info.pdf'),
  },

  // 3. INVERT COLORS
  {
    id: 'invert-colors',
    name: 'Invert Colors',
    description: 'Apply a color inversion overlay effect to PDF pages',
    icon: Contrast,
    color: '#8b5cf6',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Inversion Settings',
        icon: Contrast,
        controls: [
          {
            type: 'range', key: 'opacity', label: 'Overlay Opacity',
            defaultValue: 80, min: 10, max: 100, step: 5
          },
          {
            type: 'button-group', key: 'overlayColor', label: 'Overlay Color',
            defaultValue: 'black',
            options: [
              { value: 'black', label: 'Black' },
              { value: 'darkblue', label: 'Dark Blue' },
              { value: 'darkgray', label: 'Dark Gray' },
              { value: 'sepia', label: 'Sepia' },
            ]
          },
          {
            type: 'text', key: 'pageRange', label: 'Pages',
            placeholder: 'All pages or e.g., 1,3,5-8', defaultValue: ''
          },
        ]
      },
      {
        title: 'Options',
        icon: Settings,
        controls: [
          {
            type: 'checkbox', key: 'blendMode', label: 'Dark Overlay Mode',
            defaultValue: true, description: 'Apply a dark semi-transparent overlay to simulate color inversion'
          },
          {
            type: 'info', key: 'invertNote', label: '',
            description: 'True color inversion requires pixel-level processing which pdf-lib cannot do. A semi-transparent overlay is applied instead to create a dark mode effect.'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const opacity = (settings.opacity || 80) / 100
      const overlayColor = settings.overlayColor || 'black'
      const pageRange = settings.pageRange || ''
      const pages = doc.getPages()
      const targetIndices = parsePageRange(pageRange, pages.length)

      const colorMap: Record<string, { r: number; g: number; b: number }> = {
        'black': { r: 0, g: 0, b: 0 },
        'darkblue': { r: 0, g: 0, b: 0.2 },
        'darkgray': { r: 0.15, g: 0.15, b: 0.15 },
        'sepia': { r: 0.25, g: 0.15, b: 0.05 },
      }
      const c = colorMap[overlayColor] || colorMap['black']

      for (const idx of targetIndices) {
        const page = pages[idx]
        const { width, height } = page.getSize()
        // Draw a semi-transparent dark rectangle over the entire page
        // This simulates color inversion by making light areas dark
        page.drawRectangle({
          x: 0, y: 0,
          width, height,
          color: rgb(c.r, c.g, c.b),
          opacity: opacity,
        })
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_inverted.pdf'),
  },

  // 4. ADD BORDER
  {
    id: 'add-border',
    name: 'Add Border',
    description: 'Draw decorative or functional borders on PDF pages',
    icon: Square,
    color: '#f59e0b',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Border Style',
        icon: Square,
        controls: [
          {
            type: 'button-group', key: 'borderStyle', label: 'Border Style',
            defaultValue: 'solid',
            options: [
              { value: 'solid', label: 'Solid' },
              { value: 'double', label: 'Double' },
              { value: 'dashed', label: 'Dashed' },
            ]
          },
          {
            type: 'color', key: 'borderColor', label: 'Border Color',
            defaultValue: '#000000'
          },
          {
            type: 'number', key: 'borderWidth', label: 'Border Width (pt)',
            defaultValue: 2, min: 0.5, max: 20, step: 0.5
          },
          {
            type: 'number', key: 'margin', label: 'Margin (pt)',
            defaultValue: 20, min: 0, max: 100, step: 5
          },
          {
            type: 'button-group', key: 'cornerStyle', label: 'Corner Style',
            defaultValue: 'sharp',
            options: [
              { value: 'sharp', label: 'Sharp' },
              { value: 'rounded', label: 'Rounded' },
            ]
          },
        ]
      },
      {
        title: 'Apply To',
        icon: Settings,
        controls: [
          {
            type: 'button-group', key: 'applyTo', label: 'Apply To',
            defaultValue: 'all',
            options: [
              { value: 'all', label: 'All Pages' },
              { value: 'first', label: 'First Page' },
              { value: 'custom', label: 'Custom Pages' },
            ]
          },
          {
            type: 'text', key: 'customPages', label: 'Page Numbers',
            placeholder: 'e.g., 1,3,5-8', defaultValue: ''
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const borderColor = hexToRgb(settings.borderColor || '#000000')
      const borderWidth = settings.borderWidth || 2
      const margin = settings.margin || 20
      const borderStyle = settings.borderStyle || 'solid'
      const cornerStyle = settings.cornerStyle || 'sharp'
      const applyTo = settings.applyTo || 'all'
      const pages = doc.getPages()

      let targetIndices: number[] = []
      if (applyTo === 'all') {
        targetIndices = pages.map((_, i) => i)
      } else if (applyTo === 'first') {
        targetIndices = [0]
      } else {
        targetIndices = parsePageRange(settings.customPages || '1', pages.length)
      }

      for (const idx of targetIndices) {
        const page = pages[idx]
        const { width, height } = page.getSize()

        if (borderStyle === 'double') {
          // Draw two rectangles for double border
          page.drawRectangle({
            x: margin, y: margin,
            width: width - margin * 2, height: height - margin * 2,
            borderColor: rgb(borderColor.r, borderColor.g, borderColor.b),
            borderWidth: borderWidth,
          })
          const innerMargin = margin + borderWidth * 3
          page.drawRectangle({
            x: innerMargin, y: innerMargin,
            width: width - innerMargin * 2, height: height - innerMargin * 2,
            borderColor: rgb(borderColor.r, borderColor.g, borderColor.b),
            borderWidth: borderWidth,
          })
        } else if (borderStyle === 'dashed') {
          // Draw dashed lines for each side
          const dashLen = 10
          const gapLen = 5
          const m = margin
          // Top edge
          for (let x = m; x < width - m; x += dashLen + gapLen) {
            const endX = Math.min(x + dashLen, width - m)
            page.drawLine({
              start: { x, y: height - m },
              end: { x: endX, y: height - m },
              thickness: borderWidth,
              color: rgb(borderColor.r, borderColor.g, borderColor.b),
            })
          }
          // Bottom edge
          for (let x = m; x < width - m; x += dashLen + gapLen) {
            const endX = Math.min(x + dashLen, width - m)
            page.drawLine({
              start: { x, y: m },
              end: { x: endX, y: m },
              thickness: borderWidth,
              color: rgb(borderColor.r, borderColor.g, borderColor.b),
            })
          }
          // Left edge
          for (let y = m; y < height - m; y += dashLen + gapLen) {
            const endY = Math.min(y + dashLen, height - m)
            page.drawLine({
              start: { x: m, y },
              end: { x: m, y: endY },
              thickness: borderWidth,
              color: rgb(borderColor.r, borderColor.g, borderColor.b),
            })
          }
          // Right edge
          for (let y = m; y < height - m; y += dashLen + gapLen) {
            const endY = Math.min(y + dashLen, height - m)
            page.drawLine({
              start: { x: width - m, y },
              end: { x: width - m, y: endY },
              thickness: borderWidth,
              color: rgb(borderColor.r, borderColor.g, borderColor.b),
            })
          }
        } else {
          // Solid border - draw a rectangle with border only
          if (cornerStyle === 'rounded') {
            const r = Math.min(10, (width - margin * 2) / 4, (height - margin * 2) / 4)
            // Draw rounded border using lines and arc approximations
            // Top-left corner to top-right
            page.drawLine({
              start: { x: margin + r, y: height - margin },
              end: { x: width - margin - r, y: height - margin },
              thickness: borderWidth,
              color: rgb(borderColor.r, borderColor.g, borderColor.b),
            })
            // Top-right corner to bottom-right
            page.drawLine({
              start: { x: width - margin, y: height - margin - r },
              end: { x: width - margin, y: margin + r },
              thickness: borderWidth,
              color: rgb(borderColor.r, borderColor.g, borderColor.b),
            })
            // Bottom-right corner to bottom-left
            page.drawLine({
              start: { x: width - margin - r, y: margin },
              end: { x: margin + r, y: margin },
              thickness: borderWidth,
              color: rgb(borderColor.r, borderColor.g, borderColor.b),
            })
            // Bottom-left corner to top-left
            page.drawLine({
              start: { x: margin, y: margin + r },
              end: { x: margin, y: height - margin - r },
              thickness: borderWidth,
              color: rgb(borderColor.r, borderColor.g, borderColor.b),
            })
          } else {
            page.drawRectangle({
              x: margin, y: margin,
              width: width - margin * 2, height: height - margin * 2,
              borderColor: rgb(borderColor.r, borderColor.g, borderColor.b),
              borderWidth: borderWidth,
            })
          }
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_bordered.pdf'),
  },

  // 5. REMOVE ANNOTATIONS
  {
    id: 'remove-annotations',
    name: 'Remove Annotations',
    description: 'Strip comments, form fields, and annotations from PDF',
    icon: Eraser,
    color: '#ef4444',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'What to Remove',
        icon: Eraser,
        controls: [
          {
            type: 'checkbox', key: 'removeComments', label: 'Remove Comments & Markup',
            defaultValue: true, description: 'Delete all comment annotations'
          },
          {
            type: 'checkbox', key: 'removeFormFields', label: 'Remove Form Fields',
            defaultValue: true, description: 'Delete all fillable form fields'
          },
          {
            type: 'checkbox', key: 'removeLinks', label: 'Remove Hyperlinks',
            defaultValue: false, description: 'Delete all link annotations'
          },
          {
            type: 'checkbox', key: 'removeWatermarks', label: 'Remove Watermark Annotations',
            defaultValue: false, description: 'Delete watermark annotations'
          },
        ]
      },
      {
        title: 'Options',
        icon: Settings,
        controls: [
          {
            type: 'checkbox', key: 'flattenFirst', label: 'Flatten Before Removing',
            defaultValue: false, description: 'Render annotations to page content before removal'
          },
          {
            type: 'info', key: 'annotNote', label: '',
            description: 'Form fields will be permanently removed. If you need to preserve their values, use the Flatten PDF tool first.'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const removeComments = settings.removeComments !== false
      const removeFormFields = settings.removeFormFields !== false
      const removeLinks = settings.removeLinks || false

      // Remove form fields
      if (removeFormFields) {
        try {
          const form = doc.getForm()
          const fields = form.getFields()
          for (const field of fields) {
            // For each field, get its widgets and remove the annotation references
            try {
              const widgets = field.acroField.getWidgets()
              for (const widget of widgets) {
                ;(widget as any).delete()
              }
            } catch {
              // Some fields may not support widget deletion
            }
          }
          // Remove the form entirely
          form.updateFieldAppearances()
          // Delete the form from the catalog
          const catalog = doc.catalog
          try {
            catalog.delete(PDFName.of('AcroForm'))
          } catch {
            // Already removed or not present
          }
        } catch {
          // No form exists
        }
      }

      // Remove annotations from each page
      const pages = doc.getPages()
      for (const page of pages) {
        const annotsRaw = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray)
        if (!annotsRaw) continue

        try {
          const annotArray = page.node.lookup(PDFName.of('Annots')) as any
          if (!annotArray) continue

          const toRemove: number[] = []
          for (let i = 0; i < annotArray.size(); i++) {
            try {
              const annotRef = annotArray.get(i)
              const annotDict = doc.context.lookup(annotRef) as any
              const subtype = annotDict.get(PDFName.of('Subtype'))

              if (removeComments && (String(subtype) === '/Text' || String(subtype) === '/Highlight' ||
                String(subtype) === '/StrikeOut' || String(subtype) === '/Underline' ||
                String(subtype) === '/Squiggly' || String(subtype) === '/Stamp' ||
                String(subtype) === '/Caret' || String(subtype) === '/Ink' ||
                String(subtype) === '/Popup' || String(subtype) === '/FreeText')) {
                toRemove.push(i)
              }

              if (removeLinks && String(subtype) === '/Link') {
                toRemove.push(i)
              }
            } catch {
              // Skip problematic annotations
            }
          }

          // Remove annotations in reverse order to preserve indices
          for (let i = toRemove.length - 1; i >= 0; i--) {
            annotArray.remove(toRemove[i])
          }
        } catch {
          // Annotation processing failed for this page, continue
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_cleaned.pdf'),
  },

  // 6. PDF TO CSV
  {
    id: 'pdf-to-csv',
    name: 'PDF to CSV',
    description: 'Extract text content from PDF to CSV format',
    icon: FileSpreadsheet,
    color: '#10b981',
    category: 'Convert PDF',
    sections: [
      {
        title: 'CSV Settings',
        icon: FileSpreadsheet,
        controls: [
          {
            type: 'button-group', key: 'delimiter', label: 'Delimiter',
            defaultValue: 'comma',
            options: [
              { value: 'comma', label: 'Comma (,)' },
              { value: 'semicolon', label: 'Semicolon (;)' },
              { value: 'tab', label: 'Tab' },
              { value: 'pipe', label: 'Pipe (|)' },
            ]
          },
          {
            type: 'text', key: 'pageRange', label: 'Page Range',
            placeholder: 'All pages or e.g., 1,3,5-8', defaultValue: ''
          },
          {
            type: 'checkbox', key: 'includeHeader', label: 'Include Header Row',
            defaultValue: true, description: 'Add column headers to CSV output'
          },
          {
            type: 'checkbox', key: 'detectTables', label: 'Auto-Detect Tables',
            defaultValue: true, description: 'Attempt to detect tabular data in the PDF'
          },
        ]
      },
      {
        title: 'Output',
        icon: Settings,
        controls: [
          {
            type: 'info', key: 'csvNote', label: '',
            description: 'PDF to CSV conversion extracts text and attempts to structure it as tabular data. Complex layouts may not convert perfectly. The PDF is returned unchanged since CSV is a separate format.'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      // PDF to CSV is a format conversion - pdf-lib cannot produce CSV output directly
      // The PDF is returned as-is; actual CSV extraction would require pdfjs-dist text extraction
      // This tool serves as a pass-through with UI for settings
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '.csv'),
  },

  // 7. CSV TO PDF
  {
    id: 'csv-to-pdf',
    name: 'CSV to PDF',
    description: 'Convert CSV data into a formatted PDF table',
    icon: FileSpreadsheet,
    color: '#f59e0b',
    category: 'Convert PDF',
    sections: [
      {
        title: 'CSV Content',
        icon: FileSpreadsheet,
        controls: [
          {
            type: 'textarea', key: 'csvContent', label: 'CSV Data',
            placeholder: 'Name,Age,City\nAlice,30,New York\nBob,25,London\nCharlie,35,Paris',
            rows: 8, defaultValue: 'Name,Age,City\nAlice,30,New York\nBob,25,London\nCharlie,35,Paris'
          },
          {
            type: 'button-group', key: 'delimiter', label: 'Delimiter',
            defaultValue: 'comma',
            options: [
              { value: 'comma', label: 'Comma' },
              { value: 'semicolon', label: 'Semicolon' },
              { value: 'tab', label: 'Tab' },
            ]
          },
        ]
      },
      {
        title: 'Table Formatting',
        icon: Settings,
        controls: [
          {
            type: 'number', key: 'fontSize', label: 'Font Size',
            defaultValue: 10, min: 6, max: 24, step: 1
          },
          {
            type: 'checkbox', key: 'headerRow', label: 'First Row is Header',
            defaultValue: true, description: 'Style the first row as a header'
          },
          {
            type: 'number', key: 'cellPadding', label: 'Cell Padding (pt)',
            defaultValue: 5, min: 2, max: 20, step: 1
          },
          {
            type: 'color', key: 'headerBg', label: 'Header Background',
            defaultValue: '#2563eb'
          },
          {
            type: 'color', key: 'borderColor', label: 'Border Color',
            defaultValue: '#cccccc'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const csvContent = settings.csvContent || ''
      if (!csvContent.trim()) return doc

      const delimiterMap: Record<string, string> = {
        'comma': ',',
        'semicolon': ';',
        'tab': '\t',
      }
      const delimiter = delimiterMap[settings.delimiter || 'comma'] || ','
      const fontSize = settings.fontSize || 10
      const headerRow = settings.headerRow !== false
      const cellPadding = settings.cellPadding || 5
      const headerBgColor = hexToRgb(settings.headerBg || '#2563eb')
      const borderCol = hexToRgb(settings.borderColor || '#cccccc')

      const font = await doc.embedFont(StandardFonts.Helvetica)
      const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

      const rows = csvContent.split('\n').map(line => line.split(delimiter).map(cell => cell.trim()))
      if (rows.length === 0) return doc

      const numCols = Math.max(...rows.map(r => r.length))
      const pageWidth = 595.28
      const pageHeight = 841.89
      const marginX = 40
      const marginY = 40
      const availableWidth = pageWidth - marginX * 2
      const colWidth = availableWidth / numCols
      const rowHeight = fontSize * 1.8 + cellPadding * 2

      let currentPage = doc.addPage([pageWidth, pageHeight])
      let y = pageHeight - marginY

      for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        // Check if we need a new page
        if (y - rowHeight < marginY) {
          currentPage = doc.addPage([pageWidth, pageHeight])
          y = pageHeight - marginY
        }

        const row = rows[rowIdx]
        const isHeader = headerRow && rowIdx === 0

        // Draw cell backgrounds for header
        if (isHeader) {
          currentPage.drawRectangle({
            x: marginX, y: y - rowHeight,
            width: availableWidth, height: rowHeight,
            color: rgb(headerBgColor.r, headerBgColor.g, headerBgColor.b),
          })
        }

        // Draw cells
        for (let colIdx = 0; colIdx < numCols; colIdx++) {
          const cellText = (row[colIdx] || '')
          const x = marginX + colIdx * colWidth

          // Draw cell border
          currentPage.drawRectangle({
            x, y: y - rowHeight,
            width: colWidth, height: rowHeight,
            borderColor: rgb(borderCol.r, borderCol.g, borderCol.b),
            borderWidth: 0.5,
          })

          // Draw text
          const textFont = isHeader ? fontBold : font
          const textColor = isHeader ? rgb(1, 1, 1) : rgb(0, 0, 0)
          // Truncate text to fit in cell
          const maxTextWidth = colWidth - cellPadding * 2
          let displayText = cellText
          while (displayText.length > 0 && textFont.widthOfTextAtSize(displayText, fontSize) > maxTextWidth) {
            displayText = displayText.slice(0, -1)
          }

          currentPage.drawText(displayText, {
            x: x + cellPadding,
            y: y - rowHeight + cellPadding + fontSize * 0.3,
            size: fontSize,
            font: textFont,
            color: textColor,
          })
        }

        y -= rowHeight
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_from_csv.pdf'),
  },

  // 8. ADD DATE STAMP
  {
    id: 'add-date-stamp',
    name: 'Add Date Stamp',
    description: 'Add date and time stamps to PDF pages',
    icon: Calendar,
    color: '#f97316',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Date Stamp Settings',
        icon: Calendar,
        controls: [
          {
            type: 'button-group', key: 'dateFormat', label: 'Date Format',
            defaultValue: 'yyyy-mm-dd',
            options: [
              { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' },
              { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY' },
              { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY' },
              { value: 'full', label: 'Full Date' },
            ]
          },
          {
            type: 'button-group', key: 'position', label: 'Position',
            defaultValue: 'top-right',
            options: [
              { value: 'top-right', label: 'Top Right' },
              { value: 'top-left', label: 'Top Left' },
              { value: 'bottom-right', label: 'Bottom Right' },
              { value: 'bottom-left', label: 'Bottom Left' },
            ]
          },
          {
            type: 'number', key: 'fontSize', label: 'Font Size',
            defaultValue: 10, min: 6, max: 36, step: 1
          },
          {
            type: 'color', key: 'stampColor', label: 'Stamp Color',
            defaultValue: '#ef4444'
          },
          {
            type: 'text', key: 'pageRange', label: 'Pages',
            placeholder: 'All pages or e.g., 1,3,5-8', defaultValue: ''
          },
        ]
      },
      {
        title: 'Custom Date',
        icon: Settings,
        controls: [
          {
            type: 'checkbox', key: 'useCustomDate', label: 'Use Custom Date',
            defaultValue: false, description: 'Override current date with a custom one'
          },
          {
            type: 'text', key: 'customDate', label: 'Custom Date',
            placeholder: '2025-01-15', defaultValue: ''
          },
          {
            type: 'checkbox', key: 'includeTime', label: 'Include Time',
            defaultValue: false, description: 'Add current time to the stamp'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const pages = doc.getPages()
      const pageRange = settings.pageRange || ''
      const targetIndices = parsePageRange(pageRange, pages.length)
      const position = settings.position || 'top-right'
      const fontSize = settings.fontSize || 10
      const stampColor = hexToRgb(settings.stampColor || '#ef4444')
      const includeTime = settings.includeTime || false

      // Build date string
      const now = new Date()
      let dateStr: string

      if (settings.useCustomDate && settings.customDate) {
        dateStr = settings.customDate
      } else {
        const y = now.getFullYear()
        const m = String(now.getMonth() + 1).padStart(2, '0')
        const d = String(now.getDate()).padStart(2, '0')
        const format = settings.dateFormat || 'yyyy-mm-dd'

        switch (format) {
          case 'mm/dd/yyyy':
            dateStr = `${m}/${d}/${y}`
            break
          case 'dd/mm/yyyy':
            dateStr = `${d}/${m}/${y}`
            break
          case 'full':
            dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            break
          default:
            dateStr = `${y}-${m}-${d}`
        }
      }

      if (includeTime) {
        dateStr += ` ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      }

      const textWidth = font.widthOfTextAtSize(dateStr, fontSize)
      const margin = 30

      for (const idx of targetIndices) {
        const page = pages[idx]
        const { width, height } = page.getSize()

        let x: number, y: number
        if (position === 'top-right') {
          x = width - textWidth - margin
          y = height - margin
        } else if (position === 'top-left') {
          x = margin
          y = height - margin
        } else if (position === 'bottom-right') {
          x = width - textWidth - margin
          y = margin
        } else {
          x = margin
          y = margin
        }

        page.drawText(dateStr, {
          x, y, size: fontSize, font,
          color: rgb(stampColor.r, stampColor.g, stampColor.b),
        })
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_stamped.pdf'),
  },

  // 9. PAGE SIZE
  {
    id: 'page-size',
    name: 'Page Size',
    description: 'Change page dimensions and resize PDF pages',
    icon: Maximize,
    color: '#14b8a6',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Target Size',
        icon: Maximize,
        controls: [
          {
            type: 'button-group', key: 'targetSize', label: 'Page Size',
            defaultValue: 'a4',
            options: [
              { value: 'a4', label: 'A4' },
              { value: 'letter', label: 'Letter' },
              { value: 'legal', label: 'Legal' },
              { value: 'a3', label: 'A3' },
              { value: 'a5', label: 'A5' },
              { value: 'custom', label: 'Custom' },
            ]
          },
          {
            type: 'number', key: 'customWidth', label: 'Custom Width (pt)',
            defaultValue: 595, min: 100, max: 5000, step: 1
          },
          {
            type: 'number', key: 'customHeight', label: 'Custom Height (pt)',
            defaultValue: 842, min: 100, max: 5000, step: 1
          },
        ]
      },
      {
        title: 'Scale Mode',
        icon: Settings,
        controls: [
          {
            type: 'button-group', key: 'scaleMode', label: 'Scale Mode',
            defaultValue: 'fit',
            options: [
              { value: 'fit', label: 'Fit (preserve ratio)' },
              { value: 'fill', label: 'Fill (may crop)' },
              { value: 'stretch', label: 'Stretch (distort)' },
            ]
          },
          {
            type: 'info', key: 'sizeNote', label: '',
            description: 'Changing page size adjusts the page media box. Content is repositioned according to the scale mode. "Fit" preserves aspect ratio, "Fill" may crop edges, "Stretch" changes aspect ratio.'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const sizeMap: Record<string, [number, number]> = {
        'a3': [841.89, 1190.55],
        'a4': [595.28, 841.89],
        'a5': [419.53, 595.28],
        'letter': [612, 792],
        'legal': [612, 1008],
      }

      const targetSize = settings.targetSize || 'a4'
      let targetWidth: number, targetHeight: number

      if (targetSize === 'custom') {
        targetWidth = settings.customWidth || 595
        targetHeight = settings.customHeight || 842
      } else {
        [targetWidth, targetHeight] = sizeMap[targetSize] || sizeMap['a4']
      }

      const scaleMode = settings.scaleMode || 'fit'
      const pages = doc.getPages()

      for (const page of pages) {
        const { width: origWidth, height: origHeight } = page.getSize()

        // Calculate scale factors
        const scaleX = targetWidth / origWidth
        const scaleY = targetHeight / origHeight

        let finalScale: number
        if (scaleMode === 'fit') {
          finalScale = Math.min(scaleX, scaleY)
        } else if (scaleMode === 'fill') {
          finalScale = Math.max(scaleX, scaleY)
        } else {
          // stretch - use different scales
          finalScale = 1 // content stays at original position, just resize page
        }

        // Set new page size
        page.setSize(targetWidth, targetHeight)

        if (scaleMode === 'stretch') {
          // For stretch, we adjust the content positioning by centering
          // We can't truly stretch content with pdf-lib, but we can reposition
          const offsetX = (targetWidth - origWidth) / 2
          const offsetY = (targetHeight - origHeight) / 2
          // Translate page content by adjusting crop/media box
          page.setMediaBox(offsetX < 0 ? 0 : -offsetX, offsetY < 0 ? 0 : -offsetY, targetWidth, targetHeight)
        } else {
          // Center the scaled content
          const scaledWidth = origWidth * finalScale
          const scaledHeight = origHeight * finalScale
          const offsetX = (targetWidth - scaledWidth) / 2
          const offsetY = (targetHeight - scaledHeight) / 2

          // Adjust the page content positioning through crop box offset
          if (finalScale !== 1) {
            const { width: mw, height: mh } = page.getMediaBox()
            page.setMediaBox(0, 0, mw * finalScale, mh * finalScale)
          }

          // Center by adjusting the crop box
          if (offsetX > 0 || offsetY > 0) {
            const { x: mediaX, y: mediaY, width: mediaW, height: mediaH } = page.getMediaBox()
            // Add offset to center content
            page.setCropBox(
              mediaX - offsetX / finalScale,
              mediaY - offsetY / finalScale,
              targetWidth / finalScale,
              targetHeight / finalScale
            )
          }
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_resized.pdf'),
  },

  // 10. PDF TO LONG IMAGE
  {
    id: 'pdf-to-long-image',
    name: 'PDF to Long Image',
    description: 'Convert all PDF pages into a single scrolling image',
    icon: Image,
    color: '#ec4899',
    category: 'Convert PDF',
    sections: [
      {
        title: 'Image Settings',
        icon: Image,
        controls: [
          {
            type: 'button-group', key: 'quality', label: 'Quality',
            defaultValue: 'high',
            options: [
              { value: 'low', label: 'Low (72dpi)' },
              { value: 'medium', label: 'Medium (150dpi)' },
              { value: 'high', label: 'High (300dpi)' },
            ]
          },
          {
            type: 'button-group', key: 'orientation', label: 'Orientation',
            defaultValue: 'portrait',
            options: [
              { value: 'portrait', label: 'Portrait' },
              { value: 'landscape', label: 'Landscape' },
            ]
          },
          {
            type: 'checkbox', key: 'addSeparators', label: 'Add Page Separators',
            defaultValue: true, description: 'Draw a thin line between pages'
          },
        ]
      },
      {
        title: 'Info',
        icon: Settings,
        controls: [
          {
            type: 'info', key: 'longImageNote', label: '',
            description: 'True long-image conversion requires canvas-based rendering which pdf-lib cannot perform. The PDF is returned unchanged. Use a dedicated PDF-to-image converter for this functionality.'
          },
        ]
      }
    ],
    processPDF: async (doc) => {
      // PDF to long image requires canvas-based rendering
      // pdf-lib cannot render pages to pixel data or stitch images together
      // This is a pass-through tool - the UI provides the settings for a future implementation
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_long_image.pdf'),
  },

  // 11. MULTI-STAMP
  {
    id: 'multi-stamp',
    name: 'Multi Stamp',
    description: 'Apply multiple custom stamps to PDF pages',
    icon: Stamp,
    color: '#a855f7',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Stamp 1',
        icon: Stamp,
        controls: [
          {
            type: 'text', key: 'stamp1Text', label: 'Stamp 1 Text',
            placeholder: 'APPROVED', defaultValue: 'APPROVED'
          },
          {
            type: 'button-group', key: 'stamp1Position', label: 'Position',
            defaultValue: 'top-right',
            options: [
              { value: 'top-left', label: 'Top Left' },
              { value: 'top-right', label: 'Top Right' },
              { value: 'center', label: 'Center' },
              { value: 'bottom-left', label: 'Bottom Left' },
              { value: 'bottom-right', label: 'Bottom Right' },
            ]
          },
          {
            type: 'color', key: 'stamp1Color', label: 'Color',
            defaultValue: '#22c55e'
          },
          {
            type: 'number', key: 'stamp1FontSize', label: 'Font Size',
            defaultValue: 28, min: 8, max: 72, step: 2
          },
        ]
      },
      {
        title: 'Stamp 2',
        icon: Stamp,
        controls: [
          {
            type: 'text', key: 'stamp2Text', label: 'Stamp 2 Text',
            placeholder: 'CONFIDENTIAL', defaultValue: 'CONFIDENTIAL'
          },
          {
            type: 'button-group', key: 'stamp2Position', label: 'Position',
            defaultValue: 'center',
            options: [
              { value: 'top-left', label: 'Top Left' },
              { value: 'top-right', label: 'Top Right' },
              { value: 'center', label: 'Center' },
              { value: 'bottom-left', label: 'Bottom Left' },
              { value: 'bottom-right', label: 'Bottom Right' },
            ]
          },
          {
            type: 'color', key: 'stamp2Color', label: 'Color',
            defaultValue: '#ef4444'
          },
          {
            type: 'number', key: 'stamp2FontSize', label: 'Font Size',
            defaultValue: 28, min: 8, max: 72, step: 2
          },
        ]
      },
      {
        title: 'Stamp 3',
        icon: Stamp,
        controls: [
          {
            type: 'text', key: 'stamp3Text', label: 'Stamp 3 Text',
            placeholder: 'DRAFT', defaultValue: 'DRAFT'
          },
          {
            type: 'button-group', key: 'stamp3Position', label: 'Position',
            defaultValue: 'bottom-left',
            options: [
              { value: 'top-left', label: 'Top Left' },
              { value: 'top-right', label: 'Top Right' },
              { value: 'center', label: 'Center' },
              { value: 'bottom-left', label: 'Bottom Left' },
              { value: 'bottom-right', label: 'Bottom Right' },
            ]
          },
          {
            type: 'color', key: 'stamp3Color', label: 'Color',
            defaultValue: '#f59e0b'
          },
          {
            type: 'number', key: 'stamp3FontSize', label: 'Font Size',
            defaultValue: 28, min: 8, max: 72, step: 2
          },
        ]
      },
      {
        title: 'Apply To',
        icon: Settings,
        controls: [
          {
            type: 'text', key: 'pageRange', label: 'Pages',
            placeholder: 'All pages or e.g., 1,3,5-8', defaultValue: ''
          },
          {
            type: 'range', key: 'opacity', label: 'Stamp Opacity',
            defaultValue: 50, min: 10, max: 100, step: 5
          },
          {
            type: 'number', key: 'rotation', label: 'Rotation (degrees)',
            defaultValue: 0, min: -180, max: 180, step: 15
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const font = await doc.embedFont(StandardFonts.HelveticaBold)
      const pages = doc.getPages()
      const pageRange = settings.pageRange || ''
      const targetIndices = parsePageRange(pageRange, pages.length)
      const opacity = (settings.opacity || 50) / 100
      const rotation = settings.rotation || 0

      const stamps = [
        { text: settings.stamp1Text, position: settings.stamp1Position, color: settings.stamp1Color, fontSize: settings.stamp1FontSize },
        { text: settings.stamp2Text, position: settings.stamp2Position, color: settings.stamp2Color, fontSize: settings.stamp2FontSize },
        { text: settings.stamp3Text, position: settings.stamp3Position, color: settings.stamp3Color, fontSize: settings.stamp3FontSize },
      ].filter(s => s.text && s.text.trim())

      for (const idx of targetIndices) {
        const page = pages[idx]
        const { width, height } = page.getSize()

        for (const stamp of stamps) {
          const text = stamp.text!
          const pos = stamp.position || 'center'
          const fontSize = stamp.fontSize || 28
          const { r, g, b } = hexToRgb(stamp.color || '#ef4444')

          const textWidth = font.widthOfTextAtSize(text, fontSize)
          const textHeight = fontSize

          let x: number, y: number
          if (pos === 'top-left') { x = 40; y = height - 50 }
          else if (pos === 'top-right') { x = width - textWidth - 40; y = height - 50 }
          else if (pos === 'bottom-left') { x = 40; y = 50 }
          else if (pos === 'bottom-right') { x = width - textWidth - 40; y = 50 }
          else { x = (width - textWidth) / 2; y = (height - textHeight) / 2 }

          // Draw stamp background rectangle
          page.drawRectangle({
            x: x - 8, y: y - 4,
            width: textWidth + 16, height: textHeight + 8,
            color: rgb(r, g, b),
            opacity: opacity * 0.3,
            borderColor: rgb(r, g, b),
            borderWidth: 2,
          })

          // Draw stamp text
          page.drawText(text, {
            x, y, size: fontSize, font,
            color: rgb(r, g, b),
            opacity: opacity,
            rotate: degrees(rotation),
          })
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_multi_stamped.pdf'),
  },

  // 12. WATERMARK IMAGE
  {
    id: 'watermark-image',
    name: 'Watermark Image',
    description: 'Add an image as a watermark to PDF pages',
    icon: Layers2,
    color: '#06b6d4',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Image Watermark',
        icon: Layers2,
        controls: [
          {
            type: 'file', key: 'imageFile', label: 'Upload Watermark Image',
            accept: 'image/png,image/jpeg'
          },
          {
            type: 'range', key: 'opacity', label: 'Opacity',
            defaultValue: 20, min: 5, max: 80, step: 5
          },
          {
            type: 'button-group', key: 'position', label: 'Position',
            defaultValue: 'center',
            options: [
              { value: 'center', label: 'Center' },
              { value: 'tile', label: 'Tiled' },
              { value: 'top-right', label: 'Top Right' },
              { value: 'bottom-left', label: 'Bottom Left' },
            ]
          },
          {
            type: 'range', key: 'scale', label: 'Scale',
            defaultValue: 50, min: 10, max: 100, step: 5
          },
        ]
      },
      {
        title: 'Rotation & Pages',
        icon: Settings,
        controls: [
          {
            type: 'number', key: 'rotation', label: 'Rotation (degrees)',
            defaultValue: 0, min: -180, max: 180, step: 15
          },
          {
            type: 'text', key: 'pageRange', label: 'Pages',
            placeholder: 'All pages or e.g., 1,3,5-8', defaultValue: ''
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

      const opacity = (settings.opacity || 20) / 100
      const scale = (settings.scale || 50) / 100
      const position = settings.position || 'center'
      const rotation = settings.rotation || 0
      const pageRange = settings.pageRange || ''
      const pages = doc.getPages()
      const targetIndices = parsePageRange(pageRange, pages.length)

      const dims = image.scale(scale)

      for (const idx of targetIndices) {
        const page = pages[idx]
        const { width, height } = page.getSize()

        if (position === 'tile') {
          // Tile the image across the page
          const spacingX = dims.width * 2.5
          const spacingY = dims.height * 2.5
          for (let y = 0; y < height; y += spacingY) {
            for (let x = 0; x < width; x += spacingX) {
              page.drawImage(image, {
                x, y,
                width: dims.width, height: dims.height,
                opacity,
                rotate: degrees(rotation),
              })
            }
          }
        } else {
          let x: number, y: number
          if (position === 'center') {
            x = (width - dims.width) / 2
            y = (height - dims.height) / 2
          } else if (position === 'top-right') {
            x = width - dims.width - 30
            y = height - dims.height - 30
          } else {
            x = 30
            y = 30
          }

          page.drawImage(image, {
            x, y,
            width: dims.width, height: dims.height,
            opacity,
            rotate: degrees(rotation),
          })
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_watermarked.pdf'),
  },

  // 13. PAGE COUNTER
  {
    id: 'page-counter',
    name: 'Page Counter',
    description: 'Count pages and view document statistics',
    icon: FileDigit,
    color: '#64748b',
    category: 'View & Analyze',
    sections: [
      {
        title: 'Document Statistics',
        icon: FileDigit,
        controls: [
          {
            type: 'info', key: 'counterInfo', label: '',
            description: 'Upload a PDF to see page count, file size, and document statistics. This tool is view-only and does not modify the PDF.'
          },
          {
            type: 'checkbox', key: 'countBySize', label: 'Count by Page Size Groups',
            defaultValue: false, description: 'Group pages by their dimensions'
          },
          {
            type: 'checkbox', key: 'showOrientation', label: 'Show Orientation Info',
            defaultValue: true, description: 'Display portrait/landscape classification'
          },
        ]
      }
    ],
    processPDF: async (doc) => {
      // Page counter is a viewer-only tool - just return the document as-is
      // The UI displays page count and other stats from the loaded document
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_counted.pdf'),
  },

  // 14. REMOVE METADATA
  {
    id: 'remove-metadata',
    name: 'Remove Metadata',
    description: 'Strip all metadata and personal information from PDF',
    icon: EyeOff,
    color: '#dc2626',
    category: 'Security & Privacy',
    sections: [
      {
        title: 'What to Remove',
        icon: EyeOff,
        controls: [
          {
            type: 'checkbox', key: 'removeTitle', label: 'Remove Title',
            defaultValue: true
          },
          {
            type: 'checkbox', key: 'removeAuthor', label: 'Remove Author',
            defaultValue: true
          },
          {
            type: 'checkbox', key: 'removeSubject', label: 'Remove Subject',
            defaultValue: true
          },
          {
            type: 'checkbox', key: 'removeKeywords', label: 'Remove Keywords',
            defaultValue: true
          },
          {
            type: 'checkbox', key: 'removeCreator', label: 'Remove Creator',
            defaultValue: true
          },
          {
            type: 'checkbox', key: 'removeProducer', label: 'Remove Producer',
            defaultValue: true
          },
          {
            type: 'checkbox', key: 'removeDates', label: 'Remove Creation/Modification Dates',
            defaultValue: true
          },
        ]
      },
      {
        title: 'Advanced',
        icon: Settings,
        controls: [
          {
            type: 'checkbox', key: 'removeAll', label: 'Remove ALL Metadata',
            defaultValue: false, description: 'Override individual selections and strip everything'
          },
          {
            type: 'info', key: 'metaNote', label: '',
            description: 'Removing metadata helps protect privacy. This action cannot be undone once the file is saved.'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const removeAll = settings.removeAll || false

      if (removeAll || settings.removeTitle) doc.setTitle('')
      if (removeAll || settings.removeAuthor) doc.setAuthor('')
      if (removeAll || settings.removeSubject) doc.setSubject('')
      if (removeAll || settings.removeKeywords) doc.setKeywords([])
      if (removeAll || settings.removeCreator) doc.setCreator('')
      if (removeAll || settings.removeProducer) doc.setProducer('')
      if (removeAll || settings.removeDates) {
        doc.setCreationDate(new Date(0))
        doc.setModificationDate(new Date(0))
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_anonymized.pdf'),
  },

  // 15. ADD TABLE
  {
    id: 'add-table',
    name: 'Add Table',
    description: 'Insert a formatted data table into your PDF',
    icon: Table,
    color: '#0ea5e9',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Table Structure',
        icon: Table,
        controls: [
          {
            type: 'number', key: 'columns', label: 'Number of Columns',
            defaultValue: 3, min: 1, max: 20, step: 1
          },
          {
            type: 'number', key: 'rows', label: 'Number of Rows',
            defaultValue: 4, min: 1, max: 50, step: 1
          },
          {
            type: 'number', key: 'cellWidth', label: 'Cell Width (pt)',
            defaultValue: 120, min: 30, max: 400, step: 10
          },
          {
            type: 'text', key: 'headerText', label: 'Header Text (comma-separated)',
            placeholder: 'Column 1, Column 2, Column 3', defaultValue: 'Name, Value, Status'
          },
        ]
      },
      {
        title: 'Table Data',
        icon: Settings,
        controls: [
          {
            type: 'textarea', key: 'tableData', label: 'Row Data (one row per line, comma-separated)',
            placeholder: 'Item A, 100, Active\nItem B, 200, Pending\nItem C, 300, Complete',
            rows: 6, defaultValue: 'Item A, 100, Active\nItem B, 200, Pending\nItem C, 300, Complete'
          },
        ]
      },
      {
        title: 'Position & Style',
        icon: LayoutGrid,
        controls: [
          {
            type: 'number', key: 'posX', label: 'X Position',
            defaultValue: 50, min: 0, max: 2000, step: 10
          },
          {
            type: 'number', key: 'posY', label: 'Y Position',
            defaultValue: 700, min: 0, max: 2000, step: 10
          },
          {
            type: 'number', key: 'fontSize', label: 'Font Size',
            defaultValue: 9, min: 6, max: 24, step: 1
          },
          {
            type: 'color', key: 'headerBg', label: 'Header Background',
            defaultValue: '#1e40af'
          },
          {
            type: 'color', key: 'borderColor', label: 'Border Color',
            defaultValue: '#94a3b8'
          },
          {
            type: 'button-group', key: 'borderStyle', label: 'Border Style',
            defaultValue: 'solid',
            options: [
              { value: 'solid', label: 'Solid' },
              { value: 'thin', label: 'Thin' },
              { value: 'none', label: 'No Border' },
            ]
          },
          {
            type: 'number', key: 'targetPage', label: 'Target Page',
            defaultValue: 1, min: 1, max: 999
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const numCols = settings.columns || 3
      const cellWidth = settings.cellWidth || 120
      const fontSize = settings.fontSize || 9
      const posX = settings.posX || 50
      const posY = settings.posY || 700
      const targetPage = Math.min(settings.targetPage || 1, doc.getPageCount())
      const headerText = settings.headerText || ''
      const tableData = settings.tableData || ''
      const headerBgColor = hexToRgb(settings.headerBg || '#1e40af')
      const borderCol = hexToRgb(settings.borderColor || '#94a3b8')
      const borderStyle = settings.borderStyle || 'solid'
      const borderWidth = borderStyle === 'thin' ? 0.5 : borderStyle === 'solid' ? 1 : 0

      const font = await doc.embedFont(StandardFonts.Helvetica)
      const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
      const page = doc.getPage(targetPage - 1)

      const rowHeight = fontSize * 2.2
      const cellPadding = 4

      // Parse header
      const headers = headerText.split(',').map(h => h.trim())
      // Parse data rows
      const dataRows = tableData.split('\n').filter(r => r.trim()).map(r => r.split(',').map(c => c.trim()))
      const totalRows = dataRows.length + (headers.length > 0 ? 1 : 0)
      const totalWidth = numCols * cellWidth

      let currentY = posY

      // Draw header row
      if (headers.length > 0) {
        // Header background
        page.drawRectangle({
          x: posX, y: currentY - rowHeight,
          width: totalWidth, height: rowHeight,
          color: rgb(headerBgColor.r, headerBgColor.g, headerBgColor.b),
        })

        // Header text
        for (let col = 0; col < numCols; col++) {
          const text = headers[col] || `Col ${col + 1}`
          let displayText = text
          const maxW = cellWidth - cellPadding * 2
          while (displayText.length > 0 && fontBold.widthOfTextAtSize(displayText, fontSize) > maxW) {
            displayText = displayText.slice(0, -1)
          }

          page.drawText(displayText, {
            x: posX + col * cellWidth + cellPadding,
            y: currentY - rowHeight + cellPadding + fontSize * 0.3,
            size: fontSize,
            font: fontBold,
            color: rgb(1, 1, 1),
          })
        }

        currentY -= rowHeight
      }

      // Draw data rows
      for (let rowIdx = 0; rowIdx < dataRows.length; rowIdx++) {
        const row = dataRows[rowIdx]

        // Alternate row background
        if (rowIdx % 2 === 1) {
          page.drawRectangle({
            x: posX, y: currentY - rowHeight,
            width: totalWidth, height: rowHeight,
            color: rgb(0.95, 0.95, 0.97),
          })
        }

        // Cell borders
        if (borderWidth > 0) {
          for (let col = 0; col < numCols; col++) {
            page.drawRectangle({
              x: posX + col * cellWidth, y: currentY - rowHeight,
              width: cellWidth, height: rowHeight,
              borderColor: rgb(borderCol.r, borderCol.g, borderCol.b),
              borderWidth,
            })
          }
        }

        // Cell text
        for (let col = 0; col < numCols; col++) {
          const text = row[col] || ''
          let displayText = text
          const maxW = cellWidth - cellPadding * 2
          while (displayText.length > 0 && font.widthOfTextAtSize(displayText, fontSize) > maxW) {
            displayText = displayText.slice(0, -1)
          }

          page.drawText(displayText, {
            x: posX + col * cellWidth + cellPadding,
            y: currentY - rowHeight + cellPadding + fontSize * 0.3,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          })
        }

        currentY -= rowHeight
      }

      // Draw outer border around the entire table
      if (borderWidth > 0) {
        page.drawRectangle({
          x: posX, y: posY - totalRows * rowHeight,
          width: totalWidth, height: totalRows * rowHeight,
          borderColor: rgb(borderCol.r, borderCol.g, borderCol.b),
          borderWidth: borderWidth * 1.5,
        })
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_with_table.pdf'),
  },

  // 16. ROTATE ALL
  {
    id: 'rotate-all',
    name: 'Rotate All Pages',
    description: 'Rotate all pages by a specified angle',
    icon: RotateCw,
    color: '#8b5cf6',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Rotation Settings',
        icon: RotateCw,
        controls: [
          {
            type: 'button-group', key: 'angle', label: 'Rotation Angle',
            defaultValue: '90',
            options: [
              { value: '90', label: '90°' },
              { value: '180', label: '180°' },
              { value: '270', label: '270°' },
            ]
          },
          {
            type: 'button-group', key: 'direction', label: 'Direction',
            defaultValue: 'clockwise',
            options: [
              { value: 'clockwise', label: 'Clockwise' },
              { value: 'counter-clockwise', label: 'Counter-Clockwise' },
            ]
          },
          {
            type: 'text', key: 'pageRange', label: 'Pages',
            placeholder: 'All pages or e.g., 1,3,5-8', defaultValue: ''
          },
        ]
      },
      {
        title: 'Options',
        icon: Settings,
        controls: [
          {
            type: 'checkbox', key: 'adjustPageSize', label: 'Adjust Page Size',
            defaultValue: true, description: 'Swap width/height for 90°/270° rotations to maintain orientation'
          },
          {
            type: 'info', key: 'rotateNote', label: '',
            description: 'Rotation is applied to the page content. For 90° and 270° rotations, the page dimensions are swapped to maintain proper layout.'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      let angle = parseInt(settings.angle || '90')
      const direction = settings.direction || 'clockwise'
      const pageRange = settings.pageRange || ''
      const adjustPageSize = settings.adjustPageSize !== false
      const pages = doc.getPages()
      const targetIndices = parsePageRange(pageRange, pages.length)

      if (direction === 'counter-clockwise') {
        angle = 360 - angle
      }

      for (const idx of targetIndices) {
        const page = pages[idx]

        // Get existing rotation
        const currentRotation = page.getRotation().angle
        const newRotation = (currentRotation + angle) % 360

        page.setRotation(degrees(newRotation))

        // For 90/270 degree rotations, swap page dimensions if requested
        if (adjustPageSize && (angle === 90 || angle === 270)) {
          const { width, height } = page.getSize()
          // The page size is automatically handled by pdf-lib rotation,
          // but we can adjust the media box for proper display
          if (width !== height) {
            page.setSize(height, width)
          }
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_rotated.pdf'),
  },

  // 17. PDF TO BMP
  {
    id: 'pdf-to-bmp',
    name: 'PDF to BMP',
    description: 'Convert PDF pages to BMP image format',
    icon: FileImage,
    color: '#78716c',
    category: 'Convert PDF',
    sections: [
      {
        title: 'Conversion Settings',
        icon: FileImage,
        controls: [
          {
            type: 'button-group', key: 'quality', label: 'Quality',
            defaultValue: 'high',
            options: [
              { value: 'low', label: 'Low (72dpi)' },
              { value: 'medium', label: 'Medium (150dpi)' },
              { value: 'high', label: 'High (300dpi)' },
            ]
          },
          {
            type: 'text', key: 'pageRange', label: 'Pages',
            placeholder: 'All pages or e.g., 1,3,5-8', defaultValue: ''
          },
          {
            type: 'checkbox', key: 'monochrome', label: 'Monochrome (1-bit)',
            defaultValue: false, description: 'Output as black and white only'
          },
          {
            type: 'checkbox', key: 'grayscale', label: 'Grayscale',
            defaultValue: false, description: 'Output as 8-bit grayscale'
          },
        ]
      },
      {
        title: 'Info',
        icon: Settings,
        controls: [
          {
            type: 'info', key: 'bmpNote', label: '',
            description: 'BMP conversion requires canvas-based rendering which pdf-lib cannot perform. The PDF is returned unchanged. Use a dedicated PDF-to-image converter for BMP output.'
          },
        ]
      }
    ],
    processPDF: async (doc) => {
      // PDF to BMP requires canvas-based pixel rendering
      // pdf-lib works with PDF structure only and cannot render to BMP format
      // This is a pass-through - the UI provides settings for future implementation
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '.bmp'),
  },

  // 18. ADD FOOTER
  {
    id: 'add-footer',
    name: 'Add Footer',
    description: 'Add custom footer text to all PDF pages',
    icon: ArrowDownToLine,
    color: '#059669',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Footer Content',
        icon: ArrowDownToLine,
        controls: [
          {
            type: 'text', key: 'footerText', label: 'Footer Text',
            placeholder: 'Confidential Document', defaultValue: 'Confidential Document'
          },
          {
            type: 'button-group', key: 'position', label: 'Position',
            defaultValue: 'center',
            options: [
              { value: 'left', label: 'Left' },
              { value: 'center', label: 'Center' },
              { value: 'right', label: 'Right' },
            ]
          },
          {
            type: 'number', key: 'fontSize', label: 'Font Size',
            defaultValue: 8, min: 6, max: 24, step: 1
          },
          {
            type: 'color', key: 'textColor', label: 'Text Color',
            defaultValue: '#64748b'
          },
          {
            type: 'number', key: 'margin', label: 'Bottom Margin (pt)',
            defaultValue: 20, min: 10, max: 80, step: 5
          },
        ]
      },
      {
        title: 'Page Numbers',
        icon: Hash,
        controls: [
          {
            type: 'checkbox', key: 'includePageNumbers', label: 'Include Page Numbers',
            defaultValue: false, description: 'Append page numbers after footer text'
          },
          {
            type: 'button-group', key: 'pageFormat', label: 'Page Number Format',
            defaultValue: 'number',
            options: [
              { value: 'number', label: '1, 2, 3' },
              { value: 'page-of', label: 'Page X of Y' },
              { value: 'dash', label: '- 1 -' },
            ]
          },
        ]
      },
      {
        title: 'Separator',
        icon: Settings,
        controls: [
          {
            type: 'checkbox', key: 'showSeparator', label: 'Show Separator Line',
            defaultValue: true, description: 'Draw a thin line above the footer'
          },
          {
            type: 'color', key: 'separatorColor', label: 'Separator Color',
            defaultValue: '#cbd5e1'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const pages = doc.getPages()
      const footerText = settings.footerText || ''
      const position = settings.position || 'center'
      const fontSize = settings.fontSize || 8
      const textColor = hexToRgb(settings.textColor || '#64748b')
      const margin = settings.margin || 20
      const includePageNumbers = settings.includePageNumbers || false
      const pageFormat = settings.pageFormat || 'number'
      const showSeparator = settings.showSeparator !== false
      const separatorColor = hexToRgb(settings.separatorColor || '#cbd5e1')

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()

        // Build full footer text
        let fullText = footerText
        if (includePageNumbers) {
          let pageStr: string
          switch (pageFormat) {
            case 'page-of':
              pageStr = `Page ${i + 1} of ${pages.length}`
              break
            case 'dash':
              pageStr = `- ${i + 1} -`
              break
            default:
              pageStr = `${i + 1}`
          }
          fullText = fullText ? `${fullText}    ${pageStr}` : pageStr
        }

        if (fullText) {
          const textWidth = font.widthOfTextAtSize(fullText, fontSize)
          let x: number
          if (position === 'left') {
            x = margin
          } else if (position === 'right') {
            x = width - textWidth - margin
          } else {
            x = (width - textWidth) / 2
          }

          const y = margin

          // Draw separator line
          if (showSeparator) {
            page.drawLine({
              start: { x: margin, y: y + fontSize + 6 },
              end: { x: width - margin, y: y + fontSize + 6 },
              thickness: 0.5,
              color: rgb(separatorColor.r, separatorColor.g, separatorColor.b),
            })
          }

          // Draw footer text
          page.drawText(fullText, {
            x, y, size: fontSize, font,
            color: rgb(textColor.r, textColor.g, textColor.b),
          })
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_footer.pdf'),
  },
]
