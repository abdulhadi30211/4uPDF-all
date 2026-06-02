'use client'

import { PDFDocument, rgb, degrees, StandardFonts, PDFPage, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from 'pdf-lib'

/**
 * Load a PDF from an ArrayBuffer
 */
export async function loadPDF(data: ArrayBuffer): Promise<PDFDocument> {
  return PDFDocument.load(data, { ignoreEncryption: true })
}

/**
 * Save a PDF document to bytes
 */
export async function savePDF(pdfDoc: PDFDocument): Promise<Uint8Array> {
  return pdfDoc.save()
}

/**
 * Convert hex color string to pdf-lib rgb
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { r: 0, g: 0, b: 0 }
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  }
}

/**
 * Convert hex to pdf-lib rgb
 */
export function hexToPdfLibColor(hex: string, opacity: number = 1) {
  const { r, g, b } = hexToRgb(hex)
  return rgb(r, g, b)
}

/**
 * Add text watermark to all pages
 */
export async function addTextWatermark(
  pdfDoc: PDFDocument,
  options: {
    text: string
    fontSize?: number
    color?: string
    opacity?: number
    rotation?: number
    position?: 'center' | 'diagonal' | 'top' | 'bottom' | 'tiled'
    fontFamily?: string
  }
): Promise<PDFDocument> {
  const {
    text,
    fontSize = 50,
    color = '#C0C0C0',
    opacity = 0.3,
    rotation = -45,
    position = 'diagonal',
    fontFamily = StandardFonts.Helvetica,
  } = options

  const font = await pdfDoc.embedFont(fontFamily)
  const { r, g, b } = hexToRgb(color)
  const pages = pdfDoc.getPages()

  for (const page of pages) {
    const { width, height } = page.getSize()

    if (position === 'tiled') {
      // Tile watermark across the page
      const textWidth = font.widthOfTextAtSize(text, fontSize)
      const cols = Math.ceil(width / (textWidth + 80)) + 1
      const rows = Math.ceil(height / (fontSize * 2.5)) + 1

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * (textWidth + 80) + (row % 2 === 0 ? 0 : textWidth / 2)
          const y = height - row * fontSize * 2.5

          page.drawText(text, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(r, g, b),
            opacity,
            rotate: degrees(rotation),
          })
        }
      }
    } else if (position === 'center') {
      const textWidth = font.widthOfTextAtSize(text, fontSize)
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: height / 2,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity,
      })
    } else if (position === 'diagonal') {
      const textWidth = font.widthOfTextAtSize(text, fontSize)
      page.drawText(text, {
        x: (width - textWidth * 0.5) / 2,
        y: height / 2,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity,
        rotate: degrees(rotation),
      })
    } else if (position === 'top') {
      const textWidth = font.widthOfTextAtSize(text, fontSize)
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: height - fontSize - 30,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity,
      })
    } else if (position === 'bottom') {
      const textWidth = font.widthOfTextAtSize(text, fontSize)
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: 30,
        size: fontSize,
        font,
        color: rgb(r, g, b),
        opacity,
      })
    }
  }

  return pdfDoc
}

/**
 * Add image watermark to all pages
 */
export async function addImageWatermark(
  pdfDoc: PDFDocument,
  imageBytes: ArrayBuffer,
  options: {
    opacity?: number
    position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tiled'
    scale?: number
    rotation?: number
  }
): Promise<PDFDocument> {
  const {
    opacity = 0.3,
    position = 'center',
    scale = 0.3,
    rotation = 0,
  } = options

  // Try to embed as PNG first, then JPEG
  let image
  try {
    image = await pdfDoc.embedPng(imageBytes)
  } catch {
    try {
      image = await pdfDoc.embedJpg(imageBytes)
    } catch {
      throw new Error('Unsupported image format. Please use PNG or JPEG.')
    }
  }

  const imageDims = image.scale(scale)
  const pages = pdfDoc.getPages()

  for (const page of pages) {
    const { width, height } = page.getSize()

    if (position === 'tiled') {
      const cols = Math.ceil(width / (imageDims.width + 20))
      const rows = Math.ceil(height / (imageDims.height + 20))
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          page.drawImage(image, {
            x: col * (imageDims.width + 20),
            y: height - (row + 1) * (imageDims.height + 20),
            width: imageDims.width,
            height: imageDims.height,
            opacity,
            rotate: degrees(rotation),
          })
        }
      }
    } else {
      let x = (width - imageDims.width) / 2
      let y = (height - imageDims.height) / 2

      if (position === 'top-left') { x = 30; y = height - imageDims.height - 30 }
      else if (position === 'top-right') { x = width - imageDims.width - 30; y = height - imageDims.height - 30 }
      else if (position === 'bottom-left') { x = 30; y = 30 }
      else if (position === 'bottom-right') { x = width - imageDims.width - 30; y = 30 }

      page.drawImage(image, {
        x,
        y,
        width: imageDims.width,
        height: imageDims.height,
        opacity,
        rotate: degrees(rotation),
      })
    }
  }

  return pdfDoc
}

/**
 * Add stamp to PDF
 */
export async function addStampToPDF(
  pdfDoc: PDFDocument,
  options: {
    text: string
    stampType?: 'approved' | 'confidential' | 'draft' | 'final' | 'received' | 'reviewed' | 'urgent' | 'custom'
    color?: string
    fontSize?: number
    borderStyle?: 'single' | 'double' | 'dashed' | 'none'
    borderWidth?: number
    rotation?: number
    position?: { page: number; x: number; y: number }
    shape?: 'rectangle' | 'circle' | 'diamond'
  }
): Promise<PDFDocument> {
  const {
    text,
    stampType = 'custom',
    color = '#FF0000',
    fontSize = 24,
    borderStyle = 'double',
    borderWidth = 2,
    rotation = 0,
    position,
    shape = 'rectangle',
  } = options

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const { r, g, b } = hexToRgb(color)

  // Predefined stamp texts
  const stampTexts: Record<string, string> = {
    approved: 'APPROVED',
    confidential: 'CONFIDENTIAL',
    draft: 'DRAFT',
    final: 'FINAL',
    received: 'RECEIVED',
    reviewed: 'REVIEWED',
    urgent: 'URGENT',
    custom: text,
  }

  const stampText = stampTexts[stampType] || text
  const textWidth = font.widthOfTextAtSize(stampText, fontSize)
  const padding = 15
  const stampWidth = textWidth + padding * 2
  const stampHeight = fontSize + padding * 2

  const pageIndex = position ? position.page - 1 : 0
  const pages = pdfDoc.getPages()

  for (let i = 0; i < pages.length; i++) {
    if (position && i !== pageIndex) continue

    const page = pages[i]
    const { width, height } = page.getSize()

    const x = position ? position.x : (width - stampWidth) / 2
    const y = position ? position.y : (height - stampHeight) / 2

    // Draw stamp background
    if (shape === 'rectangle') {
      page.drawRectangle({
        x,
        y,
        width: stampWidth,
        height: stampHeight,
        borderColor: rgb(r, g, b),
        borderWidth: borderStyle === 'none' ? 0 : borderWidth,
        borderOpacity: 0.8,
        color: rgb(1, 1, 1),
        opacity: 0.7,
        rotate: degrees(rotation),
      })
      if (borderStyle === 'double') {
        page.drawRectangle({
          x: x + 3,
          y: y + 3,
          width: stampWidth - 6,
          height: stampHeight - 6,
          borderColor: rgb(r, g, b),
          borderWidth: 1,
          borderOpacity: 0.8,
          opacity: 0,
          rotate: degrees(rotation),
        })
      }
    }

    // Draw stamp text
    page.drawText(stampText, {
      x: x + padding,
      y: y + padding,
      size: fontSize,
      font,
      color: rgb(r, g, b),
      opacity: 0.85,
      rotate: degrees(rotation),
    })
  }

  return pdfDoc
}

/**
 * Add header/footer to PDF pages
 */
export async function addHeaderFooter(
  pdfDoc: PDFDocument,
  options: {
    headerText?: string
    footerText?: string
    showPageNumbers?: boolean
    fontSize?: number
    color?: string
    position?: 'left' | 'center' | 'right'
    margin?: number
  }
): Promise<PDFDocument> {
  const {
    headerText = '',
    footerText = '',
    showPageNumbers = true,
    fontSize = 10,
    color = '#333333',
    position = 'center',
    margin = 40,
  } = options

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const { r, g, b } = hexToRgb(color)
  const pages = pdfDoc.getPages()

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const { width, height } = page.getSize()
    const pageNum = i + 1
    const totalPages = pages.length

    if (headerText) {
      const textWidth = font.widthOfTextAtSize(headerText, fontSize)
      let x = margin
      if (position === 'center') x = (width - textWidth) / 2
      else if (position === 'right') x = width - textWidth - margin

      page.drawText(headerText, {
        x,
        y: height - margin,
        size: fontSize,
        font,
        color: rgb(r, g, b),
      })
    }

    if (footerText || showPageNumbers) {
      const footerStr = showPageNumbers
        ? `${footerText ? footerText + ' - ' : ''}Page ${pageNum} of ${totalPages}`
        : footerText
      const textWidth = font.widthOfTextAtSize(footerStr, fontSize)
      let x = margin
      if (position === 'center') x = (width - textWidth) / 2
      else if (position === 'right') x = width - textWidth - margin

      page.drawText(footerStr, {
        x,
        y: margin - 10,
        size: fontSize,
        font,
        color: rgb(r, g, b),
      })
    }
  }

  return pdfDoc
}

/**
 * Add Bates numbering to PDF pages
 */
export async function addBatesNumbering(
  pdfDoc: PDFDocument,
  options: {
    prefix?: string
    startNumber?: number
    fontSize?: number
    color?: string
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
    margin?: number
  }
): Promise<PDFDocument> {
  const {
    prefix = '',
    startNumber = 1,
    fontSize = 10,
    color = '#333333',
    position = 'bottom-right',
    margin = 30,
  } = options

  const font = await pdfDoc.embedFont(StandardFonts.Courier)
  const { r, g, b } = hexToRgb(color)
  const pages = pdfDoc.getPages()

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const { width, height } = page.getSize()
    const batesNum = prefix + String(startNumber + i).padStart(6, '0')
    const textWidth = font.widthOfTextAtSize(batesNum, fontSize)

    let x = margin
    let y = margin

    if (position.includes('top')) y = height - margin
    if (position.includes('right')) x = width - textWidth - margin
    if (position.includes('center')) x = (width - textWidth) / 2

    page.drawText(batesNum, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(r, g, b),
    })
  }

  return pdfDoc
}

/**
 * Rotate PDF pages
 */
export async function rotatePDFPages(
  pdfDoc: PDFDocument,
  options: {
    rotation: number
    pageNumbers?: number[]
  }
): Promise<PDFDocument> {
  const pages = pdfDoc.getPages()
  const rotation = options.rotation

  for (let i = 0; i < pages.length; i++) {
    if (options.pageNumbers && !options.pageNumbers.includes(i + 1)) continue
    const currentRotation = pages[i].getRotation().angle
    pages[i].setRotation(degrees(currentRotation + rotation))
  }

  return pdfDoc
}

/**
 * Delete pages from PDF
 */
export async function deletePDFPages(
  pdfDoc: PDFDocument,
  pageNumbers: number[]
): Promise<PDFDocument> {
  // Sort in descending order to avoid index shifting
  const sorted = [...pageNumbers].sort((a, b) => b - a)
  for (const pageNum of sorted) {
    pdfDoc.removePage(pageNum - 1)
  }
  return pdfDoc
}

/**
 * Add background color to PDF pages
 */
export async function addBackground(
  pdfDoc: PDFDocument,
  options: {
    color: string
    opacity?: number
    pageNumbers?: number[]
  }
): Promise<PDFDocument> {
  const { color, opacity = 0.1, pageNumbers } = options
  const { r, g, b } = hexToRgb(color)
  const pages = pdfDoc.getPages()

  for (let i = 0; i < pages.length; i++) {
    if (pageNumbers && !pageNumbers.includes(i + 1)) continue
    const page = pages[i]
    const { width, height } = page.getSize()
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(r, g, b),
      opacity,
    })
  }

  return pdfDoc
}

/**
 * Add QR code text to PDF
 */
export async function addQRTextToPDF(
  pdfDoc: PDFDocument,
  options: {
    text: string
    page: number
    x: number
    y: number
    size?: number
    color?: string
  }
): Promise<PDFDocument> {
  const { text, page: pageNum, x, y, size = 12, color = '#000000' } = options
  const font = await pdfDoc.embedFont(StandardFonts.Courier)
  const { r, g, b } = hexToRgb(color)

  const pages = pdfDoc.getPages()
  if (pageNum <= pages.length) {
    pages[pageNum - 1].drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(r, g, b),
    })
  }

  return pdfDoc
}

/**
 * Get page count from PDF
 */
export function getPDFPageCount(pdfDoc: PDFDocument): number {
  return pdfDoc.getPageCount()
}

/**
 * Get page dimensions
 */
export function getPageDimensions(pdfDoc: PDFDocument) {
  return pdfDoc.getPages().map(page => page.getSize())
}
