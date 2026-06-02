'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Droplets, Type, Image, RotateCw, Grid3X3, AlignCenter, AlignLeft,
  AlignRight, ChevronDown, Eye, EyeOff, Palette, Sliders, Move, Layers
} from 'lucide-react'
import PDFToolLayout from '@/components/pdf/PDFToolLayout'
import { addTextWatermark, addImageWatermark, hexToRgb } from '@/lib/pdf/utils'
import { PDFDocument, StandardFonts } from 'pdf-lib'

type WatermarkType = 'text' | 'image'
type WatermarkPosition = 'diagonal' | 'center' | 'top' | 'bottom' | 'tiled'
type WatermarkFont = 'Helvetica' | 'TimesRoman' | 'Courier'

const FONT_MAP: Record<WatermarkFont, string> = {
  Helvetica: StandardFonts.Helvetica,
  TimesRoman: StandardFonts.TimesRomanBold,
  Courier: StandardFonts.Courier,
}

export default function WatermarkTool() {
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text')
  const [text, setText] = useState('WATERMARK')
  const [fontSize, setFontSize] = useState(50)
  const [color, setColor] = useState('#C0C0C0')
  const [opacity, setOpacity] = useState(30)
  const [rotation, setRotation] = useState(-45)
  const [position, setPosition] = useState<WatermarkPosition>('diagonal')
  const [fontFamily, setFontFamily] = useState<WatermarkFont>('Helvetica')
  const [imageScale, setImageScale] = useState(30)
  const [imagePosition, setImagePosition] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tiled'>('center')
  const [imageBytes, setImageBytes] = useState<ArrayBuffer | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedPages, setSelectedPages] = useState<'all' | 'first' | 'last' | 'custom'>('all')
  const [customPages, setCustomPages] = useState('')
  const [livePreview, setLivePreview] = useState(true)
  const [strokeEnabled, setStrokeEnabled] = useState(false)
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(1)

  const processPDF = useCallback(async (pdfData: ArrayBuffer): Promise<Uint8Array> => {
    let pdfDoc = await PDFDocument.load(pdfData, { ignoreEncryption: true })

    // Handle page selection
    if (selectedPages !== 'all') {
      const totalPages = pdfDoc.getPageCount()
      let pagesToDelete: number[] = []

      if (selectedPages === 'first') {
        pagesToDelete = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)
      } else if (selectedPages === 'last') {
        pagesToDelete = Array.from({ length: totalPages - 1 }, (_, i) => i + 1)
      } else if (selectedPages === 'custom' && customPages) {
        const targetPages = new Set(customPages.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 1 && n <= totalPages))
        pagesToDelete = Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => !targetPages.has(p))
      }

      if (pagesToDelete.length > 0 && pagesToDelete.length < totalPages) {
        const sorted = pagesToDelete.sort((a, b) => b - a)
        for (const p of sorted) {
          pdfDoc.removePage(p - 1)
        }
        // Re-load to get clean document
        const tempBytes = await pdfDoc.save()
        pdfDoc = await PDFDocument.load(tempBytes, { ignoreEncryption: true })
      }
    }

    if (watermarkType === 'text') {
      pdfDoc = await addTextWatermark(pdfDoc, {
        text: text || 'WATERMARK',
        fontSize,
        color,
        opacity: opacity / 100,
        rotation,
        position,
        fontFamily: FONT_MAP[fontFamily],
      })
    } else if (watermarkType === 'image' && imageBytes) {
      pdfDoc = await addImageWatermark(pdfDoc, imageBytes, {
        opacity: opacity / 100,
        position: imagePosition,
        scale: imageScale / 100,
        rotation,
      })
    }

    return pdfDoc.save()
  }, [watermarkType, text, fontSize, color, opacity, rotation, position, fontFamily, imageBytes, imageScale, imagePosition, selectedPages, customPages])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImageBytes(reader.result as ArrayBuffer)
      setImagePreview(URL.createObjectURL(file))
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <PDFToolLayout
      toolName="Add Watermark"
      toolDescription="Add text or image watermarks to your PDF with live preview"
      toolIcon={<Droplets size={24} className="text-pink-400" />}
      toolColor="#ec4899"
      toolCategory="Watermark & Overlay"
      onProcessPDF={processPDF}
    >
      {() => (
        <div className="space-y-5">
          {/* Watermark Type Toggle */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Watermark Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setWatermarkType('text')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${watermarkType === 'text' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-700/50 text-slate-400 hover:text-white'}`}
              >
                <Type size={16} /> Text
              </button>
              <button
                onClick={() => setWatermarkType('image')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${watermarkType === 'image' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-700/50 text-slate-400 hover:text-white'}`}
              >
                <Image size={16} /> Image
              </button>
            </div>
          </div>

          {watermarkType === 'text' ? (
            <>
              {/* Text Input */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Watermark Text</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter watermark text..."
                  className="w-full px-3 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['CONFIDENTIAL', 'DRAFT', 'APPROVED', 'DO NOT COPY', 'SAMPLE', 'URGENT', 'COPY', 'ORIGINAL'].map(preset => (
                    <button
                      key={preset}
                      onClick={() => setText(preset)}
                      className={`px-2 py-1 text-[10px] rounded-md transition-all ${text === preset ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as WatermarkFont)}
                  className="w-full px-3 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Helvetica">Helvetica</option>
                  <option value="TimesRoman">Times Roman</option>
                  <option value="Courier">Courier</option>
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Image Upload */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Watermark Image</label>
                <label className="block w-full py-8 px-4 border-2 border-dashed border-slate-600 rounded-xl text-center cursor-pointer hover:border-blue-500/50 transition-all">
                  {imagePreview ? (
                    <div className="flex items-center justify-center">
                      <img src={imagePreview} alt="Watermark" className="max-h-24 max-w-full object-contain rounded" />
                    </div>
                  ) : (
                    <div className="text-slate-500">
                      <Image size={24} className="mx-auto mb-2" />
                      <p className="text-xs">Click to upload PNG or JPEG</p>
                    </div>
                  )}
                  <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>

              {/* Image Position */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Image Position</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right', 'tiled'] as const).map(pos => (
                    <button
                      key={pos}
                      onClick={() => setImagePosition(pos)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all ${imagePosition === pos ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                    >
                      {pos.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Scale */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Image Scale</label>
                  <span className="text-xs text-blue-400 font-medium">{imageScale}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={imageScale}
                  onChange={(e) => setImageScale(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </>
          )}

          {/* Position (for text) */}
          {watermarkType === 'text' && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Position</label>
              <div className="grid grid-cols-5 gap-1.5">
                {([
                  { id: 'diagonal' as const, icon: RotateCw, label: 'Diagonal' },
                  { id: 'center' as const, icon: AlignCenter, label: 'Center' },
                  { id: 'top' as const, icon: AlignLeft, label: 'Top' },
                  { id: 'bottom' as const, icon: AlignRight, label: 'Bottom' },
                  { id: 'tiled' as const, icon: Grid3X3, label: 'Tiled' },
                ]).map(pos => (
                  <button
                    key={pos.id}
                    onClick={() => setPosition(pos.id)}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[10px] font-medium transition-all ${position === pos.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-700/50 text-slate-400 hover:text-white'}`}
                  >
                    <pos.icon size={16} />
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Font Size */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Font Size</label>
              <span className="text-xs text-blue-400 font-medium">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="8"
              max="200"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-slate-600 cursor-pointer"
              />
              <div className="flex gap-1.5 flex-1">
                {['#C0C0C0', '#FF0000', '#0000FF', '#FF6600', '#800080', '#008000', '#FFD700', '#000000'].map(c => (
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

          {/* Opacity */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Opacity</label>
              <span className="text-xs text-blue-400 font-medium">{opacity}%</span>
            </div>
            <input
              type="range"
              min="1"
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
            <input
              type="range"
              min="-180"
              max="180"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between mt-1">
              {[-90, -45, 0, 45, 90].map(deg => (
                <button
                  key={deg}
                  onClick={() => setRotation(deg)}
                  className={`text-[10px] px-1.5 py-0.5 rounded ${rotation === deg ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>

          {/* Page Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Apply To Pages</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['all', 'first', 'last', 'custom'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setSelectedPages(mode)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all ${selectedPages === mode ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            {selectedPages === 'custom' && (
              <input
                type="text"
                value={customPages}
                onChange={(e) => setCustomPages(e.target.value)}
                placeholder="e.g., 1,3,5-8"
                className="w-full mt-2 px-3 py-2 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            )}
          </div>

          {/* Live Preview Toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-700/30 rounded-xl">
            <div className="flex items-center gap-2">
              {livePreview ? <Eye size={14} className="text-blue-400" /> : <EyeOff size={14} className="text-slate-500" />}
              <span className="text-xs font-medium">Live Preview</span>
            </div>
            <button
              onClick={() => setLivePreview(!livePreview)}
              className={`w-9 h-5 rounded-full transition-all ${livePreview ? 'bg-blue-600' : 'bg-slate-600'}`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white transition-all ${livePreview ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
            </button>
          </div>
        </div>
      )}
    </PDFToolLayout>
  )
}
