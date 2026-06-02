'use client'

import { useState, useCallback } from 'react'

// Lazy-load pdfjs-dist only on client side
let pdfjsLib: any = null
async function getPdfjsLib() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-workers/pdf.worker.min.mjs'
  }
  return pdfjsLib
}

export interface PDFPagePreview {
  pageNum: number
  dataUrl: string
  width: number
  height: number
}

export function usePDFPreview() {
  const [previews, setPreviews] = useState<PDFPagePreview[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pageCount, setPageCount] = useState(0)

  const generatePreviews = useCallback(async (pdfData: ArrayBuffer, maxPages?: number) => {
    setLoading(true)
    setError(null)
    try {
      const lib = await getPdfjsLib()
      const pdf = await lib.getDocument({ data: new Uint8Array(pdfData) }).promise
      const total = pdf.numPages
      setPageCount(total)
      const pagesToRender = maxPages ? Math.min(total, maxPages) : total
      const newPreviews: PDFPagePreview[] = []

      for (let i = 1; i <= pagesToRender; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1.0 })
        const scale = 800 / viewport.width
        const scaledViewport = page.getViewport({ scale })

        const canvas = document.createElement('canvas')
        canvas.width = scaledViewport.width
        canvas.height = scaledViewport.height
        const ctx = canvas.getContext('2d')!

        await page.render({
          canvasContext: ctx,
          viewport: scaledViewport,
        }).promise

        newPreviews.push({
          pageNum: i,
          dataUrl: canvas.toDataURL('image/png'),
          width: viewport.width,
          height: viewport.height,
        })
      }

      setPreviews(newPreviews)
    } catch (err: any) {
      setError(err.message || 'Failed to generate preview')
    } finally {
      setLoading(false)
    }
  }, [])

  const generateSinglePagePreview = useCallback(async (pdfData: ArrayBuffer, pageNum: number) => {
    try {
      const lib = await getPdfjsLib()
      const pdf = await lib.getDocument({ data: new Uint8Array(pdfData) }).promise
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 1.0 })
      const scale = 800 / viewport.width
      const scaledViewport = page.getViewport({ scale })

      const canvas = document.createElement('canvas')
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height
      const ctx = canvas.getContext('2d')!

      await page.render({
        canvasContext: ctx,
        viewport: scaledViewport,
      }).promise

      return {
        pageNum,
        dataUrl: canvas.toDataURL('image/png'),
        width: viewport.width,
        height: viewport.height,
      }
    } catch {
      return null
    }
  }, [])

  return {
    previews,
    loading,
    error,
    pageCount,
    generatePreviews,
    generateSinglePagePreview,
    setPreviews,
  }
}
