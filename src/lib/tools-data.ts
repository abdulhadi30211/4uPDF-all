import {
  // Core icons
  Merge, Split, FileDown, FileText, FileType, Pen, Image, FileImage,
  FileEdit, Droplets, RotateCw, Trash2, ArrowUpDown, FileOutput, FileInput,
  Copy, ArrowDownUp, BookOpen, FileType2, FileSpreadsheet,
  Presentation, Smartphone, Book, Code, Globe, AlignLeft,
  Palette, Scissors, Shield, Unlock, Search, Link2, Paintbrush,
  Eye, Zap, Delete, Archive, ScanLine, Camera, RotateCcw,
  Stamp, Layers, Layout, FileCheck, FilePlus, Scale, Hash,
  Grid3X3, File, Settings, Moon, Eraser, Volume2, Mic,
  Layers2, FileDigit, Contrast, FileSymlink, ShieldCheck, Key,
  SearchCheck, Scan, Barcode, Wrench, PaintBucket, Highlighter,
  Pencil, Stamp as StampIcon, FolderOpen, FileMinus, FilePlus2,
  ArrowRightLeft, Move, Download, Upload, ClipboardList,
  FileSearch, Fingerprint, Lock, EyeOff, Filter, RefreshCw,
  CheckSquare, Signpost, Type, Heading, Square, CircleDot,
  // Additional icons for new tools
  FileJson, Braces, StickyNote, Underline, Strikethrough,
  PenLine, CheckCircle, ClipboardCheck, Sidebar, Columns2,
  Maximize, BookMarked, Table, Speaker, MoonStar,
  Megaphone, ArrowDownToLine, MessageSquare, BadgeCheck,
  LayoutGrid, FileCode, Minimize, NotebookPen, FileSignature, Calendar,
  PenTool, Waypoints, Shrink, FileCode2, ListChecks
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'

export interface Tool {
  name: string
  href: string
  desc: string
  icon: LucideIcon
  color: string
  category: string
  popular?: boolean
}

export interface ToolCategory {
  id: string
  name: string
  icon: LucideIcon
  color: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: 'popular',
    name: 'Most Popular',
    icon: Zap,
    color: '#f59e0b',
    metaTitle: 'Most Popular PDF Tools - 4uPDF',
    metaDescription: 'Access the most popular PDF tools loved by millions. Merge, split, compress, convert, and edit PDFs effortlessly with 4uPDF.',
    keywords: ['popular pdf tools', 'best pdf tools', 'merge pdf', 'split pdf', 'compress pdf', 'convert pdf', 'edit pdf']
  },
  {
    id: 'organize',
    name: 'Organize PDF',
    icon: Layers,
    color: '#6366f1',
    metaTitle: 'Organize PDF Pages - Reorder, Extract, Merge | 4uPDF',
    metaDescription: 'Organize your PDF pages with ease. Reorder, extract, insert, duplicate, and rearrange pages in your PDF documents.',
    keywords: ['organize pdf', 'reorder pages', 'extract pages', 'insert pages', 'alternate merge', 'n-up layout', 'pdf booklet']
  },
  {
    id: 'convert',
    name: 'Convert PDF',
    icon: ArrowRightLeft,
    color: '#2563eb',
    metaTitle: 'Convert PDF to Word, Excel, PPT, Image & More | 4uPDF',
    metaDescription: 'Convert PDF to and from Word, Excel, PowerPoint, images, HTML, Markdown, JSON, XML and more. Fast, accurate, and free.',
    keywords: ['convert pdf', 'pdf to word', 'pdf to excel', 'pdf to image', 'pdf to html', 'markdown to pdf', 'json to pdf', 'xml to pdf']
  },
  {
    id: 'edit',
    name: 'Edit & Modify',
    icon: Pencil,
    color: '#3b82f6',
    metaTitle: 'Edit PDF - Add Text, Images, Highlights & More | 4uPDF',
    metaDescription: 'Edit and modify your PDFs with powerful tools. Add text, images, highlights, links, crop pages, redact content, and more.',
    keywords: ['edit pdf', 'add text to pdf', 'highlight pdf', 'add image', 'crop pdf', 'redact pdf', 'add link', 'replace text pdf']
  },
  {
    id: 'security',
    name: 'Security',
    icon: Shield,
    color: '#10b981',
    metaTitle: 'PDF Security - Protect, Unlock, Sign & Certify | 4uPDF',
    metaDescription: 'Secure your PDFs with password protection, digital signatures, certification, and redaction tools. Keep your documents safe.',
    keywords: ['pdf security', 'protect pdf', 'unlock pdf', 'digital signature', 'certify pdf', 'redact pdf', 'encrypt pdf']
  },
  {
    id: 'compress',
    name: 'Compress & Optimize',
    icon: FileDown,
    color: '#f43f5e',
    metaTitle: 'Compress & Optimize PDF - Reduce File Size | 4uPDF',
    metaDescription: 'Compress and optimize your PDF files. Reduce image sizes, convert to grayscale, linearize for web, and minimize file size.',
    keywords: ['compress pdf', 'reduce pdf size', 'optimize pdf', 'linearize pdf', 'grayscale pdf', 'reduce image size pdf']
  },
  {
    id: 'ocr',
    name: 'OCR & Scan',
    icon: ScanLine,
    color: '#8b5cf6',
    metaTitle: 'OCR & PDF Scanner - Extract Text from Scans | 4uPDF',
    metaDescription: 'Extract text from scanned documents with OCR technology. Scan, deskew, and convert images to searchable PDFs.',
    keywords: ['ocr pdf', 'pdf scanner', 'scan to pdf', 'deskew pdf', 'text recognition', 'optical character recognition']
  },
  {
    id: 'watermark',
    name: 'Watermark & Overlay',
    icon: Droplets,
    color: '#ec4899',
    metaTitle: 'Watermark & Overlay PDF - Brand Your Documents | 4uPDF',
    metaDescription: 'Add watermarks, overlays, and branding to your PDFs. Customize text and image watermarks with live preview.',
    keywords: ['watermark pdf', 'add watermark', 'remove watermark', 'overlay pdf', 'brand pdf', 'pdf poster']
  },
  {
    id: 'sign',
    name: 'Sign & Forms',
    icon: Pen,
    color: '#06b6d4',
    metaTitle: 'Sign PDF & Fill Forms - Electronic Signatures | 4uPDF',
    metaDescription: 'Sign PDFs with electronic signatures, fill forms, and request signatures from others. Complete documents digitally.',
    keywords: ['sign pdf', 'e-signature', 'fill form pdf', 'request signature', 'digital signing', 'electronic signature']
  },
  {
    id: 'advanced',
    name: 'Advanced Tools',
    icon: Wrench,
    color: '#f97316',
    metaTitle: 'Advanced PDF Tools - Bates, Bookmarks, Audio & More | 4uPDF',
    metaDescription: 'Advanced PDF tools for power users. Bates numbering, bookmarks, headers, footers, audio conversion, and more.',
    keywords: ['advanced pdf tools', 'bates numbering', 'pdf bookmarks', 'extract tables', 'pdf to audio', 'page labels', 'pdf/a']
  },
  {
    id: 'forms',
    name: 'PDF Forms',
    icon: NotebookPen,
    color: '#0ea5e9',
    metaTitle: 'PDF Form Tools - Create, Fill & Export Forms | 4uPDF',
    metaDescription: 'Create fillable PDF forms, fill out existing forms, flatten, export and import form data. Complete form management.',
    keywords: ['pdf forms', 'create form', 'fill form', 'flatten form', 'export form data', 'import form data', 'fillable pdf']
  },
  {
    id: 'annotation',
    name: 'Annotations',
    icon: MessageSquare,
    color: '#a855f7',
    metaTitle: 'Annotate PDF - Comments, Highlights, Notes & Shapes | 4uPDF',
    metaDescription: 'Annotate your PDFs with comments, highlights, sticky notes, underlines, strikethroughs, and shapes.',
    keywords: ['annotate pdf', 'pdf comments', 'highlight pdf', 'sticky notes', 'underline pdf', 'strikethrough pdf', 'draw shapes']
  },
  {
    id: 'view',
    name: 'View & Read',
    icon: Eye,
    color: '#14b8a6',
    metaTitle: 'View & Read PDF - Dark Mode, Read Aloud, Compare | 4uPDF',
    metaDescription: 'View and read PDFs with comfort features. Dark mode reader, read aloud, side-by-side comparison, and presentation mode.',
    keywords: ['view pdf', 'read pdf', 'dark mode pdf', 'read aloud pdf', 'pdf thumbnails', 'compare pdf', 'presentation mode']
  },
]

export const TOOLS: Tool[] = [
  // ─────────────────────────────────────────────
  // Most Popular (12 tools)
  // ─────────────────────────────────────────────
  { name: 'Merge PDF', href: '/tools/merge', desc: 'Combine multiple PDFs with advanced options', icon: Merge, color: '#10b981', category: 'popular', popular: true },
  { name: 'Split PDF', href: '/tools/split', desc: 'Split PDF with flexible page ranges', icon: Split, color: '#f59e0b', category: 'popular', popular: true },
  { name: 'Compress PDF', href: '/tools/compress', desc: 'Reduce file size with advanced compression', icon: FileDown, color: '#6366f1', category: 'popular', popular: true },
  { name: 'PDF to Word', href: '/tools/pdf-to-word', desc: 'Convert PDF to DOCX format', icon: FileText, color: '#2563eb', category: 'popular', popular: true },
  { name: 'Word to PDF', href: '/tools/word-to-pdf', desc: 'Convert DOCX to PDF format', icon: FileType, color: '#2563eb', category: 'popular', popular: true },
  { name: 'Sign PDF', href: '/tools/sign', desc: 'Add e-signatures with custom placement', icon: Pen, color: '#3b82f6', category: 'popular', popular: true },
  { name: 'PDF to Image', href: '/tools/pdf-to-jpg', desc: 'Convert pages to high-quality images', icon: Image, color: '#ec4899', category: 'popular', popular: true },
  { name: 'Image to PDF', href: '/tools/image-to-pdf', desc: 'Convert images to PDF with layout options', icon: FileImage, color: '#8b5cf6', category: 'popular', popular: true },
  { name: 'Edit PDF', href: '/tools/editor', desc: 'Advanced PDF editor with 137 features', icon: FileEdit, color: '#3b82f6', category: 'popular', popular: true },
  { name: 'Watermark', href: '/tools/watermark', desc: 'Add text/image watermarks with live preview', icon: Droplets, color: '#f43f5e', category: 'popular', popular: true },
  { name: 'Rotate PDF', href: '/tools/rotate', desc: 'Rotate pages with precise angle control', icon: RotateCw, color: '#14b8a6', category: 'popular', popular: true },
  { name: 'Delete Pages', href: '/tools/delete-pages', desc: 'Remove specific pages from PDF', icon: Trash2, color: '#ef4444', category: 'popular', popular: true },

  // ─────────────────────────────────────────────
  // Organize PDF (8 tools)
  // ─────────────────────────────────────────────
  { name: 'Reorder Pages', href: '/tools/reorder', desc: 'Rearrange page order with custom sequences', icon: ArrowUpDown, color: '#6366f1', category: 'organize' },
  { name: 'Extract Pages', href: '/tools/extract', desc: 'Extract specific pages with selection modes', icon: FileOutput, color: '#8b5cf6', category: 'organize' },
  { name: 'Insert Pages', href: '/tools/insert', desc: 'Insert blank pages or pages from another PDF', icon: FileInput, color: '#3b82f6', category: 'organize' },
  { name: 'Duplicate Pages', href: '/tools/duplicate', desc: 'Copy and duplicate pages within PDF', icon: Copy, color: '#06b6d4', category: 'organize' },
  { name: 'Reverse Order', href: '/tools/reverse-order', desc: 'Reverse page sequence of PDF', icon: ArrowDownUp, color: '#64748b', category: 'organize' },
  { name: 'Booklet', href: '/tools/booklet', desc: 'Create booklet layout for printing', icon: BookOpen, color: '#14b8a6', category: 'organize' },
  { name: 'Alternate Merge', href: '/tools/alternate-merge', desc: 'Interleave pages from two PDFs alternately', icon: Waypoints, color: '#10b981', category: 'organize' },
  { name: 'N-Up Layout', href: '/tools/nup', desc: 'Place multiple pages per sheet for printing', icon: Grid3X3, color: '#8b5cf6', category: 'organize' },

  // ─────────────────────────────────────────────
  // Convert PDF (22 tools)
  // ─────────────────────────────────────────────
  { name: 'PDF to JPG', href: '/tools/pdf-to-jpg', desc: 'Convert to JPEG with quality control', icon: FileImage, color: '#f59e0b', category: 'convert' },
  { name: 'PDF to PNG', href: '/tools/pdf-to-png', desc: 'Convert to PNG with transparency', icon: FileType2, color: '#3b82f6', category: 'convert' },
  { name: 'Excel to PDF', href: '/tools/excel-to-pdf', desc: 'Convert XLSX spreadsheets to PDF', icon: FileSpreadsheet, color: '#16a34a', category: 'convert' },
  { name: 'PDF to Excel', href: '/tools/pdf-to-excel', desc: 'Extract tables from PDF to XLSX', icon: FileSpreadsheet, color: '#16a34a', category: 'convert' },
  { name: 'PPT to PDF', href: '/tools/ppt-to-pdf', desc: 'Convert presentations to PDF', icon: Presentation, color: '#ea580c', category: 'convert' },
  { name: 'PDF to PPT', href: '/tools/pdf-to-ppt', desc: 'Convert PDF to PowerPoint', icon: Presentation, color: '#ea580c', category: 'convert' },
  { name: 'HEIC to PDF', href: '/tools/heic-to-pdf', desc: 'Convert iPhone photos to PDF', icon: Smartphone, color: '#06b6d4', category: 'convert' },
  { name: 'EPUB to PDF', href: '/tools/epub-to-pdf', desc: 'Convert eBooks to PDF format', icon: Book, color: '#8b5cf6', category: 'convert' },
  { name: 'HTML to PDF', href: '/tools/html-to-pdf', desc: 'Convert webpages to PDF', icon: Code, color: '#f97316', category: 'convert' },
  { name: 'PDF to HTML', href: '/tools/pdf-to-html', desc: 'Convert PDF to web format', icon: Globe, color: '#f97316', category: 'convert' },
  { name: 'PDF to Text', href: '/tools/pdf-to-text', desc: 'Extract text with formatting options', icon: AlignLeft, color: '#64748b', category: 'convert' },
  { name: 'Text to PDF', href: '/tools/text-to-pdf', desc: 'Create formatted PDF from text', icon: AlignLeft, color: '#64748b', category: 'convert' },
  { name: 'PDF to SVG', href: '/tools/pdf-to-svg', desc: 'Convert to SVG vector graphics', icon: Palette, color: '#a855f7', category: 'convert' },
  { name: 'PDF to TIFF', href: '/tools/pdf-to-tiff', desc: 'Convert to TIFF format', icon: FileImage, color: '#dc2626', category: 'convert' },
  { name: 'TIFF to PDF', href: '/tools/tiff-to-pdf', desc: 'Convert TIFF images to PDF', icon: FileImage, color: '#dc2626', category: 'convert' },
  { name: 'URL to PDF', href: '/tools/url-to-pdf', desc: 'Save any webpage as PDF', icon: Globe, color: '#0ea5e9', category: 'convert' },
  { name: 'PDF to EPUB', href: '/tools/pdf-to-epub', desc: 'Convert PDF to eBook format', icon: Book, color: '#8b5cf6', category: 'convert' },
  { name: 'Markdown to PDF', href: '/tools/markdown-to-pdf', desc: 'Convert Markdown files to PDF', icon: FileCode, color: '#6366f1', category: 'convert' },
  { name: 'PDF to Markdown', href: '/tools/pdf-to-markdown', desc: 'Convert PDF to Markdown format', icon: Braces, color: '#6366f1', category: 'convert' },
  { name: 'XML to PDF', href: '/tools/xml-to-pdf', desc: 'Convert XML documents to PDF', icon: FileCode2, color: '#f97316', category: 'convert' },
  { name: 'PDF to XML', href: '/tools/pdf-to-xml', desc: 'Extract PDF structure as XML', icon: Code, color: '#f97316', category: 'convert' },
  { name: 'JSON to PDF', href: '/tools/json-to-pdf', desc: 'Convert JSON data to formatted PDF', icon: FileJson, color: '#0ea5e9', category: 'convert' },

  // ─────────────────────────────────────────────
  // Edit & Modify (14 tools)
  // ─────────────────────────────────────────────
  { name: 'Add Image', href: '/tools/add-image', desc: 'Insert images with position and scaling', icon: Image, color: '#8b5cf6', category: 'edit' },
  { name: 'Crop PDF', href: '/tools/crop', desc: 'Trim pages with precise dimensions', icon: Scissors, color: '#eab308', category: 'edit' },
  { name: 'Redact Text', href: '/tools/redact', desc: 'Permanently hide sensitive content', icon: EyeOff, color: '#ef4444', category: 'edit' },
  { name: 'Edit Metadata', href: '/tools/metadata', desc: 'Modify document properties and info', icon: FileSearch, color: '#6366f1', category: 'edit' },
  { name: 'Add QR Code', href: '/tools/add-qr', desc: 'Insert QR codes with custom content', icon: Barcode, color: '#0ea5e9', category: 'edit' },
  { name: 'Flatten PDF', href: '/tools/flatten', desc: 'Convert form fields to static content', icon: Layers2, color: '#64748b', category: 'edit' },
  { name: 'Anonymize', href: '/tools/anonymize', desc: 'Remove all personal and identifying data', icon: Fingerprint, color: '#ef4444', category: 'edit' },
  { name: 'Add Stamp', href: '/tools/stamp', desc: 'Add professional stamps with live preview', icon: Stamp, color: '#f59e0b', category: 'edit' },
  { name: 'Add Background', href: '/tools/background', desc: 'Set page background color or image', icon: PaintBucket, color: '#8b5cf6', category: 'edit' },
  { name: 'Repair PDF', href: '/tools/repair', desc: 'Fix corrupted or damaged PDF files', icon: Wrench, color: '#10b981', category: 'edit' },
  { name: 'Highlight', href: '/tools/highlight', desc: 'Highlight text with custom colors and opacity', icon: Highlighter, color: '#eab308', category: 'edit' },
  { name: 'Add Text', href: '/tools/add-text', desc: 'Insert text with fonts, size, and color options', icon: Type, color: '#3b82f6', category: 'edit' },
  { name: 'Add Link', href: '/tools/add-link', desc: 'Add clickable hyperlinks to PDF pages', icon: Link2, color: '#0ea5e9', category: 'edit' },
  { name: 'Replace Text', href: '/tools/replace-text', desc: 'Find and replace text across the document', icon: ArrowRightLeft, color: '#f97316', category: 'edit' },

  // ─────────────────────────────────────────────
  // Security (6 tools)
  // ─────────────────────────────────────────────
  { name: 'Protect PDF', href: '/tools/protect', desc: 'Add password and permission controls', icon: Lock, color: '#10b981', category: 'security' },
  { name: 'Unlock PDF', href: '/tools/unlock', desc: 'Remove password protection', icon: Unlock, color: '#f59e0b', category: 'security' },
  { name: 'Search & Redact', href: '/tools/search-redact', desc: 'Find and redact text patterns', icon: SearchCheck, color: '#ef4444', category: 'security' },
  { name: 'Remove Links', href: '/tools/remove-link', desc: 'Strip all hyperlinks from PDF', icon: Link2, color: '#64748b', category: 'security' },
  { name: 'Digital Signature', href: '/tools/digital-signature', desc: 'Add verified digital signatures to PDFs', icon: ShieldCheck, color: '#059669', category: 'security' },
  { name: 'Certify PDF', href: '/tools/certify', desc: 'Certify document authenticity and integrity', icon: BadgeCheck, color: '#10b981', category: 'security' },

  // ─────────────────────────────────────────────
  // Compress & Optimize (6 tools)
  // ─────────────────────────────────────────────
  { name: 'Grayscale', href: '/tools/grayscale', desc: 'Convert to black and white', icon: Contrast, color: '#64748b', category: 'compress' },
  { name: 'Optimize Images', href: '/tools/optimize-images', desc: 'Compress embedded images in PDF', icon: Eye, color: '#10b981', category: 'compress' },
  { name: 'Delete Blank Pages', href: '/tools/delete-blank', desc: 'Auto-detect and remove blank pages', icon: Delete, color: '#ef4444', category: 'compress' },
  { name: 'PDF to PDF/A', href: '/tools/pdf-to-pdfa', desc: 'Convert to archival PDF/A format', icon: Archive, color: '#0ea5e9', category: 'compress' },
  { name: 'Reduce Image Size', href: '/tools/reduce-image-size', desc: 'Downscale and compress images in PDF', icon: Shrink, color: '#f43f5e', category: 'compress' },
  { name: 'Linearize PDF', href: '/tools/linearize', desc: 'Optimize for fast web viewing and streaming', icon: ArrowDownToLine, color: '#6366f1', category: 'compress' },

  // ─────────────────────────────────────────────
  // OCR & Scan (4 tools)
  // ─────────────────────────────────────────────
  { name: 'OCR', href: '/tools/ocr', desc: 'Recognize text in scanned documents', icon: ScanLine, color: '#3b82f6', category: 'ocr' },
  { name: 'PDF Scanner', href: '/tools/pdf-scanner', desc: 'Scan documents to PDF', icon: Camera, color: '#6366f1', category: 'ocr' },
  { name: 'Deskew', href: '/tools/deskew', desc: 'Fix crooked or tilted scans', icon: RotateCcw, color: '#14b8a6', category: 'ocr' },
  { name: 'Scanner', href: '/tools/scanner', desc: 'Camera scan with auto-enhance', icon: Scan, color: '#6366f1', category: 'ocr' },

  // ─────────────────────────────────────────────
  // Watermark & Overlay (5 tools)
  // ─────────────────────────────────────────────
  { name: 'Remove Watermark', href: '/tools/remove-watermark', desc: 'Remove existing watermarks with live preview', icon: Eraser, color: '#ef4444', category: 'watermark' },
  { name: 'Overlay PDFs', href: '/tools/overlay', desc: 'Layer PDF content on top of each other', icon: Layers, color: '#8b5cf6', category: 'watermark' },
  { name: 'Overlay Image', href: '/tools/overlay-image', desc: 'Add image overlay to pages', icon: Layers2, color: '#8b5cf6', category: 'watermark' },
  { name: 'Poster', href: '/tools/poster', desc: 'Split page into tiles for large printing', icon: Layout, color: '#f97316', category: 'watermark' },
  { name: 'Apply Branding', href: '/tools/apply-branding', desc: 'Add company logo and brand elements to PDF', icon: Megaphone, color: '#ec4899', category: 'watermark' },

  // ─────────────────────────────────────────────
  // Sign & Forms (6 tools)
  // ─────────────────────────────────────────────
  { name: 'Create Form', href: '/tools/create-form', desc: 'Add fillable form fields to PDF', icon: FileCheck, color: '#3b82f6', category: 'sign' },
  { name: 'Extract Images', href: '/tools/extract-images', desc: 'Save all embedded images', icon: Image, color: '#ec4899', category: 'sign' },
  { name: 'Extract Attachments', href: '/tools/extract-attachments', desc: 'Download embedded files', icon: FileOutput, color: '#0ea5e9', category: 'sign' },
  { name: 'Compare PDFs', href: '/tools/compare', desc: 'Find differences between two PDFs', icon: ClipboardList, color: '#6366f1', category: 'sign' },
  { name: 'Fill Form', href: '/tools/fill-form-sign', desc: 'Fill and complete PDF form fields', icon: PenLine, color: '#06b6d4', category: 'sign' },
  { name: 'Request Signature', href: '/tools/request-signature', desc: 'Send documents for others to sign', icon: Signpost, color: '#0ea5e9', category: 'sign' },

  // ─────────────────────────────────────────────
  // Advanced Tools (16 tools)
  // ─────────────────────────────────────────────
  { name: 'Scale Content', href: '/tools/scale-content', desc: 'Resize page content with scaling', icon: Scale, color: '#f59e0b', category: 'advanced' },
  { name: 'Header & Footer', href: '/tools/header-footer', desc: 'Add headers, footers, and page numbers', icon: Heading, color: '#64748b', category: 'advanced' },
  { name: 'Bates Numbering', href: '/tools/bates-numbering', desc: 'Legal Bates numbering for documents', icon: Hash, color: '#3b82f6', category: 'advanced' },
  { name: 'Create Blank PDF', href: '/tools/create-blank', desc: 'Generate blank PDF documents', icon: FilePlus, color: '#64748b', category: 'advanced' },
  { name: 'Initial View', href: '/tools/initial-view', desc: 'Set PDF open and display settings', icon: Settings, color: '#0ea5e9', category: 'advanced' },
  { name: 'Dark Mode', href: '/tools/dark-mode', desc: 'Apply dark reading mode to PDF', icon: Moon, color: '#6366f1', category: 'advanced' },
  { name: 'Rotate Specific', href: '/tools/rotate-specific', desc: 'Rotate selected pages with custom angles', icon: RotateCcw, color: '#14b8a6', category: 'advanced' },
  { name: 'PDF Repair', href: '/tools/pdf-repair', desc: 'Advanced repair for damaged PDFs', icon: Wrench, color: '#10b981', category: 'advanced' },
  { name: 'Remove Duplicates', href: '/tools/duplicate-page-remover', desc: 'Detect and remove duplicate pages', icon: Filter, color: '#ef4444', category: 'advanced' },
  { name: 'PDF to Audio', href: '/tools/pdf-to-audio', desc: 'Convert PDF text to speech audio', icon: Volume2, color: '#a855f7', category: 'advanced' },
  { name: 'Read Aloud', href: '/tools/speech', desc: 'Listen to PDF content with TTS', icon: Mic, color: '#a855f7', category: 'advanced' },
  { name: 'Multipage Image', href: '/tools/multipage-image', desc: 'Combine multiple scans into PDF', icon: Layers2, color: '#ec4899', category: 'advanced' },
  { name: 'Page Labels', href: '/tools/page-labels', desc: 'Set custom page labels and numbering', icon: FileDigit, color: '#0ea5e9', category: 'advanced' },
  { name: 'Add Bookmark', href: '/tools/add-bookmark', desc: 'Create navigable bookmarks in PDF', icon: BookMarked, color: '#f59e0b', category: 'advanced' },
  { name: 'Extract Tables', href: '/tools/extract-tables', desc: 'Extract tabular data from PDF pages', icon: Table, color: '#16a34a', category: 'advanced' },
  { name: 'PDF/A Conversion', href: '/tools/pdfa-convert', desc: 'Convert to PDF/A for long-term archiving', icon: Archive, color: '#0ea5e9', category: 'advanced' },

  // ─────────────────────────────────────────────
  // PDF Forms (6 tools) - NEW CATEGORY
  // ─────────────────────────────────────────────
  { name: 'Create Form', href: '/tools/create-form', desc: 'Design fillable PDF forms with fields', icon: FilePlus2, color: '#0ea5e9', category: 'forms' },
  { name: 'Fill Form', href: '/tools/fill-form', desc: 'Complete and fill PDF form fields', icon: PenLine, color: '#06b6d4', category: 'forms' },
  { name: 'Flatten Form', href: '/tools/flatten-form', desc: 'Lock form fields as non-editable content', icon: Layers2, color: '#64748b', category: 'forms' },
  { name: 'Export Form Data', href: '/tools/export-form-data', desc: 'Export filled form data as FDF or XFDF', icon: Download, color: '#10b981', category: 'forms' },
  { name: 'Import Form Data', href: '/tools/import-form-data', desc: 'Import form data from FDF or XFDF files', icon: Upload, color: '#3b82f6', category: 'forms' },
  { name: 'Reset Form', href: '/tools/reset-form', desc: 'Clear all filled form fields to default', icon: RotateCcw, color: '#ef4444', category: 'forms' },

  // ─────────────────────────────────────────────
  // Annotations (6 tools) - NEW CATEGORY
  // ─────────────────────────────────────────────
  { name: 'Add Comment', href: '/tools/add-comment', desc: 'Add review comments and annotations', icon: MessageSquare, color: '#3b82f6', category: 'annotation' },
  { name: 'Add Highlight', href: '/tools/add-highlight', desc: 'Highlight important text passages', icon: Highlighter, color: '#eab308', category: 'annotation' },
  { name: 'Add Sticky Note', href: '/tools/add-sticky-note', desc: 'Place sticky notes at any position', icon: StickyNote, color: '#f59e0b', category: 'annotation' },
  { name: 'Add Underline', href: '/tools/add-underline', desc: 'Underline text with style options', icon: Underline, color: '#6366f1', category: 'annotation' },
  { name: 'Add Strikethrough', href: '/tools/add-strikethrough', desc: 'Mark text with strikethrough lines', icon: Strikethrough, color: '#ef4444', category: 'annotation' },
  { name: 'Draw Shapes', href: '/tools/draw-shapes', desc: 'Draw rectangles, circles, arrows and lines', icon: Square, color: '#8b5cf6', category: 'annotation' },

  // ─────────────────────────────────────────────
  // View & Read (6 tools) - NEW CATEGORY
  // ─────────────────────────────────────────────
  { name: 'Read Aloud', href: '/tools/read-aloud', desc: 'Listen to your PDF with text-to-speech', icon: Speaker, color: '#a855f7', category: 'view' },
  { name: 'Dark Mode Reader', href: '/tools/dark-mode-reader', desc: 'Read PDFs in comfortable dark mode', icon: MoonStar, color: '#6366f1', category: 'view' },
  { name: 'Page Thumbnails', href: '/tools/page-thumbnails', desc: 'Browse pages with thumbnail navigation', icon: Sidebar, color: '#0ea5e9', category: 'view' },
  { name: 'Full Screen View', href: '/tools/full-screen-view', desc: 'View PDF in distraction-free full screen', icon: Maximize, color: '#14b8a6', category: 'view' },
  { name: 'Compare Side by Side', href: '/tools/compare-side-by-side', desc: 'Compare two PDFs side by side', icon: Columns2, color: '#f97316', category: 'view' },
  { name: 'Presentation Mode', href: '/tools/presentation-mode', desc: 'Present PDF pages like a slideshow', icon: LayoutGrid, color: '#ec4899', category: 'view' },

  // ─────────────────────────────────────────────
  // More Tools (18 tools) - EXPANDED
  // ─────────────────────────────────────────────
  { name: 'Add Page Numbers', href: '/tools/add-page-numbers', desc: 'Add page numbers with position and format options', icon: Hash, color: '#0ea5e9', category: 'edit' },
  { name: 'PDF Info Viewer', href: '/tools/pdf-info', desc: 'View detailed PDF metadata and statistics', icon: FileSearch, color: '#6366f1', category: 'view' },
  { name: 'Color Inverter', href: '/tools/invert-colors', desc: 'Invert all colors in PDF pages', icon: Contrast, color: '#a855f7', category: 'edit' },
  { name: 'Add Border', href: '/tools/add-border', desc: 'Add decorative or functional page borders', icon: Square, color: '#f59e0b', category: 'edit' },
  { name: 'Remove Annotations', href: '/tools/remove-annotations', desc: 'Strip all annotations and comments from PDF', icon: Eraser, color: '#ef4444', category: 'edit' },
  { name: 'PDF to CSV', href: '/tools/pdf-to-csv', desc: 'Extract tabular data to CSV format', icon: FileSpreadsheet, color: '#16a34a', category: 'convert' },
  { name: 'CSV to PDF', href: '/tools/csv-to-pdf', desc: 'Convert CSV data to formatted PDF table', icon: FileSpreadsheet, color: '#16a34a', category: 'convert' },
  { name: 'Add Date Stamp', href: '/tools/add-date-stamp', desc: 'Insert date and time stamps on pages', icon: Calendar, color: '#f97316', category: 'edit' },
  { name: 'Page Size Changer', href: '/tools/page-size', desc: 'Change PDF page dimensions and size', icon: Maximize, color: '#0ea5e9', category: 'organize' },
  { name: 'PDF to Long Image', href: '/tools/pdf-to-long-image', desc: 'Combine all pages into one vertical image', icon: Layers2, color: '#ec4899', category: 'convert' },
  { name: 'Multi-Stamp', href: '/tools/multi-stamp', desc: 'Apply multiple stamps across pages', icon: StampIcon, color: '#f59e0b', category: 'edit' },
  { name: 'Add Watermark Image', href: '/tools/watermark-image', desc: 'Add image-based watermarks to PDF', icon: Image, color: '#ec4899', category: 'watermark' },
  { name: 'PDF Page Counter', href: '/tools/page-counter', desc: 'Count pages and analyze document structure', icon: FileDigit, color: '#3b82f6', category: 'view' },
  { name: 'Remove Metadata', href: '/tools/remove-metadata', desc: 'Strip all metadata and personal info from PDF', icon: EyeOff, color: '#ef4444', category: 'security' },
  { name: 'Add Table', href: '/tools/add-table', desc: 'Insert customizable tables into PDF', icon: Table, color: '#16a34a', category: 'edit' },
  { name: 'Rotate All Pages', href: '/tools/rotate-all', desc: 'Rotate all pages with one click', icon: RotateCw, color: '#14b8a6', category: 'organize' },
  { name: 'PDF to BMP', href: '/tools/pdf-to-bmp', desc: 'Convert PDF pages to BMP images', icon: FileImage, color: '#dc2626', category: 'convert' },
  { name: 'Add Footer Only', href: '/tools/add-footer', desc: 'Add custom footer text to all pages', icon: ArrowDownToLine, color: '#64748b', category: 'advanced' },
]

export const POPULAR_TOOLS = TOOLS.filter(t => t.popular)

export const getToolsByCategory = (categoryId: string) => TOOLS.filter(t => t.category === categoryId)
