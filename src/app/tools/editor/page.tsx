'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'

// Lazy-load pdfjs-dist only on client side
let pdfjsLib: any = null
async function getPdfjsLib() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-workers/pdf.worker.min.mjs'
  }
  return pdfjsLib
}
import Header from '@/components/shared/Header'
import {
  Upload, Download, RotateCw,
  Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, IndentIncrease, IndentDecrease, List, ListOrdered, Heading1, Heading2,
  Heading3, Subscript, Superscript, CaseSensitive, CaseUpper, CaseLower,
  Pencil, Pen, Eraser, Highlighter, Paintbrush, Square, Circle, Triangle, Minus,
  Image, Link2, Table, Grid3X3, Code, Quote, SeparatorHorizontal, Barcode,
  FilePlus2, Trash2, Copy, ArrowUpDown, Scissors, Layers, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, Eye, Shield, EyeOff,
  MessageSquare, MessageCircle, ThumbsUp, Flag, Bookmark, Star,
  Scissors as Crop, Move, RotateCcw, FlipHorizontal, FlipVertical, Group, Ungroup,
  Scale, RefreshCw, Lock, Unlock, Stamp, Droplets, PaintBucket, Highlighter as Marker,
  Settings, X, Search, Undo2, Redo2, CheckSquare,
  Hash, FileText, File, Paperclip, Calendar, User,
  Zap, Sparkles, Palette, Plus,
  ArrowRight, ArrowUp, ArrowDown, ArrowLeft, CornerUpLeft,
  AlertCircle, CheckCircle2, Loader2, PenTool, Brush, Pipette,
  Target, Spline, Waypoints, Grip, BookOpen, FileInput, FileCheck,
  FlipHorizontal2, FlipVertical2, Columns, Rows, Maximize2, Minimize2,
  Contrast, Moon, Fingerprint, ScanLine
} from 'lucide-react'

// Worker setup happens in the component after mount

const FEATURE_CATEGORIES = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'insert', label: 'Insert', icon: Plus },
  { id: 'draw', label: 'Draw', icon: Pencil },
  { id: 'pages', label: 'Pages', icon: Layers },
  { id: 'annotate', label: 'Annotate', icon: MessageSquare },
  { id: 'transform', label: 'Transform', icon: RefreshCw },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'markup', label: 'Markup', icon: Highlighter },
  { id: 'view', label: 'View', icon: Eye },
] as const

interface EditorFeature {
  id: string
  label: string
  icon: React.ElementType
  category: string
  shortcut?: string
  description?: string
}

const ALL_FEATURES: EditorFeature[] = [
  // TEXT (24 features)
  { id: 'add-text', label: 'Add Text', icon: Type, category: 'text', shortcut: 'T', description: 'Add text to PDF' },
  { id: 'bold', label: 'Bold Text', icon: Bold, category: 'text', shortcut: 'Ctrl+B' },
  { id: 'italic', label: 'Italic Text', icon: Italic, category: 'text', shortcut: 'Ctrl+I' },
  { id: 'underline', label: 'Underline', icon: Underline, category: 'text', shortcut: 'Ctrl+U' },
  { id: 'strikethrough', label: 'Strikethrough', icon: Strikethrough, category: 'text' },
  { id: 'heading1', label: 'Heading 1', icon: Heading1, category: 'text' },
  { id: 'heading2', label: 'Heading 2', icon: Heading2, category: 'text' },
  { id: 'heading3', label: 'Heading 3', icon: Heading3, category: 'text' },
  { id: 'align-left', label: 'Align Left', icon: AlignLeft, category: 'text', shortcut: 'Ctrl+L' },
  { id: 'align-center', label: 'Align Center', icon: AlignCenter, category: 'text', shortcut: 'Ctrl+E' },
  { id: 'align-right', label: 'Align Right', icon: AlignRight, category: 'text', shortcut: 'Ctrl+R' },
  { id: 'align-justify', label: 'Justify', icon: AlignJustify, category: 'text' },
  { id: 'indent-increase', label: 'Increase Indent', icon: IndentIncrease, category: 'text' },
  { id: 'indent-decrease', label: 'Decrease Indent', icon: IndentDecrease, category: 'text' },
  { id: 'bullet-list', label: 'Bullet List', icon: List, category: 'text' },
  { id: 'numbered-list', label: 'Numbered List', icon: ListOrdered, category: 'text' },
  { id: 'subscript', label: 'Subscript', icon: Subscript, category: 'text' },
  { id: 'superscript', label: 'Superscript', icon: Superscript, category: 'text' },
  { id: 'uppercase', label: 'UPPERCASE', icon: CaseUpper, category: 'text' },
  { id: 'lowercase', label: 'lowercase', icon: CaseLower, category: 'text' },
  { id: 'font-size', label: 'Font Size', icon: CaseSensitive, category: 'text' },
  { id: 'font-family', label: 'Font Family', icon: Type, category: 'text' },
  { id: 'text-color', label: 'Text Color', icon: Palette, category: 'text' },
  { id: 'line-height', label: 'Line Height', icon: AlignJustify, category: 'text' },

  // INSERT (23 features)
  { id: 'add-image', label: 'Add Image', icon: Image, category: 'insert', shortcut: 'Ctrl+Shift+I' },
  { id: 'add-link', label: 'Add Link', icon: Link2, category: 'insert', shortcut: 'Ctrl+K' },
  { id: 'add-table', label: 'Add Table', icon: Table, category: 'insert' },
  { id: 'add-divider', label: 'Add Divider', icon: SeparatorHorizontal, category: 'insert' },
  { id: 'add-qr', label: 'Add QR Code', icon: Barcode, category: 'insert' },
  { id: 'add-shape-rect', label: 'Rectangle', icon: Square, category: 'insert' },
  { id: 'add-shape-circle', label: 'Circle', icon: Circle, category: 'insert' },
  { id: 'add-shape-triangle', label: 'Triangle', icon: Triangle, category: 'insert' },
  { id: 'add-shape-line', label: 'Line', icon: Minus, category: 'insert' },
  { id: 'add-shape-arrow', label: 'Arrow', icon: ArrowRight, category: 'insert' },
  { id: 'add-code', label: 'Code Block', icon: Code, category: 'insert' },
  { id: 'add-quote', label: 'Block Quote', icon: Quote, category: 'insert' },
  { id: 'add-stamp', label: 'Add Stamp', icon: Stamp, category: 'insert' },
  { id: 'watermark-text', label: 'Add Watermark', icon: Droplets, category: 'insert' },
  { id: 'background-color', label: 'Background', icon: PaintBucket, category: 'insert' },
  { id: 'add-header-footer', label: 'Header/Footer', icon: Heading1, category: 'insert' },
  { id: 'add-bates', label: 'Bates Number', icon: Hash, category: 'insert' },
  { id: 'add-page-num', label: 'Page Numbers', icon: Hash, category: 'insert' },
  { id: 'add-date', label: 'Date Field', icon: Calendar, category: 'insert' },
  { id: 'add-checkbox', label: 'Checkbox', icon: CheckSquare, category: 'insert' },
  { id: 'add-attachment', label: 'Attachment', icon: Paperclip, category: 'insert' },
  { id: 'add-signature', label: 'Signature', icon: Pen, category: 'insert' },
  { id: 'add-initials', label: 'Initials', icon: User, category: 'insert' },

  // DRAW (17 features)
  { id: 'pen-tool', label: 'Pen', icon: Pen, category: 'draw', shortcut: 'P' },
  { id: 'pencil-tool', label: 'Pencil', icon: Pencil, category: 'draw', shortcut: 'N' },
  { id: 'brush-tool', label: 'Brush', icon: Brush, category: 'draw', shortcut: 'B' },
  { id: 'highlighter-draw', label: 'Highlighter', icon: Highlighter, category: 'draw', shortcut: 'H' },
  { id: 'eraser', label: 'Eraser', icon: Eraser, category: 'draw', shortcut: 'E' },
  { id: 'line-tool', label: 'Line', icon: Minus, category: 'draw' },
  { id: 'arrow-tool', label: 'Arrow', icon: ArrowRight, category: 'draw' },
  { id: 'freehand', label: 'Freehand', icon: PenTool, category: 'draw' },
  { id: 'callout', label: 'Callout', icon: MessageCircle, category: 'draw' },
  { id: 'cloud-shape', label: 'Cloud Shape', icon: MessageSquare, category: 'draw' },
  { id: 'polygon', label: 'Polygon', icon: Waypoints, category: 'draw' },
  { id: 'polyline', label: 'Polyline', icon: Spline, category: 'draw' },
  { id: 'measure', label: 'Measure', icon: Target, category: 'draw' },
  { id: 'color-picker', label: 'Color Picker', icon: Pipette, category: 'draw' },
  { id: 'fill-tool', label: 'Fill Shape', icon: PaintBucket, category: 'draw' },
  { id: 'opacity-tool', label: 'Opacity', icon: Eye, category: 'draw' },
  { id: 'stroke-width', label: 'Stroke Width', icon: Minus, category: 'draw' },

  // PAGES (16 features)
  { id: 'add-page', label: 'Add Page', icon: FilePlus2, category: 'pages' },
  { id: 'delete-page', label: 'Delete Page', icon: Trash2, category: 'pages' },
  { id: 'duplicate-page', label: 'Duplicate Page', icon: Copy, category: 'pages' },
  { id: 'reorder-pages', label: 'Reorder Pages', icon: ArrowUpDown, category: 'pages' },
  { id: 'extract-page', label: 'Extract Page', icon: Scissors, category: 'pages' },
  { id: 'rotate-page', label: 'Rotate Page', icon: RotateCw, category: 'pages' },
  { id: 'rotate-ccw', label: 'Rotate CCW', icon: RotateCcw, category: 'pages' },
  { id: 'crop-page', label: 'Crop Page', icon: Crop, category: 'pages' },
  { id: 'split-pdf', label: 'Split PDF', icon: Scissors, category: 'pages' },
  { id: 'merge-pdf', label: 'Merge PDF', icon: Layers, category: 'pages' },
  { id: 'insert-pages', label: 'Insert Pages', icon: FileInput, category: 'pages' },
  { id: 'replace-page', label: 'Replace Page', icon: RefreshCw, category: 'pages' },
  { id: 'page-labels', label: 'Page Labels', icon: FileText, category: 'pages' },
  { id: 'reverse-order', label: 'Reverse Order', icon: ArrowUpDown, category: 'pages' },
  { id: 'nup-layout', label: 'N-Up Layout', icon: Grid3X3, category: 'pages' },
  { id: 'booklet', label: 'Booklet', icon: BookOpen, category: 'pages' },

  // ANNOTATE (12 features)
  { id: 'comment', label: 'Comment', icon: MessageSquare, category: 'annotate' },
  { id: 'note', label: 'Sticky Note', icon: MessageCircle, category: 'annotate' },
  { id: 'highlight', label: 'Highlight', icon: Highlighter, category: 'annotate' },
  { id: 'underline-ann', label: 'Underline', icon: Underline, category: 'annotate' },
  { id: 'strikethrough-ann', label: 'Strikethrough', icon: Strikethrough, category: 'annotate' },
  { id: 'caret', label: 'Caret', icon: CornerUpLeft, category: 'annotate' },
  { id: 'flag', label: 'Flag', icon: Flag, category: 'annotate' },
  { id: 'bookmark', label: 'Bookmark', icon: Bookmark, category: 'annotate' },
  { id: 'thumbs-up', label: 'Approval', icon: ThumbsUp, category: 'annotate' },
  { id: 'star-ann', label: 'Star', icon: Star, category: 'annotate' },
  { id: 'drawing-ann', label: 'Drawing', icon: Pencil, category: 'annotate' },
  { id: 'redact', label: 'Redact', icon: EyeOff, category: 'annotate' },

  // TRANSFORM (13 features)
  { id: 'scale', label: 'Scale', icon: Scale, category: 'transform' },
  { id: 'rotate-content', label: 'Rotate', icon: RotateCw, category: 'transform' },
  { id: 'flip-h', label: 'Flip Horizontal', icon: FlipHorizontal, category: 'transform' },
  { id: 'flip-v', label: 'Flip Vertical', icon: FlipVertical, category: 'transform' },
  { id: 'move-content', label: 'Move', icon: Move, category: 'transform' },
  { id: 'crop-content', label: 'Crop', icon: Scissors, category: 'transform' },
  { id: 'group', label: 'Group', icon: Group, category: 'transform' },
  { id: 'ungroup', label: 'Ungroup', icon: Ungroup, category: 'transform' },
  { id: 'align-top', label: 'Align Top', icon: ArrowUp, category: 'transform' },
  { id: 'align-bottom', label: 'Align Bottom', icon: ArrowDown, category: 'transform' },
  { id: 'align-left-t', label: 'Align Left', icon: ArrowLeft, category: 'transform' },
  { id: 'align-right-t', label: 'Align Right', icon: ArrowRight, category: 'transform' },
  { id: 'distribute', label: 'Distribute', icon: Grip, category: 'transform' },

  // SECURITY (8 features)
  { id: 'password-protect', label: 'Password Protect', icon: Lock, category: 'security' },
  { id: 'remove-password', label: 'Remove Password', icon: Unlock, category: 'security' },
  { id: 'permissions', label: 'Permissions', icon: Shield, category: 'security' },
  { id: 'redact-content', label: 'Redact Content', icon: EyeOff, category: 'security' },
  { id: 'remove-metadata', label: 'Remove Metadata', icon: Fingerprint, category: 'security' },
  { id: 'remove-links', label: 'Remove Links', icon: Link2, category: 'security' },
  { id: 'digital-sign', label: 'Digital Signature', icon: Pen, category: 'security' },
  { id: 'certify', label: 'Certify Document', icon: FileCheck, category: 'security' },

  // MARKUP (11 features)
  { id: 'stamp-approved', label: 'Approved Stamp', icon: CheckCircle2, category: 'markup' },
  { id: 'stamp-draft', label: 'Draft Stamp', icon: FileText, category: 'markup' },
  { id: 'stamp-confidential', label: 'Confidential', icon: Shield, category: 'markup' },
  { id: 'stamp-urgent', label: 'Urgent', icon: Zap, category: 'markup' },
  { id: 'stamp-reviewed', label: 'Reviewed', icon: Eye, category: 'markup' },
  { id: 'stamp-custom', label: 'Custom Stamp', icon: Stamp, category: 'markup' },
  { id: 'watermark-markup', label: 'Text Watermark', icon: Droplets, category: 'markup' },
  { id: 'watermark-image', label: 'Image Watermark', icon: Image, category: 'markup' },
  { id: 'background-markup', label: 'Background Color', icon: PaintBucket, category: 'markup' },
  { id: 'dark-mode', label: 'Dark Mode View', icon: Moon, category: 'markup' },
  { id: 'grayscale', label: 'Grayscale', icon: Contrast, category: 'markup' },

  // VIEW (13 features)
  { id: 'zoom-in', label: 'Zoom In', icon: ZoomIn, category: 'view', shortcut: 'Ctrl+=' },
  { id: 'zoom-out', label: 'Zoom Out', icon: ZoomOut, category: 'view', shortcut: 'Ctrl+-' },
  { id: 'fit-page', label: 'Fit Page', icon: Maximize2, category: 'view' },
  { id: 'fit-width', label: 'Fit Width', icon: Minimize2, category: 'view' },
  { id: 'single-page', label: 'Single Page', icon: File, category: 'view' },
  { id: 'two-page', label: 'Two Pages', icon: Columns, category: 'view' },
  { id: 'thumbnails', label: 'Thumbnails', icon: Grid3X3, category: 'view' },
  { id: 'scroll-vert', label: 'Vertical Scroll', icon: Rows, category: 'view' },
  { id: 'scroll-horiz', label: 'Horizontal Scroll', icon: Columns, category: 'view' },
  { id: 'fullscreen', label: 'Fullscreen', icon: Maximize2, category: 'view', shortcut: 'F11' },
  { id: 'search-find', label: 'Find & Replace', icon: Search, category: 'view', shortcut: 'Ctrl+F' },
  { id: 'undo', label: 'Undo', icon: Undo2, category: 'view', shortcut: 'Ctrl+Z' },
  { id: 'redo', label: 'Redo', icon: Redo2, category: 'view', shortcut: 'Ctrl+Y' },
]

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { r: 0, g: 0, b: 0 }
  return { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 }
}

export default function PDFEditorPage() {
  const [file, setFile] = useState<File | null>(null)
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [activeCategory, setActiveCategory] = useState('text')
  const [activeFeature, setActiveFeature] = useState<string | null>('add-text')
  const [dragOver, setDragOver] = useState(false)
  const [showThumbnails, setShowThumbnails] = useState(true)
  const [featureSearch, setFeatureSearch] = useState('')
  const [processed, setProcessed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Text editing state
  const [textContent, setTextContent] = useState('Sample Text')
  const [textFontSize, setTextFontSize] = useState(16)
  const [textColor, setTextColor] = useState('#000000')
  const [textX, setTextX] = useState(100)
  const [textY, setTextY] = useState(700)
  const [textFont, setTextFont] = useState('Helvetica')
  const [textRotation, setTextRotation] = useState(0)
  const [textOpacity, setTextOpacity] = useState(100)

  // Watermark state
  const [wmText, setWmText] = useState('WATERMARK')
  const [wmFontSize, setWmFontSize] = useState(50)
  const [wmColor, setWmColor] = useState('#C0C0C0')
  const [wmOpacity, setWmOpacity] = useState(30)
  const [wmRotation, setWmRotation] = useState(-45)

  // Stamp state
  const [stampColor, setStampColor] = useState('#22c55e')

  // Header/Footer state
  const [headerText, setHeaderText] = useState('')
  const [footerText, setFooterText] = useState('')
  const [showPageNumbers, setShowPageNumbers] = useState(true)

  // Background state
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [bgOpacity, setBgOpacity] = useState(10)

  // Page rotation
  const [rotationAngle, setRotationAngle] = useState(90)

  // Preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [pagePreviews, setPagePreviews] = useState<{ pageNum: number; url: string }[]>([])

  const generatePreview = useCallback(async (bytes: ArrayBuffer) => {
    setPreviewLoading(true)
    try {
      const lib = await getPdfjsLib()
      const pdf = await lib.getDocument({ data: new Uint8Array(bytes) }).promise
      const page = await pdf.getPage(currentPage)
      const viewport = page.getViewport({ scale: 1.0 })
      const scale = (zoom / 100) * (800 / viewport.width)
      const scaledViewport = page.getViewport({ scale })

      const canvas = document.createElement('canvas')
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height
      const ctx = canvas.getContext('2d')!

      await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise
      setPreviewUrl(canvas.toDataURL('image/png'))
    } catch (err) {
      console.error('Preview error:', err)
    } finally {
      setPreviewLoading(false)
    }
  }, [currentPage, zoom])

  const generateAllPreviews = useCallback(async (bytes: ArrayBuffer) => {
    try {
      const lib = await getPdfjsLib()
      const pdf = await lib.getDocument({ data: new Uint8Array(bytes) }).promise
      const previews: { pageNum: number; url: string }[] = []
      const maxPages = Math.min(pdf.numPages, 30)
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 0.3 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')!
        await page.render({ canvasContext: ctx, viewport }).promise
        previews.push({ pageNum: i, url: canvas.toDataURL('image/png') })
      }
      setPagePreviews(previews)
    } catch {}
  }, [])

  const handleFile = useCallback(async (selectedFile: File) => {
    setLoading(true)
    setError(null)
    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      setFile(selectedFile)
      setPdfBytes(arrayBuffer)
      const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
      setPageCount(doc.getPageCount())
      setCurrentPage(1)
      setProcessed(false)
      await generatePreview(arrayBuffer)
      await generateAllPreviews(arrayBuffer)
    } catch (err: any) {
      setError(err.message || 'Failed to load PDF')
    } finally {
      setLoading(false)
    }
  }, [generatePreview, generateAllPreviews])

  const applyLiveEdit = useCallback(async () => {
    if (!pdfBytes) return
    setPreviewLoading(true)
    try {
      const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })

      if (activeFeature === 'add-text' && textContent) {
        const fontKey = textFont === 'TimesRoman' ? StandardFonts.TimesRomanBold :
          textFont === 'Courier' ? StandardFonts.Courier :
          StandardFonts.HelveticaBold
        const font = await doc.embedFont(fontKey)
        const page = doc.getPage(currentPage - 1)
        const { r, g, b } = hexToRgb(textColor)
        page.drawText(textContent, {
          x: textX, y: textY, size: textFontSize, font,
          color: rgb(r, g, b), opacity: textOpacity / 100,
          rotate: degrees(textRotation),
        })
      }

      if (activeFeature === 'watermark-text' || activeFeature === 'watermark-markup') {
        const font = await doc.embedFont(StandardFonts.HelveticaBold)
        const { r, g, b } = hexToRgb(wmColor)
        const pages = doc.getPages()
        for (const page of pages) {
          const { width, height } = page.getSize()
          const tw = font.widthOfTextAtSize(wmText, wmFontSize)
          page.drawText(wmText, {
            x: (width - tw * 0.5) / 2, y: height / 2,
            size: wmFontSize, font, color: rgb(r, g, b),
            opacity: wmOpacity / 100, rotate: degrees(wmRotation),
          })
        }
      }

      if (activeFeature?.startsWith('stamp-')) {
        const stampTexts: Record<string, string> = {
          'stamp-approved': 'APPROVED', 'stamp-draft': 'DRAFT',
          'stamp-confidential': 'CONFIDENTIAL', 'stamp-urgent': 'URGENT',
          'stamp-reviewed': 'REVIEWED', 'stamp-custom': 'CUSTOM',
        }
        const text = stampTexts[activeFeature] || 'STAMP'
        const font = await doc.embedFont(StandardFonts.HelveticaBold)
        const { r, g, b } = hexToRgb(stampColor)
        const page = doc.getPage(currentPage - 1)
        const { width, height } = page.getSize()
        const tw = font.widthOfTextAtSize(text, 24)
        const padding = 15
        const sw = tw + padding * 2
        const sh = 54
        const sx = (width - sw) / 2
        const sy = (height - sh) / 2

        page.drawRectangle({
          x: sx, y: sy, width: sw, height: sh,
          borderColor: rgb(r, g, b), borderWidth: 2, borderOpacity: 0.8,
          color: rgb(1, 1, 1), opacity: 0.7,
        })
        page.drawRectangle({
          x: sx + 3, y: sy + 3, width: sw - 6, height: sh - 6,
          borderColor: rgb(r, g, b), borderWidth: 1, borderOpacity: 0.8, opacity: 0,
        })
        page.drawText(text, {
          x: sx + padding, y: sy + padding,
          size: 24, font, color: rgb(r, g, b), opacity: 0.85,
        })
      }

      if (activeFeature === 'add-header-footer') {
        const font = await doc.embedFont(StandardFonts.Helvetica)
        const { r, g, b } = hexToRgb('#333333')
        const pages = doc.getPages()
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i]
          const { width } = page.getSize()
          if (headerText) {
            const tw = font.widthOfTextAtSize(headerText, 10)
            page.drawText(headerText, { x: (width - tw) / 2, y: 780, size: 10, font, color: rgb(r, g, b) })
          }
          if (footerText || showPageNumbers) {
            const footerStr = showPageNumbers
              ? `${footerText ? footerText + ' - ' : ''}Page ${i + 1} of ${pages.length}`
              : footerText
            const tw = font.widthOfTextAtSize(footerStr, 10)
            page.drawText(footerStr, { x: (width - tw) / 2, y: 20, size: 10, font, color: rgb(r, g, b) })
          }
        }
      }

      if (activeFeature === 'background-color' || activeFeature === 'background-markup') {
        const { r, g, b } = hexToRgb(bgColor)
        const pages = doc.getPages()
        for (const page of pages) {
          const { width, height } = page.getSize()
          page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(r, g, b), opacity: bgOpacity / 100 })
        }
      }

      if (activeFeature === 'rotate-page' || activeFeature === 'rotate-ccw') {
        const page = doc.getPage(currentPage - 1)
        const current = page.getRotation().angle
        const angle = activeFeature === 'rotate-page' ? rotationAngle : -rotationAngle
        page.setRotation(degrees(current + angle))
      }

      if (activeFeature === 'delete-page') {
        if (doc.getPageCount() > 1) {
          doc.removePage(currentPage - 1)
          setPageCount(doc.getPageCount())
          setCurrentPage(p => Math.min(p, doc.getPageCount()))
        }
      }

      if (activeFeature === 'duplicate-page') {
        const [copiedPage] = await doc.copyPages(doc, [currentPage - 1])
        doc.insertPage(currentPage, copiedPage)
        setPageCount(doc.getPageCount())
      }

      if (activeFeature === 'add-page') {
        doc.addPage([595.28, 841.89])
        setPageCount(doc.getPageCount())
        setCurrentPage(doc.getPageCount())
      }

      const newBytes = await doc.save()
      setProcessed(true)
      await generatePreview(newBytes.buffer as ArrayBuffer)
      await generateAllPreviews(newBytes.buffer as ArrayBuffer)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPreviewLoading(false)
    }
  }, [pdfBytes, activeFeature, currentPage, textContent, textFontSize, textColor, textX, textY, textFont, textRotation, textOpacity, wmText, wmFontSize, wmColor, wmOpacity, wmRotation, stampColor, headerText, footerText, showPageNumbers, bgColor, bgOpacity, rotationAngle, generatePreview, generateAllPreviews])

  const handleDownload = useCallback(async () => {
    if (!pdfBytes) return
    const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
    const bytes = await doc.save()
    const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file?.name?.replace('.pdf', '') + '_edited.pdf' || 'edited.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }, [pdfBytes, file])

  const handleReset = useCallback(() => {
    setFile(null); setPdfBytes(null); setError(null); setCurrentPage(1)
    setPageCount(0); setPreviewUrl(null); setPagePreviews([]); setProcessed(false)
  }, [])

  const filteredFeatures = featureSearch
    ? ALL_FEATURES.filter(f => f.label.toLowerCase().includes(featureSearch.toLowerCase()) || f.description?.toLowerCase().includes(featureSearch.toLowerCase()))
    : ALL_FEATURES.filter(f => f.category === activeCategory)

  const renderFeaturePanel = () => {
    switch (activeFeature) {
      case 'add-text':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Text Content</label>
              <textarea value={textContent} onChange={(e) => setTextContent(e.target.value)} placeholder="Enter text..." rows={3} className="w-full px-3 py-2 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500">X Position</label>
                <input type="number" value={textX} onChange={(e) => setTextX(parseInt(e.target.value) || 0)} className="w-full px-2 py-1.5 bg-[#0f172a] border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Y Position</label>
                <input type="number" value={textY} onChange={(e) => setTextY(parseInt(e.target.value) || 0)} className="w-full px-2 py-1.5 bg-[#0f172a] border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] text-slate-500">Font Size</label>
                <span className="text-[10px] text-blue-400">{textFontSize}px</span>
              </div>
              <input type="range" min="6" max="144" value={textFontSize} onChange={(e) => setTextFontSize(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Font</label>
              <select value={textFont} onChange={(e) => setTextFont(e.target.value)} className="w-full px-3 py-2 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500">
                <option value="Helvetica">Helvetica</option>
                <option value="TimesRoman">Times Roman</option>
                <option value="Courier">Courier</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-8 h-8 rounded border border-slate-600 cursor-pointer" />
                <div className="flex gap-1">
                  {['#000000', '#FF0000', '#0000FF', '#008000', '#FF6600', '#800080'].map(c => (
                    <button key={c} onClick={() => setTextColor(c)} className={`w-6 h-6 rounded border ${textColor === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] text-slate-500">Rotation</label>
                <span className="text-[10px] text-blue-400">{textRotation}°</span>
              </div>
              <input type="range" min="-180" max="180" value={textRotation} onChange={(e) => setTextRotation(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] text-slate-500">Opacity</label>
                <span className="text-[10px] text-blue-400">{textOpacity}%</span>
              </div>
              <input type="range" min="5" max="100" value={textOpacity} onChange={(e) => setTextOpacity(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
            </div>
          </div>
        )

      case 'watermark-text': case 'watermark-markup':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Watermark Text</label>
              <input type="text" value={wmText} onChange={(e) => setWmText(e.target.value)} className="w-full px-3 py-2 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500" />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['CONFIDENTIAL', 'DRAFT', 'APPROVED', 'DO NOT COPY', 'SAMPLE', 'URGENT'].map(p => (
                  <button key={p} onClick={() => setWmText(p)} className={`px-1.5 py-0.5 text-[9px] rounded ${wmText === p ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>{p}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><label className="text-[10px] text-slate-500">Font Size</label><span className="text-[10px] text-blue-400">{wmFontSize}px</span></div>
              <input type="range" min="10" max="200" value={wmFontSize} onChange={(e) => setWmFontSize(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={wmColor} onChange={(e) => setWmColor(e.target.value)} className="w-8 h-8 rounded border border-slate-600 cursor-pointer" />
                <div className="flex gap-1">
                  {['#C0C0C0', '#FF0000', '#0000FF', '#008000', '#FF6600', '#000000'].map(c => (
                    <button key={c} onClick={() => setWmColor(c)} className={`w-6 h-6 rounded border ${wmColor === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><label className="text-[10px] text-slate-500">Opacity</label><span className="text-[10px] text-blue-400">{wmOpacity}%</span></div>
              <input type="range" min="1" max="100" value={wmOpacity} onChange={(e) => setWmOpacity(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
            </div>
            <div>
              <div className="flex justify-between mb-1"><label className="text-[10px] text-slate-500">Rotation</label><span className="text-[10px] text-blue-400">{wmRotation}°</span></div>
              <input type="range" min="-180" max="180" value={wmRotation} onChange={(e) => setWmRotation(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
            </div>
          </div>
        )

      case 'add-header-footer':
        return (
          <div className="space-y-3">
            <div><label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Header Text</label><input type="text" value={headerText} onChange={(e) => setHeaderText(e.target.value)} placeholder="Header text..." className="w-full px-3 py-2 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500" /></div>
            <div><label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Footer Text</label><input type="text" value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="Footer text..." className="w-full px-3 py-2 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500" /></div>
            <label className="flex items-center gap-2 p-2 bg-slate-700/30 rounded-lg cursor-pointer"><input type="checkbox" checked={showPageNumbers} onChange={(e) => setShowPageNumbers(e.target.checked)} className="w-4 h-4 rounded accent-blue-500" /><span className="text-sm text-white">Show Page Numbers</span></label>
          </div>
        )

      case 'background-color': case 'background-markup':
        return (
          <div className="space-y-3">
            <div><label className="text-[10px] font-semibold text-slate-400 uppercase mb-1 block">Background Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded border border-slate-600 cursor-pointer" />
                <div className="flex gap-1">{['#FFFFFF', '#FFF3CD', '#D1ECF1', '#D4EDDA', '#F8D7DA', '#E2E3E5', '#F5F5F5'].map(c => (
                  <button key={c} onClick={() => setBgColor(c)} className={`w-7 h-7 rounded border ${bgColor === c ? 'border-blue-500' : 'border-slate-600'}`} style={{ backgroundColor: c }} />
                ))}</div>
              </div>
            </div>
            <div><div className="flex justify-between mb-1"><label className="text-[10px] text-slate-500">Opacity</label><span className="text-[10px] text-blue-400">{bgOpacity}%</span></div>
              <input type="range" min="1" max="100" value={bgOpacity} onChange={(e) => setBgOpacity(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500" /></div>
          </div>
        )

      default:
        if (activeFeature?.startsWith('stamp-')) {
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-center p-6 bg-white rounded-xl">
                <div className="px-4 py-2 border-2 rounded font-bold text-lg" style={{ borderColor: stampColor, color: stampColor }}>
                  {activeFeature.replace('stamp-', '').toUpperCase()}
                </div>
              </div>
              <div><label className="text-[10px] text-slate-500 mb-1 block">Stamp Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={stampColor} onChange={(e) => setStampColor(e.target.value)} className="w-8 h-8 rounded border border-slate-600 cursor-pointer" />
                  <div className="flex gap-1">{['#22c55e', '#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#dc2626'].map(c => (
                    <button key={c} onClick={() => setStampColor(c)} className={`w-6 h-6 rounded border ${stampColor === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}</div>
                </div>
              </div>
            </div>
          )
        }
        if (activeFeature === 'rotate-page' || activeFeature === 'rotate-ccw') {
          return (
            <div className="space-y-3">
              <div><div className="flex justify-between mb-1"><label className="text-[10px] text-slate-500">Rotation Angle</label><span className="text-[10px] text-blue-400">{rotationAngle}°</span></div>
                <input type="range" min="1" max="270" value={rotationAngle} onChange={(e) => setRotationAngle(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500" /></div>
              <div className="grid grid-cols-3 gap-1">{[90, 180, 270].map(a => (
                <button key={a} onClick={() => setRotationAngle(a)} className={`py-1.5 rounded text-[10px] ${rotationAngle === a ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>{a}°</button>
              ))}</div>
            </div>
          )
        }
        return (
          <div className="text-center py-8 text-slate-500">
            <Sparkles size={24} className="mx-auto mb-2 text-blue-400" />
            <p className="text-sm">Select a feature from the toolbar</p>
            <p className="text-xs mt-1">Settings will appear here for live editing</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <Header currentPath="/tools/editor" />

      {!file ? (
        <div className="flex-1 flex items-center justify-center">
          <div
            className={`border-2 border-dashed rounded-2xl p-20 text-center transition-all cursor-pointer max-w-2xl ${dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/50'}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]) }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Pencil size={36} className="text-blue-400" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3">Advanced PDF Editor</h2>
            <p className="text-slate-400 mb-2">137 features for complete PDF editing</p>
            <p className="text-slate-500 text-sm mb-6">Drop your PDF here or click to browse</p>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Type size={12} /> Text</span>
              <span className="flex items-center gap-1"><Pencil size={12} /> Draw</span>
              <span className="flex items-center gap-1"><Droplets size={12} /> Watermark</span>
              <span className="flex items-center gap-1"><Stamp size={12} /> Stamps</span>
              <span className="flex items-center gap-1"><Shield size={12} /> Security</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Feature Categories */}
          <div className="w-[56px] bg-[#1e293b] border-r border-slate-700 flex flex-col items-center py-2 gap-1">
            {FEATURE_CATEGORIES.map(cat => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); if (!featureSearch) setActiveFeature(ALL_FEATURES.find(f => f.category === cat.id)?.id || null) }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeCategory === cat.id && !featureSearch ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                  title={cat.label}
                >
                  <Icon size={18} />
                </button>
              )
            })}
            <div className="mt-auto">
              <button
                onClick={() => setShowThumbnails(!showThumbnails)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showThumbnails ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                title="Thumbnails"
              >
                <Grid3X3 size={18} />
              </button>
            </div>
          </div>

          {/* Feature Panel */}
          <div className="w-[260px] bg-[#1e293b] border-r border-slate-700 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-slate-700">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={featureSearch}
                  onChange={(e) => setFeatureSearch(e.target.value)}
                  placeholder="Search features..."
                  className="w-full pl-8 pr-3 py-2 bg-[#0f172a] border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
                {featureSearch ? `Results (${filteredFeatures.length})` : FEATURE_CATEGORIES.find(c => c.id === activeCategory)?.label || 'Features'}
              </div>
              <div className="space-y-0.5">
                {filteredFeatures.map(feature => {
                  const Icon = feature.icon
                  return (
                    <button
                      key={feature.id}
                      onClick={() => setActiveFeature(feature.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${activeFeature === feature.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                    >
                      <Icon size={14} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{feature.label}</div>
                        {feature.shortcut && <div className="text-[9px] text-slate-600">{feature.shortcut}</div>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Center - Preview */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="bg-[#1e293b] border-b border-slate-700 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">PDF Editor</span>
                <span className="text-xs text-slate-500">{file.name}</span>
                {processed && <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded">Modified</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); if (pdfBytes) generatePreview(pdfBytes) }} disabled={currentPage <= 1} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 disabled:opacity-30"><ChevronLeft size={16} /></button>
                <span className="text-xs text-slate-400">{currentPage} / {pageCount}</span>
                <button onClick={() => { setCurrentPage(p => Math.min(pageCount, p + 1)); if (pdfBytes) generatePreview(pdfBytes) }} disabled={currentPage >= pageCount} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 disabled:opacity-30"><ChevronRight size={16} /></button>
                <div className="w-px h-4 bg-slate-700 mx-1" />
                <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400"><ZoomOut size={16} /></button>
                <span className="text-xs text-slate-400 min-w-[36px] text-center">{zoom}%</span>
                <button onClick={() => setZoom(z => Math.min(300, z + 25))} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400"><ZoomIn size={16} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 flex justify-center bg-[#0f172a]">
              {previewLoading ? (
                <div className="flex items-center justify-center h-full"><Loader2 size={32} className="animate-spin text-blue-400" /></div>
              ) : previewUrl ? (
                <div className="shadow-2xl shadow-black/50 rounded-lg overflow-hidden">
                  <img src={previewUrl} alt={`Page ${currentPage}`} style={{ width: `${zoom}%`, maxWidth: '100%' }} className="block" />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500"><p>Loading preview...</p></div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Settings */}
          <div className="w-[300px] bg-[#1e293b] border-l border-slate-700 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Settings size={14} className="text-blue-400" /><span className="text-sm font-semibold">Properties</span></div>
                <button onClick={handleReset} className="text-slate-400 hover:text-red-400 text-xs">Reset</button>
              </div>
            </div>
            <div className="px-3 py-2 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center"><FileText size={12} className="text-red-400" /></div>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium truncate">{file.name}</div>
                  <div className="text-[9px] text-slate-500">{pageCount} pages · {(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {activeFeature ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    {(() => {
                      const f = ALL_FEATURES.find(f => f.id === activeFeature)
                      if (!f) return null
                      const Icon = f.icon
                      return <><Icon size={14} className="text-blue-400" /><span className="text-xs font-semibold text-white">{f.label}</span></>
                    })()}
                  </div>
                  {renderFeaturePanel()}
                </>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Sparkles size={24} className="mx-auto mb-2 text-blue-400" />
                  <p className="text-xs">Select a feature from the left panel</p>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-slate-700 space-y-2">
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg"><AlertCircle size={12} /> {error}</div>
              )}
              <button onClick={applyLiveEdit} disabled={previewLoading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                {previewLoading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} Live Apply
              </button>
              <button onClick={handleDownload} className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                <Download size={14} /> Download
              </button>
            </div>
          </div>

          {/* Page Thumbnails */}
          {showThumbnails && pagePreviews.length > 0 && (
            <div className="w-[120px] bg-[#1e293b] border-l border-slate-700 overflow-y-auto p-2">
              <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider px-1 mb-2">Pages</div>
              {pagePreviews.map(p => (
                <button key={p.pageNum} onClick={() => { setCurrentPage(p.pageNum); if (pdfBytes) generatePreview(pdfBytes) }} className={`w-full mb-2 rounded-lg overflow-hidden border-2 transition-all ${p.pageNum === currentPage ? 'border-blue-500' : 'border-slate-700 hover:border-slate-500'}`}>
                  <img src={p.url} alt={`Page ${p.pageNum}`} className="w-full" />
                  <div className="text-[9px] text-center py-0.5 text-slate-400">{p.pageNum}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
