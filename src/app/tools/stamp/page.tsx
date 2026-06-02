'use client'

import { useState, useCallback } from 'react'
import {
  Stamp, Type, Circle, Square, Diamond, RotateCw, Palette,
  CheckCircle2, XCircle, AlertCircle, FileCheck, Shield, Clock, Star, Zap
} from 'lucide-react'
import PDFToolLayout from '@/components/pdf/PDFToolLayout'
import { addStampToPDF } from '@/lib/pdf/utils'
import { PDFDocument } from 'pdf-lib'

type StampType = 'approved' | 'confidential' | 'draft' | 'final' | 'received' | 'reviewed' | 'urgent' | 'custom'
type StampShape = 'rectangle' | 'circle' | 'diamond'
type BorderStyle = 'single' | 'double' | 'dashed' | 'none'
type StampPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom'

const PRESET_STAMPS: { id: StampType; label: string; color: string; icon: React.ReactNode }[] = [
  { id: 'approved', label: 'APPROVED', color: '#22c55e', icon: <CheckCircle2 size={18} /> },
  { id: 'confidential', label: 'CONFIDENTIAL', color: '#ef4444', icon: <Shield size={18} /> },
  { id: 'draft', label: 'DRAFT', color: '#3b82f6', icon: <FileCheck size={18} /> },
  { id: 'final', label: 'FINAL', color: '#8b5cf6', icon: <Star size={18} /> },
  { id: 'received', label: 'RECEIVED', color: '#06b6d4', icon: <Clock size={18} /> },
  { id: 'reviewed', label: 'REVIEWED', color: '#f59e0b', icon: <CheckCircle2 size={18} /> },
  { id: 'urgent', label: 'URGENT', color: '#dc2626', icon: <Zap size={18} /> },
  { id: 'custom', label: 'Custom', color: '#6366f1', icon: <Type size={18} /> },
]

export default function StampTool() {
  const [stampType, setStampType] = useState<StampType>('approved')
  const [customText, setCustomText] = useState('')
  const [color, setColor] = useState('#22c55e')
  const [fontSize, setFontSize] = useState(24)
  const [shape, setShape] = useState<StampShape>('rectangle')
  const [borderStyle, setBorderStyle] = useState<BorderStyle>('double')
  const [borderWidth, setBorderWidth] = useState(2)
  const [rotation, setRotation] = useState(0)
  const [opacity, setOpacity] = useState(90)
  const [position, setPosition] = useState<StampPosition>('center')
  const [targetPage, setTargetPage] = useState(1)
  const [customX, setCustomX] = useState(200)
  const [customY, setCustomY] = useState(400)
  const [addDate, setAddDate] = useState(false)
  const [addSigner, setAddSigner] = useState(false)
  const [signerName, setSignerName] = useState('')
  const [pagesToApply, setPagesToApply] = useState<'current' | 'all' | 'range'>('current')
  const [pageRange, setPageRange] = useState('1')

  const handleStampTypeChange = (type: StampType) => {
    setStampType(type)
    const preset = PRESET_STAMPS.find(s => s.id === type)
    if (preset) setColor(preset.color)
  }

  const processPDF = useCallback(async (pdfData: ArrayBuffer): Promise<Uint8Array> => {
    let pdfDoc = await PDFDocument.load(pdfData, { ignoreEncryption: true })
    const totalPages = pdfDoc.getPageCount()

    // Determine which pages to apply stamp to
    let pages: number[] = []
    if (pagesToApply === 'current') {
      pages = [Math.min(targetPage, totalPages)]
    } else if (pagesToApply === 'all') {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    } else if (pagesToApply === 'range' && pageRange) {
      // Parse range like "1-3,5,7-9"
      const parts = pageRange.split(',')
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(Number)
          for (let i = start; i <= end && i <= totalPages; i++) {
            if (i >= 1) pages.push(i)
          }
        } else {
          const n = parseInt(part.trim())
          if (n >= 1 && n <= totalPages) pages.push(n)
        }
      }
    }

    for (const pageNum of pages) {
      const page = pdfDoc.getPage(pageNum - 1)
      const { width, height } = page.getSize()

      let x: number, y: number
      switch (position) {
        case 'top-left': x = 40; y = height - 80; break
        case 'top-right': x = width - 250; y = height - 80; break
        case 'bottom-left': x = 40; y = 40; break
        case 'bottom-right': x = width - 250; y = 40; break
        case 'center': x = (width - 200) / 2; y = (height - 60) / 2; break
        case 'custom': x = customX; y = customY; break
        default: x = (width - 200) / 2; y = (height - 60) / 2
      }

      pdfDoc = await addStampToPDF(pdfDoc, {
        text: stampType === 'custom' ? customText : '',
        stampType,
        color,
        fontSize,
        borderStyle,
        borderWidth,
        rotation,
        shape,
        position: { page: pageNum, x, y },
      })

      // Add date line if enabled
      if (addDate) {
        const dateFont = await pdfDoc.embedFont('Helvetica' as any)
        const dateStr = new Date().toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        })
        page.drawText(dateStr, {
          x: x + 15,
          y: y - 5,
          size: 8,
          font: dateFont,
          color: { r: parseInt(color.slice(1, 3), 16) / 255, g: parseInt(color.slice(3, 5), 16) / 255, b: parseInt(color.slice(5, 7), 16) / 255 } as any,
          opacity: opacity / 100,
        })
      }

      // Add signer name if enabled
      if (addSigner && signerName) {
        const signFont = await pdfDoc.embedFont('Helvetica' as any)
        page.drawText(`By: ${signerName}`, {
          x: x + 15,
          y: y - (addDate ? 18 : 5),
          size: 8,
          font: signFont,
          color: { r: parseInt(color.slice(1, 3), 16) / 255, g: parseInt(color.slice(3, 5), 16) / 255, b: parseInt(color.slice(5, 7), 16) / 255 } as any,
          opacity: opacity / 100,
        })
      }
    }

    return pdfDoc.save()
  }, [stampType, customText, color, fontSize, shape, borderStyle, borderWidth, rotation, opacity, position, targetPage, customX, customY, addDate, addSigner, signerName, pagesToApply, pageRange])

  return (
    <PDFToolLayout
      toolName="Add Stamp"
      toolDescription="Add professional stamps to your PDF documents"
      toolIcon={<Stamp size={24} className="text-yellow-400" />}
      toolColor="#f59e0b"
      toolCategory="Edit & Modify"
      onProcessPDF={processPDF}
    >
      {({ pageCount }) => (
        <div className="space-y-5">
          {/* Stamp Type Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Stamp Type</label>
            <div className="grid grid-cols-4 gap-1.5">
              {PRESET_STAMPS.map(stamp => (
                <button
                  key={stamp.id}
                  onClick={() => handleStampTypeChange(stamp.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all ${stampType === stamp.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-700/50 text-slate-400 hover:text-white'}`}
                >
                  {stamp.icon}
                  <span className="text-[9px] font-medium">{stamp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Text (if custom stamp) */}
          {stampType === 'custom' && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Custom Stamp Text</label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter custom stamp text..."
                className="w-full px-3 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Stamp Preview */}
          <div className="flex items-center justify-center p-6 bg-white rounded-xl">
            <div
              className="flex items-center justify-center relative"
              style={{
                width: 180,
                height: 70,
                border: `${borderWidth}px ${borderStyle === 'dashed' ? 'dashed' : 'solid'} ${color}`,
                borderRadius: shape === 'circle' ? '50%' : shape === 'diamond' ? '4px' : '4px',
                transform: `rotate(${rotation}deg)`,
                opacity: opacity / 100,
              }}
            >
              {borderStyle === 'double' && (
                <div
                  className="absolute"
                  style={{
                    width: 170,
                    height: 60,
                    border: `1px solid ${color}`,
                    borderRadius: shape === 'circle' ? '50%' : '2px',
                  }}
                />
              )}
              <span
                style={{
                  color: color,
                  fontSize: `${Math.min(fontSize * 0.5, 16)}px`,
                  fontWeight: 'bold',
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                {stampType === 'custom' ? (customText || 'CUSTOM') : PRESET_STAMPS.find(s => s.id === stampType)?.label}
              </span>
            </div>
          </div>

          {/* Shape */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Stamp Shape</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'rectangle' as const, icon: Square, label: 'Rectangle' },
                { id: 'circle' as const, icon: Circle, label: 'Circle' },
                { id: 'diamond' as const, icon: Diamond, label: 'Diamond' },
              ]).map(s => (
                <button
                  key={s.id}
                  onClick={() => setShape(s.id)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[10px] font-medium transition-all ${shape === s.id ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:text-white'}`}
                >
                  <s.icon size={16} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Stamp Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-slate-600 cursor-pointer"
              />
              <div className="flex gap-1.5 flex-1">
                {['#22c55e', '#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#dc2626', '#000000'].map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-lg border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent hover:border-slate-500'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Font Size</label>
              <span className="text-xs text-blue-400 font-medium">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="10"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Border Style */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Border Style</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['single', 'double', 'dashed', 'none'] as const).map(bs => (
                <button
                  key={bs}
                  onClick={() => setBorderStyle(bs)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-medium capitalize transition-all ${borderStyle === bs ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                >
                  {bs}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Opacity</label>
              <span className="text-xs text-blue-400 font-medium">{opacity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Rotation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rotation</label>
              <span className="text-xs text-blue-400 font-medium">{rotation}°</span>
            </div>
            <div className="flex gap-2">
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="flex-1 h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="flex gap-1.5 mt-1">
              {[-45, -30, 0, 30, 45].map(deg => (
                <button
                  key={deg}
                  onClick={() => setRotation(deg)}
                  className={`text-[10px] px-2 py-0.5 rounded ${rotation === deg ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Position on Page</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right', 'custom'] as const).map(pos => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all ${position === pos ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                >
                  {pos.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
            {position === 'custom' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-[10px] text-slate-500">X Position</label>
                  <input
                    type="number"
                    value={customX}
                    onChange={(e) => setCustomX(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-[#0f172a] border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">Y Position</label>
                  <input
                    type="number"
                    value={customY}
                    onChange={(e) => setCustomY(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-[#0f172a] border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Apply to Pages */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Apply to Pages</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['current', 'all', 'range'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setPagesToApply(mode)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-medium capitalize transition-all ${pagesToApply === mode ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
            {pagesToApply === 'range' && (
              <input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="e.g., 1-3,5,7"
                className="w-full mt-2 px-3 py-2 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            )}
            {pagesToApply === 'current' && (
              <input
                type="number"
                value={targetPage}
                onChange={(e) => setTargetPage(parseInt(e.target.value) || 1)}
                min={1}
                max={pageCount}
                className="w-full mt-2 px-3 py-2 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            )}
          </div>

          {/* Additional Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-2.5 bg-slate-700/30 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={addDate}
                onChange={(e) => setAddDate(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-500"
              />
              <div>
                <div className="text-sm text-white">Add Date</div>
                <div className="text-[10px] text-slate-500">Include current date below stamp</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-2.5 bg-slate-700/30 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={addSigner}
                onChange={(e) => setAddSigner(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-500"
              />
              <div>
                <div className="text-sm text-white">Add Signer Name</div>
                <div className="text-[10px] text-slate-500">Include signer name below stamp</div>
              </div>
            </label>

            {addSigner && (
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Signer name..."
                className="w-full px-3 py-2 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            )}
          </div>
        </div>
      )}
    </PDFToolLayout>
  )
}
