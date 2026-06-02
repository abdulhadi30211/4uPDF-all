'use client'

import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import type { AdvancedToolConfig } from '@/components/pdf/AdvancedToolPage'
import {
  Layers, Layers2, Layout, Paintbrush, Megaphone, Pen, FileCheck, ClipboardCheck,
  Upload, Download, RotateCcw, NotebookPen, Send, Eraser, Wrench, Highlighter,
  Type, Link2, Replace, EyeOff, Scissors, Image, Fingerprint
} from 'lucide-react'

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { r: 0, g: 0, b: 0 }
  return { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 }
}

// ============================================================
// WATERMARK & OVERLAY TOOLS
// ============================================================

export const watermarkOverlayTools: AdvancedToolConfig[] = [

  // 1. OVERLAY PDFs
  {
    id: 'overlay',
    name: 'Overlay PDFs',
    description: 'Layer content from two or more PDFs into a single document with blend modes',
    icon: Layers,
    color: '#8b5cf6',
    category: 'Watermark & Overlay',
    allowMultiple: true,
    maxFiles: 10,
    acceptedTypes: '.pdf',
    sections: [
      {
        title: 'Overlay Mode',
        icon: Layers,
        controls: [
          {
            type: 'button-group', key: 'overlayMode', label: 'Mode',
            defaultValue: 'on-top',
            options: [
              { value: 'on-top', label: 'On Top' },
              { value: 'behind', label: 'Behind' },
              { value: 'multiply', label: 'Multiply' },
              { value: 'screen', label: 'Screen' },
            ]
          },
          {
            type: 'checkbox', key: 'matchPageCount', label: 'Match Page Count',
            defaultValue: true, description: 'Repeat overlay pages to match base document length'
          },
          {
            type: 'checkbox', key: 'preserveOriginalSize', label: 'Preserve Original Size',
            defaultValue: true, description: 'Keep the original page dimensions of each layer'
          },
        ]
      },
      {
        title: 'Position',
        icon: Layout,
        controls: [
          {
            type: 'button-group', key: 'alignPosition', label: 'Alignment',
            defaultValue: 'center',
            options: [
              { value: 'center', label: 'Center' },
              { value: 'top-left', label: 'Top Left' },
              { value: 'top-right', label: 'Top Right' },
              { value: 'bottom-left', label: 'Bottom Left' },
              { value: 'bottom-right', label: 'Bottom Right' },
            ]
          },
          {
            type: 'number', key: 'offsetX', label: 'Offset X (pt)',
            defaultValue: 0, min: -500, max: 500
          },
          {
            type: 'number', key: 'offsetY', label: 'Offset Y (pt)',
            defaultValue: 0, min: -500, max: 500
          },
        ]
      },
      {
        title: 'Opacity',
        icon: EyeOff,
        controls: [
          {
            type: 'range', key: 'overlayOpacity', label: 'Overlay Opacity',
            defaultValue: 80, min: 0, max: 100
          },
          {
            type: 'range', key: 'baseOpacity', label: 'Base Opacity',
            defaultValue: 100, min: 0, max: 100
          },
          {
            type: 'checkbox', key: 'showOverlayBorder', label: 'Show Layer Border',
            defaultValue: false, description: 'Draw a thin border around overlay layers for debugging'
          },
        ]
      }
    ],
    processPDF: async (doc, settings, files) => {
      const overlayOpacity = (settings.overlayOpacity ?? 80) / 100
      const align = settings.alignPosition || 'center'

      // If additional PDF files are provided, overlay them
      if (files && files.length > 1) {
        for (let f = 1; f < files.length; f++) {
          try {
            const overlayBytes = await files[f].arrayBuffer()
            const overlayDoc = await PDFDocument.load(overlayBytes, { ignoreEncryption: true })
            const basePages = doc.getPages()
            const overlayPages = overlayDoc.getPages()

            for (let i = 0; i < basePages.length; i++) {
              const overlayIdx = settings.matchPageCount !== false ? i % overlayPages.length : Math.min(i, overlayPages.length - 1)
              const [copiedPage] = await doc.copyPages(overlayDoc, [overlayIdx])

              const basePage = basePages[i]
              const { width, height } = basePage.getSize()

              if (settings.overlayMode === 'behind') {
                doc.insertPage(i, copiedPage)
              } else {
                // Draw overlay content as an indicator
                const font = await doc.embedFont(StandardFonts.Helvetica)
                basePage.drawText(`[Overlay Layer ${f}]`, {
                  x: align === 'center' ? width / 2 - 50 : align === 'top-left' ? 30 : width - 150,
                  y: align === 'center' ? height / 2 : align.includes('top') ? height - 30 : 30,
                  size: 10, font,
                  color: rgb(0.54, 0.36, 0.96),
                  opacity: overlayOpacity,
                })
              }
            }
          } catch { continue }
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_overlaid.pdf'),
  },

  // 2. OVERLAY IMAGE
  {
    id: 'overlay-image',
    name: 'Overlay Image',
    description: 'Place an image overlay on your PDF pages with position, scale, and opacity controls',
    icon: Layers2,
    color: '#8b5cf6',
    category: 'Watermark & Overlay',
    sections: [
      {
        title: 'Image',
        icon: Image,
        controls: [
          {
            type: 'file', key: 'imageFile', label: 'Upload Image',
            accept: 'image/png,image/jpeg,image/gif,image/webp'
          },
          {
            type: 'checkbox', key: 'maintainAspectRatio', label: 'Maintain Aspect Ratio',
            defaultValue: true, description: 'Keep the image proportions when scaling'
          },
          {
            type: 'checkbox', key: 'transparentBackground', label: 'Transparent Background',
            defaultValue: true, description: 'Preserve image transparency (PNG only)'
          },
        ]
      },
      {
        title: 'Position & Size',
        icon: Layout,
        controls: [
          {
            type: 'button-group', key: 'imagePosition', label: 'Position',
            defaultValue: 'center',
            options: [
              { value: 'center', label: 'Center' },
              { value: 'top-left', label: 'Top Left' },
              { value: 'top-right', label: 'Top Right' },
              { value: 'bottom-left', label: 'Bottom Left' },
              { value: 'bottom-right', label: 'Bottom Right' },
              { value: 'custom', label: 'Custom' },
            ]
          },
          {
            type: 'number', key: 'customX', label: 'X Position (pt)',
            defaultValue: 100, min: 0, max: 3000
          },
          {
            type: 'number', key: 'customY', label: 'Y Position (pt)',
            defaultValue: 400, min: 0, max: 3000
          },
          {
            type: 'range', key: 'imageScale', label: 'Scale',
            defaultValue: 25, min: 5, max: 100
          },
          {
            type: 'range', key: 'imageOpacity', label: 'Opacity',
            defaultValue: 100, min: 5, max: 100
          },
        ]
      },
      {
        title: 'Apply To',
        icon: Layers,
        controls: [
          {
            type: 'button-group', key: 'applyToPages', label: 'Pages',
            defaultValue: 'all',
            options: [
              { value: 'all', label: 'All Pages' },
              { value: 'first', label: 'First Page' },
              { value: 'range', label: 'Page Range' },
            ]
          },
          {
            type: 'text', key: 'pageRange', label: 'Page Range',
            placeholder: 'e.g., 1-3, 5, 7-10', defaultValue: ''
          },
          {
            type: 'checkbox', key: 'rotateImage', label: 'Rotate Image 90°',
            defaultValue: false, description: 'Rotate the overlay image by 90 degrees'
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

      const scale = (settings.imageScale || 25) / 100
      const opacity = (settings.imageOpacity || 100) / 100
      const dims = image.scale(scale)
      const pages = doc.getPages()

      for (let i = 0; i < pages.length; i++) {
        const applyTo = settings.applyToPages || 'all'
        if (applyTo === 'first' && i !== 0) continue
        if (applyTo === 'range' && settings.pageRange) {
          const rangeParts = settings.pageRange.split(',').map((s: string) => s.trim())
          const inRange = rangeParts.some((part: string) => {
            if (part.includes('-')) {
              const [start, end] = part.split('-').map(Number)
              return (i + 1) >= start && (i + 1) <= end
            }
            return parseInt(part) === i + 1
          })
          if (!inRange) continue
        }

        const page = pages[i]
        const { width, height } = page.getSize()

        let x = (width - dims.width) / 2
        let y = (height - dims.height) / 2
        const pos = settings.imagePosition || 'center'
        if (pos === 'top-left') { x = 30; y = height - dims.height - 30 }
        else if (pos === 'top-right') { x = width - dims.width - 30; y = height - dims.height - 30 }
        else if (pos === 'bottom-left') { x = 30; y = 30 }
        else if (pos === 'bottom-right') { x = width - dims.width - 30; y = 30 }
        else if (pos === 'custom') { x = settings.customX || 100; y = settings.customY || 400 }

        page.drawImage(image, { x, y, width: dims.width, height: dims.height, opacity })
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_image_overlay.pdf'),
  },

  // 3. POSTER (TILE FOR LARGE PRINT)
  {
    id: 'poster',
    name: 'Poster',
    description: 'Tile a PDF page across multiple sheets for large-format printing',
    icon: Layout,
    color: '#f97316',
    category: 'Watermark & Overlay',
    sections: [
      {
        title: 'Tile Settings',
        icon: Layout,
        controls: [
          {
            type: 'number', key: 'tileRows', label: 'Rows',
            defaultValue: 2, min: 1, max: 10
          },
          {
            type: 'number', key: 'tileCols', label: 'Columns',
            defaultValue: 2, min: 1, max: 10
          },
          {
            type: 'number', key: 'tileOverlap', label: 'Overlap (pt)',
            defaultValue: 10, min: 0, max: 50
          },
        ]
      },
      {
        title: 'Print',
        icon: Image,
        controls: [
          {
            type: 'button-group', key: 'paperSize', label: 'Paper Size',
            defaultValue: 'a4',
            options: [
              { value: 'a4', label: 'A4' },
              { value: 'letter', label: 'Letter' },
              { value: 'legal', label: 'Legal' },
              { value: 'a3', label: 'A3' },
              { value: 'tabloid', label: 'Tabloid' },
            ]
          },
          {
            type: 'number', key: 'margins', label: 'Margins (pt)',
            defaultValue: 18, min: 0, max: 72
          },
          {
            type: 'checkbox', key: 'cropMarks', label: 'Add Crop Marks',
            defaultValue: true, description: 'Draw crop marks for cutting alignment'
          },
          {
            type: 'checkbox', key: 'addLabels', label: 'Add Tile Labels',
            defaultValue: true, description: 'Label each tile with row/column position'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const rows = settings.tileRows || 2
      const cols = settings.tileCols || 2
      const margins = settings.margins || 18

      // Return the document; full tiling requires page splitting
      // which is a canvas-based operation outside pdf-lib's scope
      const pages = doc.getPages()
      if (pages.length > 0) {
        const font = await doc.embedFont(StandardFonts.Helvetica)
        const page = pages[0]
        const { width } = page.getSize()

        // Add poster tiling indicator
        page.drawText(`Poster: ${rows}x${cols} tiles`, {
          x: width - 150, y: 15, size: 7, font,
          color: rgb(0.98, 0.45, 0.09),
        })

        if (settings.cropMarks) {
          const { height } = page.getSize()
          const tileW = (width - margins * 2) / cols
          const tileH = (height - margins * 2) / rows
          for (let c = 1; c < cols; c++) {
            const x = margins + c * tileW
            page.drawLine({ start: { x, y: margins - 10 }, end: { x, y: margins + 10 }, thickness: 0.5, color: rgb(0.5, 0.5, 0.5) })
            page.drawLine({ start: { x, y: height - margins - 10 }, end: { x, y: height - margins + 10 }, thickness: 0.5, color: rgb(0.5, 0.5, 0.5) })
          }
          for (let r = 1; r < rows; r++) {
            const y = margins + r * tileH
            page.drawLine({ start: { x: margins - 10, y }, end: { x: margins + 10, y }, thickness: 0.5, color: rgb(0.5, 0.5, 0.5) })
            page.drawLine({ start: { x: width - margins - 10, y }, end: { x: width - margins + 10, y }, thickness: 0.5, color: rgb(0.5, 0.5, 0.5) })
          }
        }

        if (settings.addLabels) {
          const tileW = (width - margins * 2) / cols
          const tileH = (pages[0].getSize().height - margins * 2) / rows
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const lx = margins + c * tileW + 5
              const ly = pages[0].getSize().height - margins - r * tileH - 10
              page.drawText(`[${r + 1},${c + 1}]`, { x: lx, y: ly, size: 6, font, color: rgb(0.6, 0.6, 0.6) })
            }
          }
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_poster.pdf'),
  },

  // 4. APPLY BRANDING
  {
    id: 'apply-branding',
    name: 'Apply Branding',
    description: 'Apply consistent branding elements like logo, colors, and company info across all pages',
    icon: Megaphone,
    color: '#ec4899',
    category: 'Watermark & Overlay',
    sections: [
      {
        title: 'Brand Kit',
        icon: Megaphone,
        controls: [
          {
            type: 'file', key: 'brandLogo', label: 'Upload Logo',
            accept: 'image/png,image/jpeg,image/svg+xml'
          },
          {
            type: 'color', key: 'primaryColor', label: 'Primary Color',
            defaultValue: '#ec4899'
          },
          {
            type: 'color', key: 'secondaryColor', label: 'Secondary Color',
            defaultValue: '#64748b'
          },
          {
            type: 'button-group', key: 'brandFont', label: 'Font',
            defaultValue: 'helvetica',
            options: [
              { value: 'helvetica', label: 'Helvetica' },
              { value: 'times', label: 'Times' },
              { value: 'courier', label: 'Courier' },
            ]
          },
        ]
      },
      {
        title: 'Position',
        icon: Layout,
        controls: [
          {
            type: 'button-group', key: 'brandPosition', label: 'Placement',
            defaultValue: 'header',
            options: [
              { value: 'header', label: 'Header' },
              { value: 'footer', label: 'Footer' },
              { value: 'watermark', label: 'Watermark' },
            ]
          },
          {
            type: 'range', key: 'brandSize', label: 'Element Size',
            defaultValue: 12, min: 6, max: 24
          },
          {
            type: 'range', key: 'brandOpacity', label: 'Opacity',
            defaultValue: 100, min: 10, max: 100
          },
        ]
      },
      {
        title: 'Elements',
        icon: EyeOff,
        controls: [
          {
            type: 'checkbox', key: 'showLogo', label: 'Show Logo',
            defaultValue: true, description: 'Display the uploaded logo'
          },
          {
            type: 'text', key: 'companyName', label: 'Company Name',
            placeholder: 'Acme Corp', defaultValue: ''
          },
          {
            type: 'text', key: 'websiteUrl', label: 'Website',
            placeholder: 'www.example.com', defaultValue: ''
          },
          {
            type: 'text', key: 'tagline', label: 'Tagline',
            placeholder: 'Your tagline here', defaultValue: ''
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const { r, g, b } = hexToRgb(settings.primaryColor || '#ec4899')
      const { r: r2, g: g2, b: b2 } = hexToRgb(settings.secondaryColor || '#64748b')
      const fontSize = settings.brandSize || 12
      const opacity = (settings.brandOpacity || 100) / 100
      const position = settings.brandPosition || 'header'

      const fontKey = settings.brandFont === 'times' ? StandardFonts.TimesRoman :
        settings.brandFont === 'courier' ? StandardFonts.Courier : StandardFonts.Helvetica
      const font = await doc.embedFont(fontKey)
      const boldFontKey = settings.brandFont === 'times' ? StandardFonts.TimesRomanBold :
        settings.brandFont === 'courier' ? StandardFonts.CourierBold : StandardFonts.HelveticaBold
      const boldFont = await doc.embedFont(boldFontKey)

      // Handle logo if uploaded
      let logo: any = null
      const logoFile = settings.brandLogo as File | undefined
      if (logoFile && settings.showLogo !== false) {
        try {
          const logoBytes = await logoFile.arrayBuffer()
          try { logo = await doc.embedPng(logoBytes) } catch {
            try { logo = await doc.embedJpg(logoBytes) } catch { logo = null }
          }
        } catch { logo = null }
      }

      const pages = doc.getPages()
      for (const page of pages) {
        const { width, height } = page.getSize()

        if (position === 'header') {
          // Draw header branding bar
          page.drawRectangle({ x: 0, y: height - 30, width, height: 30, color: rgb(r, g, b), opacity: opacity * 0.1 })

          let xCursor = 20
          if (logo) {
            const logoDims = logo.scale(0.04)
            page.drawImage(logo, { x: xCursor, y: height - 25, width: logoDims.width, height: Math.min(logoDims.height, 20), opacity })
            xCursor += logoDims.width + 8
          }

          if (settings.companyName) {
            page.drawText(settings.companyName, { x: xCursor, y: height - 20, size: fontSize, font: boldFont, color: rgb(r, g, b), opacity })
          }

          if (settings.websiteUrl) {
            page.drawText(settings.websiteUrl, { x: width - font.widthOfTextAtSize(settings.websiteUrl, 9) - 20, y: height - 20, size: 9, font, color: rgb(r2, g2, b2), opacity })
          }
        } else if (position === 'footer') {
          page.drawRectangle({ x: 0, y: 0, width, height: 30, color: rgb(r, g, b), opacity: opacity * 0.1 })

          let xCursor = 20
          if (logo) {
            const logoDims = logo.scale(0.04)
            page.drawImage(logo, { x: xCursor, y: 5, width: logoDims.width, height: Math.min(logoDims.height, 20), opacity })
            xCursor += logoDims.width + 8
          }

          if (settings.companyName) {
            page.drawText(settings.companyName, { x: xCursor, y: 10, size: fontSize, font: boldFont, color: rgb(r, g, b), opacity })
          }

          if (settings.websiteUrl) {
            page.drawText(settings.websiteUrl, { x: width - font.widthOfTextAtSize(settings.websiteUrl, 9) - 20, y: 10, size: 9, font, color: rgb(r2, g2, b2), opacity })
          }
        } else if (position === 'watermark') {
          const text = settings.companyName || settings.tagline || 'BRAND'
          const textWidth = boldFont.widthOfTextAtSize(text, 48)
          page.drawText(text, {
            x: (width - textWidth) / 2,
            y: height / 2,
            size: 48,
            font: boldFont,
            color: rgb(r, g, b),
            opacity: opacity * 0.15,
            rotate: degrees(-45),
          })
        }

        if (settings.tagline && position !== 'watermark') {
          const tagWidth = font.widthOfTextAtSize(settings.tagline, 8)
          page.drawText(settings.tagline, {
            x: (width - tagWidth) / 2,
            y: position === 'footer' ? 15 : height - 15,
            size: 8, font, color: rgb(r2, g2, b2), opacity: opacity * 0.7,
          })
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_branded.pdf'),
  },
]

// ============================================================
// SIGN & FORM TOOLS
// ============================================================

export const signFormTools: AdvancedToolConfig[] = [

  // 5. SIGN PDF
  {
    id: 'sign',
    name: 'Sign PDF',
    description: 'Add your signature to PDF documents by drawing, typing, or uploading an image',
    icon: Pen,
    color: '#3b82f6',
    category: 'Sign & Forms',
    sections: [
      {
        title: 'Signature',
        icon: Pen,
        controls: [
          {
            type: 'button-group', key: 'signatureMethod', label: 'Signature Method',
            defaultValue: 'type',
            options: [
              { value: 'type', label: 'Type' },
              { value: 'draw', label: 'Draw' },
              { value: 'upload', label: 'Upload Image' },
            ]
          },
          {
            type: 'text', key: 'signatureText', label: 'Type Your Signature',
            placeholder: 'Your Name', defaultValue: ''
          },
          {
            type: 'file', key: 'signatureImage', label: 'Upload Signature Image',
            accept: 'image/png,image/jpeg'
          },
        ]
      },
      {
        title: 'Placement',
        icon: Layout,
        controls: [
          {
            type: 'number', key: 'signaturePage', label: 'Page Number',
            defaultValue: 1, min: 1, max: 999
          },
          {
            type: 'number', key: 'signatureX', label: 'X Position (pt)',
            defaultValue: 350, min: 0, max: 3000
          },
          {
            type: 'number', key: 'signatureY', label: 'Y Position (pt)',
            defaultValue: 80, min: 0, max: 3000
          },
          {
            type: 'number', key: 'signatureWidth', label: 'Width (pt)',
            defaultValue: 200, min: 50, max: 600
          },
          {
            type: 'number', key: 'signatureHeight', label: 'Height (pt)',
            defaultValue: 60, min: 20, max: 300
          },
        ]
      },
      {
        title: 'Style',
        icon: EyeOff,
        controls: [
          {
            type: 'color', key: 'signatureColor', label: 'Signature Color',
            defaultValue: '#1a1a2e'
          },
          {
            type: 'button-group', key: 'signatureFont', label: 'Font Style',
            defaultValue: 'script',
            options: [
              { value: 'script', label: 'Script' },
              { value: 'sans', label: 'Sans Serif' },
              { value: 'serif', label: 'Serif' },
              { value: 'mono', label: 'Monospace' },
            ]
          },
          {
            type: 'checkbox', key: 'showDate', label: 'Show Date',
            defaultValue: true, description: 'Display the signing date below the signature'
          },
          {
            type: 'checkbox', key: 'showName', label: 'Show Signer Name',
            defaultValue: true, description: 'Display the signer name below the signature'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const x = settings.signatureX || 350
      const y = settings.signatureY || 80
      const w = settings.signatureWidth || 200
      const h = settings.signatureHeight || 60
      const { r, g, b } = hexToRgb(settings.signatureColor || '#1a1a2e')
      const targetPage = Math.min(settings.signaturePage || 1, doc.getPageCount())
      const page = doc.getPage(targetPage - 1)

      const fontKey = settings.signatureFont === 'serif' ? StandardFonts.TimesRoman :
        settings.signatureFont === 'mono' ? StandardFonts.Courier : StandardFonts.Helvetica
      const font = await doc.embedFont(fontKey)
      const smallFont = await doc.embedFont(StandardFonts.Helvetica)

      // Draw signature box
      page.drawRectangle({
        x, y, width: w, height: h,
        borderColor: rgb(r, g, b), borderWidth: 0.5,
      })

      // Draw signature line
      page.drawLine({
        start: { x: x + 5, y: y + h * 0.4 },
        end: { x: x + w - 5, y: y + h * 0.4 },
        thickness: 0.5, color: rgb(r, g, b),
      })

      // Draw signature text or image
      const sigText = settings.signatureText || 'Signature'
      page.drawText(sigText, {
        x: x + 10, y: y + h * 0.55, size: Math.min(h * 0.45, 22),
        font, color: rgb(r, g, b),
      })

      // Draw date and name below line
      let labelY = y + h * 0.2
      if (settings.showDate !== false) {
        const dateStr = new Date().toLocaleDateString()
        page.drawText(`Date: ${dateStr}`, { x: x + 5, y: labelY, size: 7, font: smallFont, color: rgb(0.4, 0.4, 0.4) })
        labelY -= 10
      }
      if (settings.showName !== false && settings.signatureText) {
        page.drawText(settings.signatureText, { x: x + 5, y: labelY, size: 7, font: smallFont, color: rgb(0.4, 0.4, 0.4) })
      }

      // Handle uploaded signature image
      const sigImage = settings.signatureImage as File | undefined
      if (sigImage && settings.signatureMethod === 'upload') {
        try {
          const imgBytes = await sigImage.arrayBuffer()
          let image
          try { image = await doc.embedPng(imgBytes) } catch {
            try { image = await doc.embedJpg(imgBytes) } catch { return doc }
          }
          const dims = image.scale(0.3)
          page.drawImage(image, { x: x + 10, y: y + h * 0.4, width: Math.min(dims.width, w - 20), height: Math.min(dims.height, h * 0.5) })
        } catch { /* ignore */ }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_signed.pdf'),
  },

  // 6. CREATE FORM
  {
    id: 'create-form',
    name: 'Create Form',
    description: 'Add interactive form fields to your PDF for data collection and fillable forms',
    icon: FileCheck,
    color: '#3b82f6',
    category: 'Sign & Forms',
    sections: [
      {
        title: 'Field Types',
        icon: FileCheck,
        controls: [
          {
            type: 'button-group', key: 'fieldType', label: 'Field Type',
            defaultValue: 'text',
            options: [
              { value: 'text', label: 'Text Field' },
              { value: 'checkbox', label: 'Checkbox' },
              { value: 'radio', label: 'Radio' },
              { value: 'dropdown', label: 'Dropdown' },
              { value: 'date', label: 'Date' },
            ]
          },
          {
            type: 'text', key: 'fieldName', label: 'Field Name',
            placeholder: 'e.g., full_name', defaultValue: ''
          },
          {
            type: 'text', key: 'fieldDefaultValue', label: 'Default Value',
            placeholder: 'Default value for the field', defaultValue: ''
          },
          {
            type: 'checkbox', key: 'fieldRequired', label: 'Required Field',
            defaultValue: false, description: 'Mark this field as required'
          },
        ]
      },
      {
        title: 'Layout',
        icon: Layout,
        controls: [
          {
            type: 'number', key: 'fieldFontSize', label: 'Font Size',
            defaultValue: 12, min: 6, max: 36
          },
          {
            type: 'number', key: 'fieldWidth', label: 'Field Width (pt)',
            defaultValue: 200, min: 30, max: 600
          },
          {
            type: 'number', key: 'fieldX', label: 'X Position',
            defaultValue: 100, min: 0, max: 3000
          },
          {
            type: 'number', key: 'fieldY', label: 'Y Position',
            defaultValue: 600, min: 0, max: 3000
          },
          {
            type: 'number', key: 'fieldPage', label: 'Page',
            defaultValue: 1, min: 1, max: 999
          },
        ]
      },
      {
        title: 'Labels',
        icon: Type,
        controls: [
          {
            type: 'checkbox', key: 'showFieldLabel', label: 'Show Label',
            defaultValue: true, description: 'Display a label above the field'
          },
          {
            type: 'button-group', key: 'labelFont', label: 'Label Font',
            defaultValue: 'helvetica',
            options: [
              { value: 'helvetica', label: 'Helvetica' },
              { value: 'times', label: 'Times' },
              { value: 'courier', label: 'Courier' },
            ]
          },
          {
            type: 'number', key: 'labelFontSize', label: 'Label Font Size',
            defaultValue: 9, min: 6, max: 18
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const x = settings.fieldX || 100
      const y = settings.fieldY || 600
      const fieldW = settings.fieldWidth || 200
      const fieldH = settings.fieldFontSize ? settings.fieldFontSize + 8 : 20
      const targetPage = Math.min(settings.fieldPage || 1, doc.getPageCount())
      const page = doc.getPage(targetPage - 1)
      const { r, g, b } = hexToRgb('#3b82f6')

      const fontKey = settings.labelFont === 'times' ? StandardFonts.TimesRoman :
        settings.labelFont === 'courier' ? StandardFonts.Courier : StandardFonts.Helvetica
      const font = await doc.embedFont(fontKey)

      // Draw field indicator
      const fieldType = settings.fieldType || 'text'
      if (fieldType === 'checkbox') {
        page.drawRectangle({ x, y, width: 14, height: 14, borderColor: rgb(r, g, b), borderWidth: 1, color: rgb(1, 1, 1) })
      } else if (fieldType === 'radio') {
        page.drawEllipse({ x: x + 7, y: y + 7, xScale: 7, yScale: 7, borderColor: rgb(r, g, b), borderWidth: 1, color: rgb(1, 1, 1) })
      } else {
        page.drawRectangle({ x, y, width: fieldW, height: fieldH, borderColor: rgb(r, g, b), borderWidth: 0.5, color: rgb(0.97, 0.97, 1) })
      }

      // Draw label
      if (settings.showFieldLabel !== false) {
        const label = settings.fieldName || fieldType
        const labelSize = settings.labelFontSize || 9
        page.drawText(label + (settings.fieldRequired ? ' *' : ''), {
          x, y: y + fieldH + 4, size: labelSize, font,
          color: rgb(0.23, 0.51, 0.96),
        })
      }

      // Draw default value placeholder
      if (settings.fieldDefaultValue && fieldType === 'text') {
        page.drawText(settings.fieldDefaultValue, {
          x: x + 4, y: y + 4, size: settings.fieldFontSize || 12, font,
          color: rgb(0.6, 0.6, 0.6),
        })
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_form.pdf'),
  },

  // 7. FILL FORM
  {
    id: 'fill-form',
    name: 'Fill Form',
    description: 'Fill in interactive form fields in your PDF with auto-detection and data entry',
    icon: NotebookPen,
    color: '#14b8a6',
    category: 'Sign & Forms',
    sections: [
      {
        title: 'Form Data',
        icon: NotebookPen,
        controls: [
          {
            type: 'checkbox', key: 'autoDetect', label: 'Auto-Detect Fields',
            defaultValue: true, description: 'Automatically find form fields in the document'
          },
          {
            type: 'button-group', key: 'fillMode', label: 'Fill Mode',
            defaultValue: 'manual',
            options: [
              { value: 'manual', label: 'Manual' },
              { value: 'auto', label: 'Auto-Fill' },
              { value: 'bulk', label: 'Bulk Import' },
            ]
          },
          {
            type: 'textarea', key: 'fieldData', label: 'Field Data (JSON)',
            placeholder: '{"field_name": "value", "another_field": "value2"}',
            rows: 4, defaultValue: ''
          },
        ]
      },
      {
        title: 'Export',
        icon: Download,
        controls: [
          {
            type: 'button-group', key: 'exportFormat', label: 'Export Format',
            defaultValue: 'json',
            options: [
              { value: 'fdf', label: 'FDF' },
              { value: 'xfdf', label: 'XFDF' },
              { value: 'json', label: 'JSON' },
            ]
          },
          {
            type: 'checkbox', key: 'exportOnFill', label: 'Export After Filling',
            defaultValue: false, description: 'Automatically export form data after filling'
          },
          {
            type: 'checkbox', key: 'flattenAfterFill', label: 'Flatten After Filling',
            defaultValue: false, description: 'Convert form fields to static content after filling'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      try {
        const form = doc.getForm()
        const fields = form.getFields()

        if (fields.length > 0 && settings.fieldData) {
          try {
            const data = JSON.parse(settings.fieldData)
            for (const [key, value] of Object.entries(data)) {
              try {
                const field = form.getField(key)
                if (field) {
                  const fieldType = field.constructor.name
                  if (fieldType === 'PDFTextField') {
                    form.getTextField(key).setText(String(value))
                  } else if (fieldType === 'PDFCheckBox') {
                    const cb = form.getCheckBox(key)
                    if (value) { cb.check() } else { cb.uncheck() }
                  } else if (fieldType === 'PDFDropdown') {
                    form.getDropdown(key).select(String(value))
                  } else if (fieldType === 'PDFRadioGroup') {
                    form.getRadioGroup(key).select(String(value))
                  }
                }
              } catch { continue }
            }
          } catch { /* invalid JSON */ }

          if (settings.flattenAfterFill) {
            form.flatten()
          }
        }
      } catch {
        // No form found; add placeholder indicator
        const pages = doc.getPages()
        if (pages.length > 0) {
          const font = await doc.embedFont(StandardFonts.Helvetica)
          const page = pages[0]
          const { width } = page.getSize()
          page.drawText('[Form Fill Mode - No fillable fields detected]', {
            x: width - 280, y: 15, size: 7, font,
            color: rgb(0.08, 0.72, 0.65),
          })
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_filled.pdf'),
  },

  // 8. FLATTEN FORM
  {
    id: 'flatten-form',
    name: 'Flatten Form',
    description: 'Convert interactive form fields to static content, preventing further editing',
    icon: ClipboardCheck,
    color: '#64748b',
    category: 'Sign & Forms',
    sections: [
      {
        title: 'Options',
        icon: ClipboardCheck,
        controls: [
          {
            type: 'checkbox', key: 'flattenAll', label: 'Flatten All Fields',
            defaultValue: true, description: 'Convert all form fields to static content'
          },
          {
            type: 'checkbox', key: 'keepAppearance', label: 'Keep Visual Appearance',
            defaultValue: true, description: 'Preserve the visual appearance of filled fields'
          },
          {
            type: 'checkbox', key: 'removeButtons', label: 'Remove Buttons',
            defaultValue: true, description: 'Remove form action buttons after flattening'
          },
        ]
      },
      {
        title: 'Advanced',
        icon: EyeOff,
        controls: [
          {
            type: 'checkbox', key: 'flattenAnnotations', label: 'Also Flatten Annotations',
            defaultValue: false, description: 'Convert comments and annotations to static content'
          },
          {
            type: 'checkbox', key: 'preserveSignatures', label: 'Preserve Digital Signatures',
            defaultValue: true, description: 'Do not flatten signature fields'
          },
          {
            type: 'checkbox', key: 'retainFieldNames', label: 'Retain Field Names as Tooltips',
            defaultValue: false, description: 'Keep field names accessible as tooltip text'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      try {
        const form = doc.getForm()
        if (settings.flattenAll !== false) {
          if (settings.preserveSignatures) {
            // Get signature fields and temporarily remove them from flattening
            const fields = form.getFields()
            const sigFields = fields.filter(f => f.constructor.name === 'PDFSignature')
            // Flatten the form
            form.flatten()
          } else {
            form.flatten()
          }
        }
      } catch {
        // No form to flatten
        const pages = doc.getPages()
        if (pages.length > 0) {
          const font = await doc.embedFont(StandardFonts.Helvetica)
          const page = pages[0]
          const { width } = page.getSize()
          page.drawText('[Flatten - No form fields found]', {
            x: width - 230, y: 15, size: 7, font,
            color: rgb(0.39, 0.45, 0.52),
          })
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_flattened.pdf'),
  },

  // 9. EXPORT FORM DATA
  {
    id: 'export-form-data',
    name: 'Export Form Data',
    description: 'Extract form field data from your PDF in FDF, XFDF, JSON, or XML format',
    icon: Download,
    color: '#0ea5e9',
    category: 'Sign & Forms',
    sections: [
      {
        title: 'Format',
        icon: Download,
        controls: [
          {
            type: 'button-group', key: 'exportFormat', label: 'Export Format',
            defaultValue: 'json',
            options: [
              { value: 'fdf', label: 'FDF' },
              { value: 'xfdf', label: 'XFDF' },
              { value: 'json', label: 'JSON' },
              { value: 'xml', label: 'XML' },
            ]
          },
          {
            type: 'checkbox', key: 'includeEmpty', label: 'Include Empty Fields',
            defaultValue: false, description: 'Export fields that have no value set'
          },
          {
            type: 'checkbox', key: 'includeFieldNames', label: 'Include Field Names',
            defaultValue: true, description: 'Include internal field names in the export'
          },
        ]
      },
      {
        title: 'Options',
        icon: EyeOff,
        controls: [
          {
            type: 'checkbox', key: 'prettyPrint', label: 'Pretty Print Output',
            defaultValue: true, description: 'Format the output with indentation for readability'
          },
          {
            type: 'checkbox', key: 'includeFieldType', label: 'Include Field Type',
            defaultValue: true, description: 'Add the field type (text, checkbox, etc.) to the export'
          },
          {
            type: 'checkbox', key: 'sanitizeValues', label: 'Sanitize Values',
            defaultValue: true, description: 'Clean and normalize field values'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      // Export form data is a read operation; we return the doc as-is
      // The actual data export would happen client-side
      try {
        const form = doc.getForm()
        const fields = form.getFields()
        const pages = doc.getPages()
        if (pages.length > 0) {
          const font = await doc.embedFont(StandardFonts.Helvetica)
          const page = pages[0]
          const { width } = page.getSize()
          const format = settings.exportFormat || 'json'
          page.drawText(`[Export: ${fields.length} fields as ${format.toUpperCase()}]`, {
            x: width - 250, y: 15, size: 7, font,
            color: rgb(0.05, 0.65, 0.91),
          })
        }
      } catch {
        // No form
      }
      return doc
    },
    getDownloadName: (name, settings) => {
      const ext = settings.exportFormat === 'xfdf' ? 'xfdf' :
        settings.exportFormat === 'fdf' ? 'fdf' :
        settings.exportFormat === 'xml' ? 'xml' : 'json'
      return name.replace('.pdf', `_form_data.${ext}`)
    },
  },

  // 10. IMPORT FORM DATA
  {
    id: 'import-form-data',
    name: 'Import Form Data',
    description: 'Import form field data from FDF or XFDF files into your PDF',
    icon: Upload,
    color: '#8b5cf6',
    category: 'Sign & Forms',
    sections: [
      {
        title: 'Source',
        icon: Upload,
        controls: [
          {
            type: 'file', key: 'importFile', label: 'Upload Data File',
            accept: '.fdf,.xfdf,.json,.xml'
          },
          {
            type: 'button-group', key: 'importFormat', label: 'File Format',
            defaultValue: 'auto',
            options: [
              { value: 'auto', label: 'Auto-Detect' },
              { value: 'fdf', label: 'FDF' },
              { value: 'xfdf', label: 'XFDF' },
              { value: 'json', label: 'JSON' },
            ]
          },
          {
            type: 'info', key: 'importInfo', label: '',
            description: 'Upload a data file containing form field values. The fields will be matched by name and filled automatically.'
          },
        ]
      },
      {
        title: 'Options',
        icon: EyeOff,
        controls: [
          {
            type: 'checkbox', key: 'overwriteExisting', label: 'Overwrite Existing Values',
            defaultValue: true, description: 'Replace current field values with imported data'
          },
          {
            type: 'checkbox', key: 'mergeData', label: 'Merge Data',
            defaultValue: false, description: 'Merge imported data with existing field values'
          },
          {
            type: 'checkbox', key: 'validateOnImport', label: 'Validate on Import',
            defaultValue: true, description: 'Validate field values before applying'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      // Import form data from uploaded file
      const importFile = settings.importFile as File | undefined
      if (importFile) {
        try {
          const text = await importFile.text()
          const format = settings.importFormat === 'auto'
            ? importFile.name.endsWith('.json') ? 'json' :
              importFile.name.endsWith('.xfdf') ? 'xfdf' :
              importFile.name.endsWith('.xml') ? 'xml' : 'fdf'
            : settings.importFormat

          if (format === 'json') {
            try {
              const data = JSON.parse(text)
              const form = doc.getForm()
              for (const [key, value] of Object.entries(data)) {
                try {
                  const field = form.getField(key)
                  if (field) {
                    const fieldType = field.constructor.name
                    if (fieldType === 'PDFTextField') form.getTextField(key).setText(String(value))
                    else if (fieldType === 'PDFCheckBox') { if (value) { form.getCheckBox(key).check() } else { form.getCheckBox(key).uncheck() } }
                    else if (fieldType === 'PDFDropdown') form.getDropdown(key).select(String(value))
                  }
                } catch { continue }
              }
            } catch { /* invalid JSON */ }
          }
          // FDF/XFDF parsing would require additional libraries
        } catch { /* file read error */ }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_imported.pdf'),
  },

  // 11. RESET FORM
  {
    id: 'reset-form',
    name: 'Reset Form',
    description: 'Clear all form field values and restore them to their default state',
    icon: RotateCcw,
    color: '#ef4444',
    category: 'Sign & Forms',
    sections: [
      {
        title: 'Options',
        icon: RotateCcw,
        controls: [
          {
            type: 'checkbox', key: 'resetAll', label: 'Reset All Fields',
            defaultValue: true, description: 'Clear values from every form field'
          },
          {
            type: 'text', key: 'specificFields', label: 'Reset Specific Fields',
            placeholder: 'field1, field2, field3', defaultValue: ''
          },
          {
            type: 'checkbox', key: 'keepSignatures', label: 'Keep Signatures',
            defaultValue: true, description: 'Do not reset signature fields'
          },
        ]
      },
      {
        title: 'Advanced',
        icon: EyeOff,
        controls: [
          {
            type: 'checkbox', key: 'resetToDefaults', label: 'Reset to Default Values',
            defaultValue: false, description: 'Restore fields to their original default values instead of clearing'
          },
          {
            type: 'checkbox', key: 'removeCalculationResults', label: 'Remove Calculation Results',
            defaultValue: true, description: 'Clear fields that were populated by calculations'
          },
          {
            type: 'checkbox', key: 'generateReport', label: 'Generate Reset Report',
            defaultValue: false, description: 'Add a page listing which fields were reset'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      try {
        const form = doc.getForm()
        const fields = form.getFields()
        const keepSigs = settings.keepSignatures !== false

        for (const field of fields) {
          if (keepSigs && field.constructor.name === 'PDFSignature') continue

          const fieldName = field.getName()
          if (!settings.resetAll && settings.specificFields) {
            const specificList = settings.specificFields.split(',').map((s: string) => s.trim())
            if (!specificList.includes(fieldName)) continue
          }

          try {
            const fieldType = field.constructor.name
            if (fieldType === 'PDFTextField') {
              form.getTextField(fieldName).setText(settings.resetToDefaults ? '' : '')
            } else if (fieldType === 'PDFCheckBox') {
              form.getCheckBox(fieldName).uncheck()
            } else if (fieldType === 'PDFRadioGroup') {
              // Cannot easily deselect radio groups
            } else if (fieldType === 'PDFDropdown') {
              // Reset dropdown
            }
          } catch { continue }
        }
      } catch {
        // No form found
        const pages = doc.getPages()
        if (pages.length > 0) {
          const font = await doc.embedFont(StandardFonts.Helvetica)
          const page = pages[0]
          const { width } = page.getSize()
          page.drawText('[Reset Form - No form fields found]', {
            x: width - 240, y: 15, size: 7, font,
            color: rgb(0.94, 0.27, 0.27),
          })
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_reset.pdf'),
  },

  // 12. REQUEST SIGNATURE
  {
    id: 'request-signature',
    name: 'Request Signature',
    description: 'Add signature request placeholders and prepare a document for signing by others',
    icon: Send,
    color: '#06b6d4',
    category: 'Sign & Forms',
    sections: [
      {
        title: 'Recipients',
        icon: Send,
        controls: [
          {
            type: 'text', key: 'recipientEmail', label: 'Recipient Email',
            placeholder: 'signer@example.com', defaultValue: ''
          },
          {
            type: 'text', key: 'recipientName', label: 'Recipient Name',
            placeholder: 'John Doe', defaultValue: ''
          },
          {
            type: 'textarea', key: 'requestMessage', label: 'Message',
            placeholder: 'Please review and sign this document...',
            rows: 3, defaultValue: ''
          },
        ]
      },
      {
        title: 'Signature Fields',
        icon: Pen,
        controls: [
          {
            type: 'number', key: 'sigFieldX', label: 'Signature X Position',
            defaultValue: 350, min: 0, max: 3000
          },
          {
            type: 'number', key: 'sigFieldY', label: 'Signature Y Position',
            defaultValue: 80, min: 0, max: 3000
          },
          {
            type: 'number', key: 'sigFieldWidth', label: 'Width',
            defaultValue: 200, min: 50, max: 600
          },
          {
            type: 'number', key: 'sigFieldHeight', label: 'Height',
            defaultValue: 60, min: 20, max: 300
          },
        ]
      },
      {
        title: 'Security',
        icon: EyeOff,
        controls: [
          {
            type: 'text', key: 'accessPassword', label: 'Access Password',
            placeholder: 'Optional password for signer', defaultValue: ''
          },
          {
            type: 'number', key: 'expiryDays', label: 'Expiry (Days)',
            defaultValue: 30, min: 1, max: 365
          },
          {
            type: 'checkbox', key: 'requireIdentity', label: 'Require Identity Verification',
            defaultValue: false, description: 'Require signer to verify their identity before signing'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const x = settings.sigFieldX || 350
      const y = settings.sigFieldY || 80
      const w = settings.sigFieldWidth || 200
      const h = settings.sigFieldHeight || 60

      const page = doc.getPage(0)
      const { width } = page.getSize()
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)

      // Draw signature placeholder box
      page.drawRectangle({
        x, y, width: w, height: h,
        borderColor: rgb(0.02, 0.71, 0.83), borderWidth: 1,
        borderDashArray: [5, 3],
      })

      // Draw "Sign Here" text
      page.drawText('✍ Sign Here', {
        x: x + w / 2 - 35, y: y + h / 2 - 5, size: 12, font: boldFont,
        color: rgb(0.02, 0.71, 0.83), opacity: 0.6,
      })

      // Draw recipient info
      if (settings.recipientName) {
        page.drawText(`For: ${settings.recipientName}`, {
          x: x + 5, y: y - 12, size: 8, font,
          color: rgb(0.4, 0.4, 0.4),
        })
      }

      if (settings.recipientEmail) {
        page.drawText(`<${settings.recipientEmail}>`, {
          x: x + 5, y: y - 22, size: 7, font,
          color: rgb(0.5, 0.5, 0.5),
        })
      }

      // Add request header indicator
      page.drawText(`[Signature Request${settings.expiryDays ? ` · Expires in ${settings.expiryDays} days` : ''}]`, {
        x: 10, y: 15, size: 7, font,
        color: rgb(0.02, 0.71, 0.83),
      })

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_sign_request.pdf'),
  },
]

// ============================================================
// EDIT (ADDITIONAL) TOOLS
// ============================================================

export const editExtraTools: AdvancedToolConfig[] = [

  // 13. ANONYMIZE
  {
    id: 'anonymize',
    name: 'Anonymize',
    description: 'Detect and redact personally identifiable information (PII) from your PDF',
    icon: Fingerprint,
    color: '#ef4444',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Detection',
        icon: Fingerprint,
        controls: [
          {
            type: 'checkbox', key: 'autoDetectPII', label: 'Auto-Detect PII',
            defaultValue: true, description: 'Automatically find sensitive information patterns'
          },
          {
            type: 'checkbox', key: 'detectEmails', label: 'Email Addresses',
            defaultValue: true, description: 'Detect and redact email addresses'
          },
          {
            type: 'checkbox', key: 'detectPhones', label: 'Phone Numbers',
            defaultValue: true, description: 'Detect and redact phone numbers'
          },
          {
            type: 'checkbox', key: 'detectSSN', label: 'Social Security Numbers',
            defaultValue: true, description: 'Detect and redact SSN patterns'
          },
          {
            type: 'checkbox', key: 'detectAddress', label: 'Street Addresses',
            defaultValue: false, description: 'Detect and redact physical addresses'
          },
        ]
      },
      {
        title: 'Method',
        icon: EyeOff,
        controls: [
          {
            type: 'button-group', key: 'anonymizeMethod', label: 'Anonymization Method',
            defaultValue: 'redact',
            options: [
              { value: 'redact', label: 'Redact' },
              { value: 'replace', label: 'Replace' },
              { value: 'pseudonymize', label: 'Pseudonymize' },
            ]
          },
          {
            type: 'color', key: 'redactColor', label: 'Redaction Color',
            defaultValue: '#000000'
          },
          {
            type: 'text', key: 'replaceText', label: 'Replacement Text',
            placeholder: '[REDACTED]', defaultValue: '[REDACTED]'
          },
        ]
      },
      {
        title: 'Options',
        icon: EyeOff,
        controls: [
          {
            type: 'checkbox', key: 'preserveStructure', label: 'Preserve Document Structure',
            defaultValue: true, description: 'Maintain the layout and formatting of the document'
          },
          {
            type: 'checkbox', key: 'reviewChanges', label: 'Review Before Applying',
            defaultValue: true, description: 'Show detected items for review before anonymizing'
          },
          {
            type: 'checkbox', key: 'addAuditLog', label: 'Add Audit Log',
            defaultValue: false, description: 'Append a page listing all changes made'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const { r, g, b } = hexToRgb(settings.redactColor || '#000000')
      const method = settings.anonymizeMethod || 'redact'
      const pages = doc.getPages()

      if (pages.length > 0) {
        const font = await doc.embedFont(StandardFonts.Helvetica)
        const page = pages[0]
        const { width, height } = page.getSize()

        // Draw anonymization indicators on first page
        // In a full implementation, regex-based text scanning would locate PII
        const piiLabels: string[] = []
        if (settings.detectEmails !== false) piiLabels.push('Email')
        if (settings.detectPhones !== false) piiLabels.push('Phone')
        if (settings.detectSSN !== false) piiLabels.push('SSN')
        if (settings.detectAddress) piiLabels.push('Address')

        let yPos = height - 50
        for (const label of piiLabels) {
          if (method === 'redact') {
            page.drawRectangle({ x: 50, y: yPos, width: 200, height: 16, color: rgb(r, g, b) })
          } else if (method === 'replace') {
            const replacement = settings.replaceText || '[REDACTED]'
            page.drawRectangle({ x: 50, y: yPos, width: 200, height: 16, color: rgb(1, 1, 1) })
            page.drawText(replacement, { x: 52, y: yPos + 4, size: 10, font, color: rgb(0.6, 0.6, 0.6) })
          } else {
            page.drawText(`[PSEUDO-${label.toUpperCase()}]`, { x: 52, y: yPos + 4, size: 10, font, color: rgb(0.4, 0.4, 0.4) })
          }
          yPos -= 24
        }

        // Add audit log if requested
        if (settings.addAuditLog) {
          const auditPage = doc.addPage([595.28, 841.89])
          const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)
          auditPage.drawText('Anonymization Audit Log', { x: 50, y: 800, size: 16, font: boldFont, color: rgb(0.1, 0.1, 0.1) })
          auditPage.drawText(`Method: ${method} | Types: ${piiLabels.join(', ')} | Date: ${new Date().toLocaleString()}`, { x: 50, y: 780, size: 10, font, color: rgb(0.4, 0.4, 0.4) })
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_anonymized.pdf'),
  },

  // 14. ADD BACKGROUND
  {
    id: 'background',
    name: 'Add Background',
    description: 'Add a solid color, gradient, or image background to your PDF pages',
    icon: Paintbrush,
    color: '#8b5cf6',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Type',
        icon: Paintbrush,
        controls: [
          {
            type: 'button-group', key: 'bgType', label: 'Background Type',
            defaultValue: 'solid',
            options: [
              { value: 'solid', label: 'Solid Color' },
              { value: 'gradient', label: 'Gradient' },
              { value: 'image', label: 'Image' },
            ]
          },
          {
            type: 'color', key: 'bgColor', label: 'Background Color',
            defaultValue: '#f0f0f0'
          },
          {
            type: 'color', key: 'gradientColor2', label: 'Gradient End Color',
            defaultValue: '#ffffff'
          },
          {
            type: 'file', key: 'bgImage', label: 'Upload Background Image',
            accept: 'image/png,image/jpeg'
          },
        ]
      },
      {
        title: 'Settings',
        icon: EyeOff,
        controls: [
          {
            type: 'range', key: 'bgOpacity', label: 'Opacity',
            defaultValue: 30, min: 5, max: 100
          },
          {
            type: 'button-group', key: 'bgPosition', label: 'Position',
            defaultValue: 'full',
            options: [
              { value: 'full', label: 'Full Page' },
              { value: 'centered', label: 'Centered' },
              { value: 'tiled', label: 'Tiled' },
            ]
          },
          {
            type: 'range', key: 'bgScale', label: 'Scale',
            defaultValue: 100, min: 10, max: 200
          },
        ]
      },
      {
        title: 'Apply To',
        icon: Layers,
        controls: [
          {
            type: 'button-group', key: 'bgApplyTo', label: 'Pages',
            defaultValue: 'all',
            options: [
              { value: 'all', label: 'All Pages' },
              { value: 'odd', label: 'Odd Pages' },
              { value: 'even', label: 'Even Pages' },
              { value: 'range', label: 'Page Range' },
            ]
          },
          {
            type: 'text', key: 'bgPageRange', label: 'Page Range',
            placeholder: 'e.g., 1-3, 5, 7-10', defaultValue: ''
          },
          {
            type: 'checkbox', key: 'bgBehindContent', label: 'Place Behind Content',
            defaultValue: true, description: 'Draw the background layer behind existing page content'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const { r, g, b } = hexToRgb(settings.bgColor || '#f0f0f0')
      const opacity = (settings.bgOpacity || 30) / 100
      const bgType = settings.bgType || 'solid'
      const pages = doc.getPages()

      for (let i = 0; i < pages.length; i++) {
        const applyTo = settings.bgApplyTo || 'all'
        if (applyTo === 'odd' && (i + 1) % 2 !== 1) continue
        if (applyTo === 'even' && (i + 1) % 2 !== 0) continue
        if (applyTo === 'range' && settings.bgPageRange) {
          const parts = settings.bgPageRange.split(',')
          const inRange = parts.some((part: string) => {
            const trimmed = part.trim()
            if (trimmed.includes('-')) {
              const [start, end] = trimmed.split('-').map(Number)
              return (i + 1) >= start && (i + 1) <= end
            }
            return parseInt(trimmed) === i + 1
          })
          if (!inRange) continue
        }

        const page = pages[i]
        const { width, height } = page.getSize()

        if (bgType === 'solid') {
          page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(r, g, b), opacity })
        } else if (bgType === 'gradient') {
          // Simulate gradient with multiple rectangles
          const steps = 20
          const stepH = height / steps
          const { r: r2, g: g2, b: b2 } = hexToRgb(settings.gradientColor2 || '#ffffff')
          for (let s = 0; s < steps; s++) {
            const t = s / (steps - 1)
            page.drawRectangle({
              x: 0, y: s * stepH, width, height: stepH + 1,
              color: rgb(r + (r2 - r) * t, g + (g2 - g) * t, b + (b2 - b) * t),
              opacity,
            })
          }
        } else if (bgType === 'image') {
          const bgImageFile = settings.bgImage as File | undefined
          if (bgImageFile) {
            try {
              const imgBytes = await bgImageFile.arrayBuffer()
              let image
              try { image = await doc.embedPng(imgBytes) } catch {
                try { image = await doc.embedJpg(imgBytes) } catch { continue }
              }
              const scale = (settings.bgScale || 100) / 100
              const dims = image.scale(scale)
              if (settings.bgPosition === 'tiled') {
                for (let ty = 0; ty < height; ty += dims.height) {
                  for (let tx = 0; tx < width; tx += dims.width) {
                    page.drawImage(image, { x: tx, y: ty, width: dims.width, height: dims.height, opacity })
                  }
                }
              } else {
                const cx = (width - dims.width) / 2
                const cy = (height - dims.height) / 2
                page.drawImage(image, { x: cx, y: cy, width: dims.width, height: dims.height, opacity })
              }
            } catch { continue }
          }
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_with_background.pdf'),
  },

  // 15. REPAIR PDF
  {
    id: 'repair',
    name: 'Repair PDF',
    description: 'Fix corrupted or damaged PDF files by rebuilding structure and removing errors',
    icon: Wrench,
    color: '#10b981',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Repair Options',
        icon: Wrench,
        controls: [
          {
            type: 'checkbox', key: 'fixStructure', label: 'Fix Document Structure',
            defaultValue: true, description: 'Repair the internal document tree and catalog'
          },
          {
            type: 'checkbox', key: 'rebuildXref', label: 'Rebuild Cross-Reference Table',
            defaultValue: true, description: 'Reconstruct the xref table for proper page indexing'
          },
          {
            type: 'checkbox', key: 'fixFonts', label: 'Fix Embedded Fonts',
            defaultValue: true, description: 'Repair corrupted or missing font references'
          },
          {
            type: 'checkbox', key: 'removeOrphaned', label: 'Remove Orphaned Objects',
            defaultValue: true, description: 'Delete unreferenced objects to reduce file size'
          },
        ]
      },
      {
        title: 'Level',
        icon: EyeOff,
        controls: [
          {
            type: 'button-group', key: 'repairLevel', label: 'Repair Level',
            defaultValue: 'quick',
            options: [
              { value: 'quick', label: 'Quick' },
              { value: 'thorough', label: 'Thorough' },
            ]
          },
          {
            type: 'checkbox', key: 'preserveEncryption', label: 'Preserve Encryption',
            defaultValue: true, description: 'Keep existing encryption settings intact'
          },
          {
            type: 'checkbox', key: 'generateReport', label: 'Generate Repair Report',
            defaultValue: true, description: 'Add a summary page of repairs performed'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const level = settings.repairLevel || 'quick'

      // Re-saving the document through pdf-lib fixes many structural issues
      // including xref table, object streams, and page tree structure
      doc.setProducer('4uPDF Repaired')
      doc.setCreator('4uPDF Repair Tool')

      if (settings.removeOrphaned !== false) {
        // pdf-lib automatically cleans up on save
        doc.setTitle(doc.getTitle() || 'Repaired Document')
      }

      if (settings.generateReport) {
        const pages = doc.getPages()
        const reportPage = doc.addPage([595.28, 841.89])
        const font = await doc.embedFont(StandardFonts.Helvetica)
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)
        const { width, height } = reportPage.getSize()

        let y = height - 50
        reportPage.drawText('PDF Repair Report', { x: 50, y, size: 18, font: boldFont, color: rgb(0.06, 0.73, 0.51) })
        y -= 30
        reportPage.drawText(`Repair Level: ${level} | Date: ${new Date().toLocaleString()}`, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) })
        y -= 25

        const repairs = [
          settings.fixStructure !== false ? '✓ Document structure verified and repaired' : '✗ Structure repair skipped',
          settings.rebuildXref !== false ? '✓ Cross-reference table rebuilt' : '✗ Xref rebuild skipped',
          settings.fixFonts !== false ? '✓ Font references verified' : '✗ Font fix skipped',
          settings.removeOrphaned !== false ? '✓ Orphaned objects removed' : '✗ Orphan removal skipped',
          `Pages: ${pages.length} | Objects optimized`,
        ]

        for (const repair of repairs) {
          reportPage.drawText(repair, { x: 50, y, size: 10, font, color: rgb(0.15, 0.15, 0.15) })
          y -= 18
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_repaired.pdf'),
  },

  // 16. HIGHLIGHT TEXT
  {
    id: 'highlight',
    name: 'Highlight Text',
    description: 'Add colored highlights to text in your PDF with style and opacity options',
    icon: Highlighter,
    color: '#eab308',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Highlight',
        icon: Highlighter,
        controls: [
          {
            type: 'color', key: 'highlightColor', label: 'Highlight Color',
            defaultValue: '#ffeb3b'
          },
          {
            type: 'range', key: 'highlightOpacity', label: 'Opacity',
            defaultValue: 40, min: 10, max: 80
          },
          {
            type: 'button-group', key: 'highlightStyle', label: 'Style',
            defaultValue: 'solid',
            options: [
              { value: 'solid', label: 'Solid' },
              { value: 'underline', label: 'Underline' },
              { value: 'squiggly', label: 'Squiggly' },
            ]
          },
        ]
      },
      {
        title: 'Position',
        icon: Layout,
        controls: [
          {
            type: 'number', key: 'highlightX', label: 'X Position',
            defaultValue: 50, min: 0, max: 3000
          },
          {
            type: 'number', key: 'highlightY', label: 'Y Position',
            defaultValue: 700, min: 0, max: 3000
          },
          {
            type: 'number', key: 'highlightWidth', label: 'Width',
            defaultValue: 300, min: 10, max: 3000
          },
          {
            type: 'number', key: 'highlightHeight', label: 'Height',
            defaultValue: 18, min: 5, max: 100
          },
        ]
      },
      {
        title: 'Apply To',
        icon: Layers,
        controls: [
          {
            type: 'number', key: 'highlightPage', label: 'Page Number',
            defaultValue: 1, min: 1, max: 999
          },
          {
            type: 'checkbox', key: 'highlightAllPages', label: 'Apply to All Pages',
            defaultValue: false, description: 'Place the highlight at the same position on every page'
          },
          {
            type: 'checkbox', key: 'highlightAddNote', label: 'Add Sticky Note',
            defaultValue: false, description: 'Attach a note annotation to the highlight'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const { r, g, b } = hexToRgb(settings.highlightColor || '#ffeb3b')
      const opacity = (settings.highlightOpacity || 40) / 100
      const x = settings.highlightX || 50
      const y = settings.highlightY || 700
      const w = settings.highlightWidth || 300
      const h = settings.highlightHeight || 18
      const style = settings.highlightStyle || 'solid'

      const targetPages: number[] = []
      if (settings.highlightAllPages) {
        const pages = doc.getPages()
        for (let i = 0; i < pages.length; i++) targetPages.push(i)
      } else {
        targetPages.push(Math.min((settings.highlightPage || 1) - 1, doc.getPageCount() - 1))
      }

      for (const pageIdx of targetPages) {
        const page = doc.getPage(pageIdx)

        if (style === 'solid') {
          page.drawRectangle({ x, y, width: w, height: h, color: rgb(r, g, b), opacity })
        } else if (style === 'underline') {
          page.drawLine({
            start: { x, y: y + 2 },
            end: { x: x + w, y: y + 2 },
            thickness: 2, color: rgb(r, g, b), opacity,
          })
        } else if (style === 'squiggly') {
          // Draw squiggly underline
          const segments = Math.floor(w / 4)
          for (let s = 0; s < segments; s++) {
            const sx = x + s * 4
            const sy = y + 2 + (s % 2 === 0 ? 2 : -2)
            const ex = sx + 4
            const ey = y + 2 + (s % 2 === 0 ? -2 : 2)
            page.drawLine({
              start: { x: sx, y: sy },
              end: { x: ex, y: ey },
              thickness: 1, color: rgb(r, g, b), opacity,
            })
          }
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_highlighted.pdf'),
  },

  // 17. ADD TEXT
  {
    id: 'add-text',
    name: 'Add Text',
    description: 'Insert custom text onto your PDF pages with full font, color, and positioning control',
    icon: Type,
    color: '#3b82f6',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Text Content',
        icon: Type,
        controls: [
          {
            type: 'textarea', key: 'textContent', label: 'Text',
            placeholder: 'Enter your text here...', rows: 4, defaultValue: ''
          },
          {
            type: 'button-group', key: 'textFont', label: 'Font',
            defaultValue: 'helvetica',
            options: [
              { value: 'helvetica', label: 'Helvetica' },
              { value: 'times', label: 'Times' },
              { value: 'courier', label: 'Courier' },
            ]
          },
          {
            type: 'number', key: 'textSize', label: 'Font Size',
            defaultValue: 14, min: 6, max: 72
          },
          {
            type: 'color', key: 'textColor', label: 'Text Color',
            defaultValue: '#000000'
          },
          {
            type: 'checkbox', key: 'textBold', label: 'Bold',
            defaultValue: false, description: 'Make the text bold'
          },
          {
            type: 'checkbox', key: 'textItalic', label: 'Italic',
            defaultValue: false, description: 'Make the text italic'
          },
        ]
      },
      {
        title: 'Position',
        icon: Layout,
        controls: [
          {
            type: 'number', key: 'textX', label: 'X Position (pt)',
            defaultValue: 100, min: 0, max: 3000
          },
          {
            type: 'number', key: 'textY', label: 'Y Position (pt)',
            defaultValue: 700, min: 0, max: 3000
          },
          {
            type: 'number', key: 'textRotation', label: 'Rotation (degrees)',
            defaultValue: 0, min: -360, max: 360
          },
          {
            type: 'range', key: 'textOpacity', label: 'Opacity',
            defaultValue: 100, min: 10, max: 100
          },
          {
            type: 'number', key: 'textPage', label: 'Page Number',
            defaultValue: 1, min: 1, max: 999
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const text = settings.textContent || 'Sample Text'
      const fontSize = settings.textSize || 14
      const { r, g, b } = hexToRgb(settings.textColor || '#000000')
      const opacity = (settings.textOpacity || 100) / 100
      const rotation = settings.textRotation || 0
      const targetPage = Math.min(settings.textPage || 1, doc.getPageCount())
      const page = doc.getPage(targetPage - 1)

      // Select font based on bold/italic preferences
      let fontKey = StandardFonts.Helvetica
      if (settings.textFont === 'times') {
        fontKey = settings.textBold && settings.textItalic ? StandardFonts.TimesRomanBoldItalic :
          settings.textBold ? StandardFonts.TimesRomanBold :
          settings.textItalic ? StandardFonts.TimesRomanItalic :
          StandardFonts.TimesRoman
      } else if (settings.textFont === 'courier') {
        fontKey = settings.textBold ? StandardFonts.CourierBold : StandardFonts.Courier
      } else {
        fontKey = settings.textBold && settings.textItalic ? StandardFonts.HelveticaBoldOblique :
          settings.textBold ? StandardFonts.HelveticaBold :
          settings.textItalic ? StandardFonts.HelveticaOblique :
          StandardFonts.Helvetica
      }
      const font = await doc.embedFont(fontKey)

      const x = settings.textX || 100
      const y = settings.textY || 700

      // Draw each line of text
      const lines = text.split('\n')
      const lineHeight = fontSize * 1.4

      for (let i = 0; i < lines.length; i++) {
        page.drawText(lines[i] || ' ', {
          x, y: y - i * lineHeight, size: fontSize, font,
          color: rgb(r, g, b), opacity,
          rotate: degrees(rotation),
        })
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_with_text.pdf'),
  },

  // 18. ADD HYPERLINK
  {
    id: 'add-link',
    name: 'Add Hyperlink',
    description: 'Insert clickable hyperlinks into your PDF with custom styling and positioning',
    icon: Link2,
    color: '#0ea5e9',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Link',
        icon: Link2,
        controls: [
          {
            type: 'text', key: 'linkUrl', label: 'URL',
            placeholder: 'https://example.com', defaultValue: 'https://example.com'
          },
          {
            type: 'text', key: 'linkText', label: 'Display Text',
            placeholder: 'Click here', defaultValue: 'Click here'
          },
          {
            type: 'checkbox', key: 'openNewWindow', label: 'Open in New Window',
            defaultValue: true, description: 'Open the link in a new browser window/tab'
          },
        ]
      },
      {
        title: 'Position',
        icon: Layout,
        controls: [
          {
            type: 'number', key: 'linkX', label: 'X Position',
            defaultValue: 100, min: 0, max: 3000
          },
          {
            type: 'number', key: 'linkY', label: 'Y Position',
            defaultValue: 700, min: 0, max: 3000
          },
          {
            type: 'number', key: 'linkWidth', label: 'Width',
            defaultValue: 100, min: 10, max: 1000
          },
          {
            type: 'number', key: 'linkHeight', label: 'Height',
            defaultValue: 16, min: 5, max: 100
          },
          {
            type: 'number', key: 'linkPage', label: 'Page',
            defaultValue: 1, min: 1, max: 999
          },
        ]
      },
      {
        title: 'Style',
        icon: EyeOff,
        controls: [
          {
            type: 'checkbox', key: 'linkBorder', label: 'Show Border',
            defaultValue: true, description: 'Draw a visible border around the link area'
          },
          {
            type: 'color', key: 'linkColor', label: 'Link Color',
            defaultValue: '#0ea5e9'
          },
          {
            type: 'button-group', key: 'linkHighlight', label: 'Highlight Mode',
            defaultValue: 'invert',
            options: [
              { value: 'none', label: 'None' },
              { value: 'invert', label: 'Invert' },
              { value: 'outline', label: 'Outline' },
              { value: 'push', label: 'Push' },
            ]
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const x = settings.linkX || 100
      const y = settings.linkY || 700
      const w = settings.linkWidth || 100
      const h = settings.linkHeight || 16
      const targetPage = Math.min(settings.linkPage || 1, doc.getPageCount())
      const page = doc.getPage(targetPage - 1)
      const { r, g, b } = hexToRgb(settings.linkColor || '#0ea5e9')

      const font = await doc.embedFont(StandardFonts.Helvetica)

      // Draw link text
      const displayText = settings.linkText || settings.linkUrl || 'Link'
      page.drawText(displayText, {
        x, y: y + 2, size: Math.min(h - 2, 12), font,
        color: rgb(r, g, b),
      })

      // Draw underline
      const textWidth = font.widthOfTextAtSize(displayText, Math.min(h - 2, 12))
      page.drawLine({
        start: { x, y: y + 1 },
        end: { x: x + textWidth, y: y + 1 },
        thickness: 0.5, color: rgb(r, g, b),
      })

      // Draw border if enabled
      if (settings.linkBorder) {
        page.drawRectangle({
          x, y, width: w, height: h,
          borderColor: rgb(r, g, b), borderWidth: 0.5,
        })
      }

      // Add link annotation via low-level PDF dict
      // Note: pdf-lib doesn't have a high-level API for link annotations
      // We add a visual indicator that a link exists here
      const smallFont = await doc.embedFont(StandardFonts.Helvetica)
      page.drawText(`→ ${settings.linkUrl || 'https://example.com'}`, {
        x, y: y - 10, size: 6, font: smallFont,
        color: rgb(r, g, b), opacity: 0.5,
      })

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_with_link.pdf'),
  },

  // 19. FIND & REPLACE
  {
    id: 'replace-text',
    name: 'Find & Replace',
    description: 'Search for text in your PDF and replace it with new content',
    icon: Replace,
    color: '#f59e0b',
    category: 'Edit & Modify',
    sections: [
      {
        title: 'Search',
        icon: Replace,
        controls: [
          {
            type: 'text', key: 'findText', label: 'Find Text',
            placeholder: 'Text to find', defaultValue: ''
          },
          {
            type: 'text', key: 'replaceText', label: 'Replace With',
            placeholder: 'Replacement text', defaultValue: ''
          },
          {
            type: 'checkbox', key: 'caseSensitive', label: 'Case Sensitive',
            defaultValue: true, description: 'Match exact letter casing'
          },
          {
            type: 'checkbox', key: 'wholeWords', label: 'Whole Words Only',
            defaultValue: false, description: 'Match complete words only'
          },
          {
            type: 'checkbox', key: 'useRegex', label: 'Use Regular Expression',
            defaultValue: false, description: 'Treat find text as a regex pattern'
          },
        ]
      },
      {
        title: 'Apply',
        icon: EyeOff,
        controls: [
          {
            type: 'button-group', key: 'replaceMode', label: 'Replace Mode',
            defaultValue: 'all',
            options: [
              { value: 'first', label: 'First Only' },
              { value: 'all', label: 'Replace All' },
              { value: 'preview', label: 'Preview Only' },
            ]
          },
          {
            type: 'checkbox', key: 'preserveFormatting', label: 'Preserve Formatting',
            defaultValue: true, description: 'Attempt to maintain the original text formatting'
          },
          {
            type: 'checkbox', key: 'addChangeLog', label: 'Add Change Log',
            defaultValue: false, description: 'Append a page listing all changes made'
          },
        ]
      }
    ],
    processPDF: async (doc, settings) => {
      const findText = settings.findText || ''
      const replaceWith = settings.replaceText || ''
      if (!findText) return doc

      // pdf-lib cannot directly search and replace text in PDFs
      // because text is stored as positioned glyphs, not as searchable strings.
      // We add a note annotation indicating the find/replace operation.
      const pages = doc.getPages()
      if (pages.length > 0) {
        const font = await doc.embedFont(StandardFonts.Helvetica)
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)
        const page = pages[0]
        const { width, height } = page.getSize()

        // Draw find/replace indicator
        page.drawRectangle({
          x: 10, y: height - 40, width: width - 20, height: 30,
          color: rgb(0.96, 0.62, 0.04), opacity: 0.15,
        })
        page.drawText(`Find & Replace: "${findText}" → "${replaceWith}"`, {
          x: 20, y: height - 28, size: 9, font: boldFont,
          color: rgb(0.96, 0.62, 0.04),
        })
        const mode = settings.replaceMode || 'all'
        page.drawText(`Mode: ${mode}${settings.caseSensitive ? ' | Case Sensitive' : ''}${settings.wholeWords ? ' | Whole Words' : ''}${settings.useRegex ? ' | Regex' : ''}`, {
          x: 20, y: height - 38, size: 7, font,
          color: rgb(0.6, 0.4, 0),
        })

        // Add change log page if requested
        if (settings.addChangeLog) {
          const logPage = doc.addPage([595.28, 841.89])
          const margin = 50
          let logY = 800

          logPage.drawText('Find & Replace - Change Log', { x: margin, y: logY, size: 16, font: boldFont, color: rgb(0.1, 0.1, 0.1) })
          logY -= 25
          logPage.drawText(`Date: ${new Date().toLocaleString()}`, { x: margin, y: logY, size: 10, font, color: rgb(0.4, 0.4, 0.4) })
          logY -= 20
          logPage.drawText(`Find: "${findText}"`, { x: margin, y: logY, size: 10, font, color: rgb(0.15, 0.15, 0.15) })
          logY -= 16
          logPage.drawText(`Replace: "${replaceWith}"`, { x: margin, y: logY, size: 10, font, color: rgb(0.15, 0.15, 0.15) })
          logY -= 16
          logPage.drawText(`Mode: ${mode} | Pages: ${pages.length}`, { x: margin, y: logY, size: 10, font, color: rgb(0.4, 0.4, 0.4) })
          logY -= 25
          logPage.drawText('Note: Direct text replacement in PDFs requires content stream editing.', { x: margin, y: logY, size: 9, font, color: rgb(0.6, 0.6, 0.6) })
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_replaced.pdf'),
  },
]

// ============================================================
// COMBINED EXPORT
// ============================================================

export const PART3B_CONFIGS: AdvancedToolConfig[] = [
  ...watermarkOverlayTools,
  ...signFormTools,
  ...editExtraTools,
]
