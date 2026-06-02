'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Upload, Download, RotateCw, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  FileText, X, Loader2, CheckCircle2, AlertCircle, Settings,
  Shield, Eye, Layers, Sparkles, Sliders, Zap, ChevronDown, Info
} from 'lucide-react'
import { PDFDocument } from 'pdf-lib'
import Header from '@/components/shared/Header'

// Lazy-load pdfjs-dist
let pdfjsLib: any = null
async function getPdfjsLib() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-workers/pdf.worker.min.mjs'
  }
  return pdfjsLib
}

interface SettingControl {
  type: 'text' | 'number' | 'range' | 'color' | 'select' | 'checkbox' | 'textarea' | 'file' | 'button-group' | 'tags' | 'info'
  key: string
  label: string
  placeholder?: string
  min?: number
  max?: number
  step?: number
  defaultValue?: any
  options?: { value: string; label: string; icon?: any }[]
  accept?: string
  rows?: number
  description?: string
  tags?: string[]
}

interface SettingSection {
  title: string
  icon?: any
  controls: SettingControl[]
}

interface AdvancedToolConfig {
  id: string
  name: string
  description: string
  icon: any
  color: string
  category: string
  allowMultiple?: boolean
  maxFiles?: number
  acceptedTypes?: string
  sections: SettingSection[]
  processPDF: (pdfDoc: PDFDocument, settings: Record<string, any>, files?: File[]) => Promise<PDFDocument | Uint8Array>
  getDownloadName?: (originalName: string, settings: Record<string, any>) => string
}

export type { AdvancedToolConfig, SettingControl, SettingSection }

export default function AdvancedToolPage({ config }: { config: AdvancedToolConfig }) {
  const [files, setFiles] = useState<File[]>([])
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null)
  const [processing, setProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [showSettings, setShowSettings] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [pagePreviews, setPagePreviews] = useState<{ pageNum: number; url: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize settings from config defaults
  const [settings, setSettings] = useState<Record<string, any>>(() => {
    const defaults: Record<string, any> = {}
    config.sections.forEach(section => {
      section.controls.forEach(control => {
        if (control.defaultValue !== undefined) {
          defaults[control.key] = control.defaultValue
        }
      })
    })
    return defaults
  })

  const autoApplyTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setProcessed(false)
  }

  // Auto-apply: process PDF whenever settings change or file is loaded
  useEffect(() => {
    if (!pdfBytes || processing) return
    if (autoApplyTimeoutRef.current) clearTimeout(autoApplyTimeoutRef.current)
    autoApplyTimeoutRef.current = setTimeout(() => {
      handleProcess()
    }, 600) // 600ms debounce
    return () => { if (autoApplyTimeoutRef.current) clearTimeout(autoApplyTimeoutRef.current) }
  }, [pdfBytes, settings])

  const generatePreview = useCallback(async (bytes: ArrayBuffer) => {
    setPreviewLoading(true)
    try {
      const lib = await getPdfjsLib()
      const pdf = await lib.getDocument({ data: new Uint8Array(bytes) }).promise
      const totalPages = pdf.numPages
      setPageCount(totalPages)
      const page = await pdf.getPage(Math.min(currentPage, totalPages))
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
        const viewport = page.getViewport({ scale: 0.25 })
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

  const handleFile = useCallback(async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      setPdfBytes(arrayBuffer)
      setFiles(prev => [...prev, file])
      setCurrentPage(1)
      setProcessed(false)
      setError(null)
      await generatePreview(arrayBuffer)
      await generateAllPreviews(arrayBuffer)
    } catch (err: any) {
      setError(err.message || 'Failed to load file')
    }
  }, [generatePreview, generateAllPreviews])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) handleFile(droppedFiles[0])
  }, [handleFile])

  const handleProcess = useCallback(async () => {
    if (!pdfBytes) return
    setProcessing(true)
    setError(null)
    try {
      const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
      const result = await config.processPDF(doc, settings, files)
      const bytes = result instanceof Uint8Array ? result : await result.save()
      setProcessedBytes(bytes)
      setProcessed(true)
      await generatePreview(bytes.buffer as ArrayBuffer)
      await generateAllPreviews(bytes.buffer as ArrayBuffer)
    } catch (err: any) {
      setError(err.message || 'Processing failed')
    } finally {
      setProcessing(false)
    }
  }, [pdfBytes, settings, files, config, generatePreview, generateAllPreviews])

  const handleDownload = useCallback(() => {
    if (!processedBytes) return
    const blob = new Blob([processedBytes.buffer.slice(processedBytes.byteOffset, processedBytes.byteOffset + processedBytes.byteLength) as ArrayBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const name = files[0]?.name || 'document.pdf'
    a.download = config.getDownloadName
      ? config.getDownloadName(name, settings)
      : name.replace('.pdf', `_${config.id}.pdf`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }, [processedBytes, files, config, settings])

  const handleReset = useCallback(() => {
    setFiles([]); setPdfBytes(null); setProcessed(false); setProcessedBytes(null)
    setError(null); setCurrentPage(1); setPreviewUrl(null); setPagePreviews([])
  }, [])

  const renderControl = (control: SettingControl) => {
    const value = settings[control.key] ?? control.defaultValue

    switch (control.type) {
      case 'text':
        return (
          <div key={control.key}>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">{control.label}</label>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => updateSetting(control.key, e.target.value)}
              placeholder={control.placeholder}
              className="w-full px-3 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        )
      case 'number':
        return (
          <div key={control.key}>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">{control.label}</label>
            <input
              type="number"
              value={value ?? 0}
              onChange={(e) => updateSetting(control.key, parseFloat(e.target.value) || 0)}
              min={control.min}
              max={control.max}
              step={control.step || 1}
              className="w-full px-3 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        )
      case 'range':
        return (
          <div key={control.key}>
            <div className="flex justify-between mb-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{control.label}</label>
              <span className="text-[10px] text-blue-400 font-medium">{value ?? control.defaultValue}{control.step && control.step < 1 ? '%' : control.max && control.max > 100 ? '' : control.min === 0 && control.max ? '%' : ''}</span>
            </div>
            <input
              type="range"
              min={control.min ?? 0}
              max={control.max ?? 100}
              step={control.step ?? 1}
              value={value ?? control.defaultValue ?? 50}
              onChange={(e) => updateSetting(control.key, parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        )
      case 'color':
        return (
          <div key={control.key}>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">{control.label}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={value || control.defaultValue || '#000000'}
                onChange={(e) => updateSetting(control.key, e.target.value)}
                className="w-10 h-10 rounded-lg border border-slate-600 cursor-pointer"
              />
              <div className="flex gap-1.5 flex-1">
                {['#000000', '#FF0000', '#0000FF', '#008000', '#FF6600', '#800080', '#C0C0C0', '#FFFFFF'].map(c => (
                  <button key={c} onClick={() => updateSetting(control.key, c)} className={`w-6 h-6 rounded-lg border-2 transition-all ${value === c ? 'border-white scale-110' : 'border-transparent hover:border-slate-500'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        )
      case 'select':
        return (
          <div key={control.key}>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">{control.label}</label>
            <select
              value={value || control.options?.[0]?.value}
              onChange={(e) => updateSetting(control.key, e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {control.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )
      case 'checkbox':
        return (
          <label key={control.key} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl cursor-pointer">
            <input type="checkbox" checked={!!value} onChange={(e) => updateSetting(control.key, e.target.checked)} className="w-4 h-4 rounded accent-blue-500" />
            <div>
              <div className="text-sm text-white">{control.label}</div>
              {control.description && <div className="text-[10px] text-slate-500">{control.description}</div>}
            </div>
          </label>
        )
      case 'textarea':
        return (
          <div key={control.key}>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">{control.label}</label>
            <textarea
              value={value || ''}
              onChange={(e) => updateSetting(control.key, e.target.value)}
              placeholder={control.placeholder}
              rows={control.rows || 3}
              className="w-full px-3 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        )
      case 'button-group':
        return (
          <div key={control.key}>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">{control.label}</label>
            <div className={`grid grid-cols-${Math.min(control.options?.length || 2, 4)} gap-1.5`}>
              {control.options?.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateSetting(control.key, opt.value)}
                  className={`py-2 px-2 rounded-lg text-[10px] font-medium transition-all ${value === opt.value ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-700/50 text-slate-400 hover:text-white'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )
      case 'tags':
        return (
          <div key={control.key}>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">{control.label}</label>
            <div className="flex flex-wrap gap-1.5">
              {control.tags?.map(tag => (
                <button
                  key={tag}
                  onClick={() => updateSetting(control.key, tag)}
                  className={`px-2.5 py-1 text-[10px] rounded-lg transition-all ${value === tag ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )
      case 'info':
        return (
          <div key={control.key} className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-300/80">{control.description}</p>
          </div>
        )
      case 'file':
        return (
          <div key={control.key}>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">{control.label}</label>
            <label className="block w-full py-6 px-4 border-2 border-dashed border-slate-600 rounded-xl text-center cursor-pointer hover:border-blue-500/50 transition-all">
              <Upload size={20} className="mx-auto mb-1 text-slate-500" />
              <p className="text-[10px] text-slate-500">Click to upload</p>
              <input type="file" accept={control.accept} className="hidden" onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) updateSetting(control.key, f)
              }} />
            </label>
            {value && <p className="text-[10px] text-green-400 mt-1">{value.name}</p>}
          </div>
        )
      default:
        return null
    }
  }

  const Icon = config.icon

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Header currentPath={`/tools/${config.id}`} />

      <div className="max-w-[1600px] mx-auto px-4 py-6">
        {/* Tool Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-500">{config.category}</span>
            <span>/</span>
            <span className="text-white">{config.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: config.color + '20' }}>
              <Icon size={24} style={{ color: config.color }} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold">{config.name}</h1>
              <p className="text-slate-400 text-sm">{config.description}</p>
            </div>
            {processed && (
              <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/30">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">Ready to Download</span>
              </div>
            )}
          </div>
        </div>

        {!pdfBytes ? (
          /* Upload Area */
          <div
            className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all cursor-pointer ${dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/50'}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={config.acceptedTypes || '.pdf'}
              multiple={config.allowMultiple}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
              }}
            />
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: config.color + '15' }}>
              <Upload size={36} style={{ color: config.color }} />
            </div>
            <h3 className="text-xl font-bold mb-2">Drop your PDF here</h3>
            <p className="text-slate-400 mb-4">or click to browse files</p>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Shield size={12} /> 100% Private</span>
              <span className="flex items-center gap-1"><Eye size={12} /> Live Preview</span>
              <span className="flex items-center gap-1"><Zap size={12} /> Instant</span>
            </div>
          </div>
        ) : (
          /* Main Editor Area */
          <div className="flex gap-4 h-[calc(100vh-200px)]">
            {/* Settings Panel */}
            <div className={`${showSettings ? 'w-[380px]' : 'w-0'} flex-shrink-0 transition-all duration-300 overflow-hidden`}>
              <div className="w-[380px] h-full bg-[#1e293b] border border-slate-700 rounded-2xl overflow-y-auto">
                <div className="sticky top-0 bg-[#1e293b] border-b border-slate-700 px-4 py-3 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2"><Settings size={16} className="text-blue-400" /><span className="font-semibold text-sm">Settings</span></div>
                  <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
                </div>

                {/* File Info */}
                <div className="px-4 py-3 border-b border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center"><FileText size={16} className="text-red-400" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{files[0]?.name}</div>
                      <div className="text-xs text-slate-500">{pageCount} pages · {files[0] ? (files[0].size / 1024).toFixed(1) : 0} KB</div>
                    </div>
                    <button onClick={handleReset} className="text-slate-400 hover:text-red-400" title="Remove"><X size={14} /></button>
                  </div>
                </div>

                {/* Tool Sections */}
                <div className="p-4 space-y-5">
                  {config.sections.map((section, si) => (
                    <div key={si}>
                      {section.title && (
                        <div className="flex items-center gap-2 mb-3">
                          {section.icon && <section.icon size={14} className="text-blue-400" />}
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{section.title}</span>
                        </div>
                      )}
                      <div className="space-y-3">
                        {section.controls.map(control => renderControl(control))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-[#1e293b] border-t border-slate-700 p-4 space-y-2">
                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg mb-2">
                      <AlertCircle size={14} />{error}
                    </div>
                  )}
                  <button onClick={handleProcess} disabled={processing} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {processing ? <><Loader2 size={18} className="animate-spin" />Auto-Applying...</> : <><Zap size={18} />{processed ? 'Re-apply' : 'Auto-Apply & Preview'}</>}
                  </button>
                  {processed && processedBytes && (
                    <button onClick={handleDownload} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                      <Download size={18} />Download PDF
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 min-w-0 bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  {!showSettings && (
                    <button onClick={() => setShowSettings(true)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"><Settings size={16} /></button>
                  )}
                  <span className="text-sm text-slate-400">{processed ? 'Modified' : 'Original'} Preview</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); if (pdfBytes) generatePreview(pdfBytes) }} disabled={currentPage <= 1} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 disabled:opacity-30"><ChevronLeft size={16} /></button>
                  <span className="text-xs text-slate-400 min-w-[60px] text-center">{currentPage} / {pageCount}</span>
                  <button onClick={() => { setCurrentPage(p => Math.min(pageCount, p + 1)); if (pdfBytes) generatePreview(pdfBytes) }} disabled={currentPage >= pageCount} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 disabled:opacity-30"><ChevronRight size={16} /></button>
                  <div className="w-px h-4 bg-slate-700 mx-1" />
                  <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400"><ZoomOut size={16} /></button>
                  <span className="text-xs text-slate-400 min-w-[36px] text-center">{zoom}%</span>
                  <button onClick={() => setZoom(z => Math.min(300, z + 25))} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400"><ZoomIn size={16} /></button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6 flex justify-center">
                {previewLoading ? (
                  <div className="flex items-center justify-center h-full"><Loader2 size={32} className="animate-spin text-blue-400" /></div>
                ) : previewUrl ? (
                  <div className="space-y-4">
                    <div className="shadow-2xl shadow-black/50 rounded-lg overflow-hidden">
                      <img src={previewUrl} alt={`Page ${currentPage}`} style={{ width: `${zoom}%`, maxWidth: '100%' }} className="block" />
                    </div>
                    {pageCount > 1 && (
                      <div className="flex justify-center gap-1.5 py-3">
                        {pagePreviews.slice(0, Math.min(pageCount, 20)).map(p => (
                          <button key={p.pageNum} onClick={() => { setCurrentPage(p.pageNum); if (pdfBytes) generatePreview(pdfBytes) }} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${p.pageNum === currentPage ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>{p.pageNum}</button>
                        ))}
                        {pageCount > 20 && <span className="text-slate-500 text-xs self-center">+{pageCount - 20}</span>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">No preview</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
