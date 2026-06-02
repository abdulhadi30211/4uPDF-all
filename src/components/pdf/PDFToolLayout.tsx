'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Upload, Download, RotateCw, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  FileText, X, Loader2, CheckCircle2, AlertCircle, Maximize2, Settings,
  Droplets, Stamp, Pencil, Shield, Eye, Layers
} from 'lucide-react'
import { usePDFPreview, PDFPagePreview } from '@/lib/pdf/use-pdf-preview'
import Header from '@/components/shared/Header'

interface PDFToolLayoutProps {
  toolName: string
  toolDescription: string
  toolIcon: React.ReactNode
  toolColor: string
  toolCategory: string
  children: (props: {
    file: File | null
    pdfBytes: Uint8Array | null
    onProcess: (processedBytes: Uint8Array) => void
    currentPage: number
    pageCount: number
  }) => React.ReactNode
  onProcessPDF: (pdfBytes: ArrayBuffer) => Promise<Uint8Array>
  acceptedFileTypes?: string
  maxFileSize?: number
  allowMultiple?: boolean
}

export default function PDFToolLayout({
  toolName,
  toolDescription,
  toolIcon,
  toolColor,
  toolCategory,
  children,
  onProcessPDF,
  acceptedFileTypes = '.pdf',
  maxFileSize = 100 * 1024 * 1024,
  allowMultiple = false,
}: PDFToolLayoutProps) {
  const [file, setFile] = useState<File | null>(null)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [originalBytes, setOriginalBytes] = useState<ArrayBuffer | null>(null)
  const [processing, setProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [showSettings, setShowSettings] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoApplyRef = useRef<NodeJS.Timeout | null>(null)

  const {
    previews,
    loading: previewLoading,
    pageCount,
    generatePreviews,
  } = usePDFPreview()

  // Auto-apply when file is uploaded
  useEffect(() => {
    if (originalBytes && !processing && !processed) {
      if (autoApplyRef.current) clearTimeout(autoApplyRef.current)
      autoApplyRef.current = setTimeout(() => {
        handleProcess()
      }, 500)
    }
    return () => { if (autoApplyRef.current) clearTimeout(autoApplyRef.current) }
  }, [originalBytes])

  const handleFile = useCallback(async (selectedFile: File) => {
    if (!selectedFile) return
    if (selectedFile.size > maxFileSize) {
      setError(`File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`)
      return
    }

    setFile(selectedFile)
    setProcessed(false)
    setProcessedBytes(null)
    setError(null)

    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      setOriginalBytes(arrayBuffer)
      const uint8 = new Uint8Array(arrayBuffer)
      setPdfBytes(uint8)
      await generatePreviews(arrayBuffer.slice(0))
      setCurrentPage(1)
    } catch (err: any) {
      setError(err.message || 'Failed to load PDF')
    }
  }, [maxFileSize, generatePreviews])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFile(droppedFile)
  }, [handleFile])

  const handleProcess = useCallback(async () => {
    if (!originalBytes) return
    setProcessing(true)
    setError(null)
    try {
      const result = await onProcessPDF(originalBytes.slice(0))
      setProcessedBytes(result)
      setProcessed(true)
      await generatePreviews(result.buffer as ArrayBuffer)
    } catch (err: any) {
      setError(err.message || 'Processing failed')
    } finally {
      setProcessing(false)
    }
  }, [originalBytes, onProcessPDF, generatePreviews])

  const handleDownload = useCallback(() => {
    if (!processedBytes) return
    const blob = new Blob([processedBytes.buffer.slice(processedBytes.byteOffset, processedBytes.byteOffset + processedBytes.byteLength) as ArrayBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file?.name?.replace('.pdf', '') + `_${toolName.toLowerCase().replace(/\s+/g, '_')}.pdf` || 'processed.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }, [processedBytes, file, toolName])

  const handleReset = useCallback(() => {
    setFile(null)
    setPdfBytes(null)
    setOriginalBytes(null)
    setProcessed(false)
    setProcessedBytes(null)
    setError(null)
    setCurrentPage(1)
    setZoom(100)
  }, [])

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Header currentPath={`/tools/${toolName.toLowerCase().replace(/\s+/g, '-')}`} />

      <div className="max-w-[1600px] mx-auto px-4 py-6">
        {/* Tool Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-500">{toolCategory}</span>
            <span>/</span>
            <span className="text-white">{toolName}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: toolColor + '20' }}>
              {toolIcon}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{toolName}</h1>
              <p className="text-slate-400 text-sm">{toolDescription}</p>
            </div>
            {processed && (
              <div className="ml-auto flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/30">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">Ready to Download</span>
              </div>
            )}
          </div>
        </div>

        {!file ? (
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
              accept={acceptedFileTypes}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Upload size={36} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Drop your PDF here</h3>
            <p className="text-slate-400 mb-4">or click to browse files</p>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Shield size={12} /> 100% Private</span>
              <span className="flex items-center gap-1"><Eye size={12} /> Live Preview</span>
              <span className="flex items-center gap-1"><Layers size={12} /> Browser-based</span>
            </div>
          </div>
        ) : (
          /* Main Editor Area */
          <div className="flex gap-4 h-[calc(100vh-200px)]">
            {/* Settings Panel */}
            <div className={`${showSettings ? 'w-[380px]' : 'w-0'} flex-shrink-0 transition-all duration-300 overflow-hidden`}>
              <div className="w-[380px] h-full bg-[#1e293b] border border-slate-700 rounded-2xl overflow-y-auto">
                <div className="sticky top-0 bg-[#1e293b] border-b border-slate-700 px-4 py-3 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <Settings size={16} className="text-blue-400" />
                    <span className="font-semibold text-sm">Settings</span>
                  </div>
                  <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                    <X size={16} />
                  </button>
                </div>

                {/* File Info */}
                <div className="px-4 py-3 border-b border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <FileText size={16} className="text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{file.name}</div>
                      <div className="text-xs text-slate-500">{pageCount} pages · {(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button onClick={handleReset} className="text-slate-400 hover:text-red-400" title="Remove file">
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Tool-specific settings */}
                <div className="p-4">
                  {children({ file, pdfBytes, onProcess: () => {}, currentPage, pageCount })}
                </div>

                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-[#1e293b] border-t border-slate-700 p-4 space-y-2">
                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg mb-2">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleProcess}
                    disabled={processing}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Auto-Applying...
                      </>
                    ) : (
                      <>
                        <RotateCw size={18} />
                        {processed ? 'Re-apply Changes' : 'Auto-Apply & Preview'}
                      </>
                    )}
                  </button>

                  {processed && processedBytes && (
                    <button
                      onClick={handleDownload}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      Download PDF
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 min-w-0 bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden flex flex-col">
              {/* Preview Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-[#1e293b]">
                <div className="flex items-center gap-2">
                  {!showSettings && (
                    <button onClick={() => setShowSettings(true)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                      <Settings size={16} />
                    </button>
                  )}
                  <span className="text-sm text-slate-400">
                    {processed ? 'Modified Preview' : 'Original Preview'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-slate-400 min-w-[60px] text-center">
                    {currentPage} / {pageCount}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                    disabled={currentPage >= pageCount}
                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="w-px h-4 bg-slate-700 mx-1" />
                  <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                    <ZoomOut size={16} />
                  </button>
                  <span className="text-xs text-slate-400 min-w-[40px] text-center">{zoom}%</span>
                  <button onClick={() => setZoom(z => Math.min(300, z + 25))} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                    <ZoomIn size={16} />
                  </button>
                  <button onClick={() => setZoom(100)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors text-xs font-medium">
                    Fit
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-auto p-6 flex justify-center">
                {previewLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 size={32} className="animate-spin text-blue-400 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">Generating preview...</p>
                    </div>
                  </div>
                ) : previews.length > 0 ? (
                  <div className="space-y-4">
                    {previews
                      .filter(p => p.pageNum === currentPage)
                      .map(preview => (
                        <div key={preview.pageNum} className="shadow-2xl shadow-black/50 rounded-lg overflow-hidden">
                          <img
                            src={preview.dataUrl}
                            alt={`Page ${preview.pageNum}`}
                            style={{ width: `${zoom}%`, maxWidth: '100%' }}
                            className="block"
                          />
                        </div>
                      ))
                    }
                    {pageCount > 1 && (
                      <div className="flex justify-center gap-2 py-4">
                        {previews.slice(0, Math.min(pageCount, 20)).map(p => (
                          <button
                            key={p.pageNum}
                            onClick={() => setCurrentPage(p.pageNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p.pageNum === currentPage ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                          >
                            {p.pageNum}
                          </button>
                        ))}
                        {pageCount > 20 && <span className="text-slate-500 text-xs self-center">...{pageCount - 20} more</span>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    No preview available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
