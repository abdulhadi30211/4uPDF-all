'use client'

import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'
import type { AdvancedToolConfig } from '@/components/pdf/AdvancedToolPage'
import {
  MessageSquare, StickyNote, Underline, Strikethrough, PenLine, Minus, Circle, Square, Star, Speaker, MoonStar, Sidebar, Columns2, Maximize, LayoutGrid, Eye, Presentation, Highlighter
} from 'lucide-react'

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { r: 0, g: 0, b: 0 }
  return { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 }
}

// ============================================================
// ANNOTATION TOOLS
// ============================================================

const annotationTools: AdvancedToolConfig[] = [

  // 1. ADD COMMENT
  {
    id: 'add-comment',
    name: 'Add Comment',
    description: 'Add comment annotations to your PDF with author, subject, and custom styling',
    icon: MessageSquare,
    color: '#3b82f6',
    category: 'Annotation',
    sections: [
      {
        title: 'Comment',
        icon: MessageSquare,
        controls: [
          {
            type: 'textarea', key: 'commentText', label: 'Comment Text',
            placeholder: 'Enter your comment here...', rows: 4, defaultValue: ''
          },
          {
            type: 'text', key: 'commentAuthor', label: 'Author',
            placeholder: 'Your name', defaultValue: 'Anonymous'
          },
          {
            type: 'text', key: 'commentSubject', label: 'Subject',
            placeholder: 'Comment subject', defaultValue: ''
          },
        ]
      },
      {
        title: 'Position',
        icon: Eye,
        controls: [
          {
            type: 'number', key: 'commentX', label: 'X Position',
            defaultValue: 50, min: 0, max: 1000
          },
          {
            type: 'number', key: 'commentY', label: 'Y Position',
            defaultValue: 700, min: 0, max: 1000
          },
          {
            type: 'number', key: 'commentPage', label: 'Page Number',
            defaultValue: 1, min: 1, max: 9999
          },
        ]
      },
      {
        title: 'Style',
        icon: PenLine,
        controls: [
          {
            type: 'color', key: 'commentColor', label: 'Color',
            defaultValue: '#3b82f6'
          },
          {
            type: 'button-group', key: 'commentIconStyle', label: 'Icon Style',
            defaultValue: 'note',
            options: [
              { value: 'note', label: 'Note' },
              { value: 'comment', label: 'Comment' },
              { value: 'help', label: 'Help' },
              { value: 'paragraph', label: 'Paragraph' },
            ]
          },
          {
            type: 'range', key: 'commentSize', label: 'Indicator Size',
            defaultValue: 14, min: 8, max: 24
          },
        ]
      },
    ],
    processPDF: async (doc, settings) => {
      const pages = doc.getPages()
      const pageIdx = Math.min((settings.commentPage || 1) - 1, pages.length - 1)
      if (pageIdx < 0) return doc
      const page = pages[pageIdx]

      const x = settings.commentX || 50
      const y = settings.commentY || 700
      const color = settings.commentColor || '#3b82f6'
      const { r, g, b } = hexToRgb(color)
      const size = settings.commentSize || 14

      const font = await doc.embedFont(StandardFonts.Helvetica)
      const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

      // Draw indicator rectangle
      page.drawRectangle({
        x, y, width: size, height: size,
        color: rgb(r, g, b), opacity: 0.85,
      })

      // Draw icon letter based on style
      const iconLetter = settings.commentIconStyle === 'comment' ? 'C'
        : settings.commentIconStyle === 'help' ? '?'
        : settings.commentIconStyle === 'paragraph' ? '¶'
        : '💬'
      try {
        page.drawText(iconLetter, {
          x: x + 3, y: y + 3, size: size * 0.6, font: fontBold,
          color: rgb(1, 1, 1),
        })
      } catch { /* skip if glyph unavailable */ }

      // Draw comment text next to indicator
      const commentText = settings.commentText || ''
      if (commentText) {
        const author = settings.commentAuthor || 'Anonymous'
        const subject = settings.commentSubject || ''

        try {
          page.drawText(`${author}:`, {
            x: x + size + 6, y: y + size - 2, size: 8, font: fontBold,
            color: rgb(r, g, b),
          })
        } catch { /* skip */ }

        if (subject) {
          try {
            page.drawText(`[${subject}]`, {
              x: x + size + 6, y: y + size - 14, size: 7, font,
              color: rgb(0.4, 0.4, 0.4),
            })
          } catch { /* skip */ }
        }

        const lines = commentText.split('\n')
        let textY = y + size - (subject ? 26 : 14)
        for (let i = 0; i < Math.min(lines.length, 5); i++) {
          try {
            page.drawText(lines[i].substring(0, 80), {
              x: x + size + 6, y: textY, size: 7, font,
              color: rgb(0.2, 0.2, 0.2),
            })
          } catch { /* skip */ }
          textY -= 10
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_commented.pdf'),
  },

  // 2. ADD HIGHLIGHT
  {
    id: 'add-highlight',
    name: 'Add Highlight Annotation',
    description: 'Highlight text regions on your PDF with customizable color, opacity, and style',
    icon: Highlighter,
    color: '#eab308',
    category: 'Annotation',
    sections: [
      {
        title: 'Highlight',
        icon: Highlighter,
        controls: [
          {
            type: 'color', key: 'highlightColor', label: 'Highlight Color',
            defaultValue: '#eab308'
          },
          {
            type: 'range', key: 'highlightOpacity', label: 'Opacity',
            defaultValue: 40, min: 0, max: 100
          },
          {
            type: 'textarea', key: 'highlightText', label: 'Text Content',
            placeholder: 'Text being highlighted...', rows: 3, defaultValue: ''
          },
        ]
      },
      {
        title: 'Position',
        icon: Eye,
        controls: [
          {
            type: 'number', key: 'highlightX', label: 'X Position',
            defaultValue: 50, min: 0, max: 1000
          },
          {
            type: 'number', key: 'highlightY', label: 'Y Position',
            defaultValue: 700, min: 0, max: 1000
          },
          {
            type: 'number', key: 'highlightWidth', label: 'Width',
            defaultValue: 200, min: 10, max: 1000
          },
          {
            type: 'number', key: 'highlightHeight', label: 'Height',
            defaultValue: 16, min: 5, max: 100
          },
          {
            type: 'number', key: 'highlightPage', label: 'Page Number',
            defaultValue: 1, min: 1, max: 9999
          },
        ]
      },
      {
        title: 'Style',
        icon: PenLine,
        controls: [
          {
            type: 'button-group', key: 'highlightStyle', label: 'Style',
            defaultValue: 'solid',
            options: [
              { value: 'solid', label: 'Solid' },
              { value: 'squiggly', label: 'Squiggly' },
              { value: 'underline', label: 'Underline' },
              { value: 'strikeout', label: 'Strikeout' },
            ]
          },
          {
            type: 'range', key: 'highlightThickness', label: 'Line Thickness',
            defaultValue: 2, min: 1, max: 6
          },
          {
            type: 'checkbox', key: 'highlightShowText', label: 'Show Highlighted Text',
            defaultValue: true, description: 'Render the highlighted text content below the highlight'
          },
        ]
      },
    ],
    processPDF: async (doc, settings) => {
      const pages = doc.getPages()
      const pageIdx = Math.min((settings.highlightPage || 1) - 1, pages.length - 1)
      if (pageIdx < 0) return doc
      const page = pages[pageIdx]

      const x = settings.highlightX || 50
      const y = settings.highlightY || 700
      const w = settings.highlightWidth || 200
      const h = settings.highlightHeight || 16
      const color = settings.highlightColor || '#eab308'
      const { r, g, b } = hexToRgb(color)
      const opacity = (settings.highlightOpacity ?? 40) / 100
      const style = settings.highlightStyle || 'solid'
      const thickness = settings.highlightThickness || 2

      const font = await doc.embedFont(StandardFonts.Helvetica)

      if (style === 'solid') {
        // Draw semi-transparent rectangle
        page.drawRectangle({
          x, y, width: w, height: h,
          color: rgb(r, g, b), opacity,
        })
      } else if (style === 'underline') {
        // Draw underline line
        page.drawLine({
          start: { x, y: y + 1 },
          end: { x: x + w, y: y + 1 },
          thickness, color: rgb(r, g, b), opacity,
        })
      } else if (style === 'strikeout') {
        // Draw strikethrough line in the middle
        page.drawLine({
          start: { x, y: y + h / 2 },
          end: { x: x + w, y: y + h / 2 },
          thickness, color: rgb(r, g, b), opacity,
        })
      } else if (style === 'squiggly') {
        // Draw squiggly underline approximation
        const segmentWidth = 4
        const segments = Math.floor(w / segmentWidth)
        for (let i = 0; i < segments; i++) {
          const sx = x + i * segmentWidth
          const offset = i % 2 === 0 ? 2 : -2
          page.drawLine({
            start: { x: sx, y: y + 1 },
            end: { x: sx + segmentWidth, y: y + 1 + offset },
            thickness: Math.max(1, thickness - 0.5), color: rgb(r, g, b), opacity,
          })
        }
      }

      // Optionally render highlighted text
      if (settings.highlightShowText && settings.highlightText) {
        try {
          page.drawText(settings.highlightText.substring(0, 100), {
            x, y: y - 12, size: 8, font,
            color: rgb(r, g, b),
          })
        } catch { /* skip */ }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_highlighted.pdf'),
  },

  // 3. ADD STICKY NOTE
  {
    id: 'add-sticky-note',
    name: 'Add Sticky Note',
    description: 'Place sticky note annotations on your PDF with custom text, color, and icon style',
    icon: StickyNote,
    color: '#f59e0b',
    category: 'Annotation',
    sections: [
      {
        title: 'Note',
        icon: StickyNote,
        controls: [
          {
            type: 'textarea', key: 'stickyNoteText', label: 'Note Content',
            placeholder: 'Write your sticky note here...', rows: 4, defaultValue: ''
          },
          {
            type: 'text', key: 'stickyNoteAuthor', label: 'Author',
            placeholder: 'Your name', defaultValue: 'Anonymous'
          },
          {
            type: 'color', key: 'stickyNoteColor', label: 'Note Color',
            defaultValue: '#f59e0b'
          },
        ]
      },
      {
        title: 'Position',
        icon: Eye,
        controls: [
          {
            type: 'number', key: 'stickyNoteX', label: 'X Position',
            defaultValue: 50, min: 0, max: 1000
          },
          {
            type: 'number', key: 'stickyNoteY', label: 'Y Position',
            defaultValue: 700, min: 0, max: 1000
          },
          {
            type: 'number', key: 'stickyNotePage', label: 'Page Number',
            defaultValue: 1, min: 1, max: 9999
          },
        ]
      },
      {
        title: 'Icon',
        icon: Star,
        controls: [
          {
            type: 'button-group', key: 'stickyNoteIcon', label: 'Icon Style',
            defaultValue: 'note',
            options: [
              { value: 'note', label: 'Note' },
              { value: 'comment', label: 'Comment' },
              { value: 'help', label: 'Help' },
              { value: 'paragraph', label: 'Paragraph' },
              { value: 'new-paragraph', label: 'New Para' },
            ]
          },
          {
            type: 'range', key: 'stickyNoteSize', label: 'Note Size',
            defaultValue: 20, min: 10, max: 40
          },
          {
            type: 'checkbox', key: 'stickyNoteShowContent', label: 'Show Content Inline',
            defaultValue: false, description: 'Display the note text directly on the page next to the icon'
          },
        ]
      },
    ],
    processPDF: async (doc, settings) => {
      const pages = doc.getPages()
      const pageIdx = Math.min((settings.stickyNotePage || 1) - 1, pages.length - 1)
      if (pageIdx < 0) return doc
      const page = pages[pageIdx]

      const x = settings.stickyNoteX || 50
      const y = settings.stickyNoteY || 700
      const color = settings.stickyNoteColor || '#f59e0b'
      const { r, g, b } = hexToRgb(color)
      const size = settings.stickyNoteSize || 20

      const font = await doc.embedFont(StandardFonts.Helvetica)
      const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

      // Draw the sticky note square
      page.drawRectangle({
        x, y, width: size, height: size,
        color: rgb(r, g, b), opacity: 0.9,
      })

      // Draw a small fold triangle on top-right corner
      const foldSize = size * 0.3
      page.drawRectangle({
        x: x + size - foldSize, y: y + size - foldSize,
        width: foldSize, height: foldSize,
        color: rgb(0, 0, 0), opacity: 0.15,
      })

      // Draw icon symbol
      const iconChar = settings.stickyNoteIcon === 'comment' ? 'C'
        : settings.stickyNoteIcon === 'help' ? '?'
        : settings.stickyNoteIcon === 'paragraph' ? '¶'
        : settings.stickyNoteIcon === 'new-paragraph' ? 'N'
        : '💬'
      try {
        page.drawText(iconChar, {
          x: x + size * 0.2, y: y + size * 0.2, size: size * 0.5, font: fontBold,
          color: rgb(1, 1, 1),
        })
      } catch { /* skip if glyph unavailable */ }

      // Optionally show note text inline
      if (settings.stickyNoteShowContent && settings.stickyNoteText) {
        const author = settings.stickyNoteAuthor || 'Anonymous'
        try {
          page.drawText(`${author}:`, {
            x: x + size + 6, y: y + size - 4, size: 7, font: fontBold,
            color: rgb(r, g, b),
          })
        } catch { /* skip */ }

        const lines = settings.stickyNoteText.split('\n')
        let textY = y + size - 16
        for (let i = 0; i < Math.min(lines.length, 6); i++) {
          try {
            page.drawText(lines[i].substring(0, 90), {
              x: x + size + 6, y: textY, size: 6, font,
              color: rgb(0.25, 0.25, 0.25),
            })
          } catch { /* skip */ }
          textY -= 9
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_sticky_note.pdf'),
  },

  // 4. ADD UNDERLINE
  {
    id: 'add-underline',
    name: 'Add Underline',
    description: 'Add underline annotations to specific text areas in your PDF document',
    icon: Underline,
    color: '#3b82f6',
    category: 'Annotation',
    sections: [
      {
        title: 'Style',
        icon: PenLine,
        controls: [
          {
            type: 'color', key: 'underlineColor', label: 'Underline Color',
            defaultValue: '#3b82f6'
          },
          {
            type: 'range', key: 'underlineOpacity', label: 'Opacity',
            defaultValue: 80, min: 0, max: 100
          },
          {
            type: 'range', key: 'underlineThickness', label: 'Thickness',
            defaultValue: 2, min: 1, max: 5
          },
        ]
      },
      {
        title: 'Position',
        icon: Eye,
        controls: [
          {
            type: 'number', key: 'underlineX', label: 'X Position',
            defaultValue: 50, min: 0, max: 1000
          },
          {
            type: 'number', key: 'underlineY', label: 'Y Position',
            defaultValue: 700, min: 0, max: 1000
          },
          {
            type: 'number', key: 'underlineWidth', label: 'Width',
            defaultValue: 200, min: 10, max: 1000
          },
          {
            type: 'number', key: 'underlinePage', label: 'Page Number',
            defaultValue: 1, min: 1, max: 9999
          },
        ]
      },
      {
        title: 'Content',
        icon: MessageSquare,
        controls: [
          {
            type: 'textarea', key: 'underlineText', label: 'Text Content',
            placeholder: 'Text being underlined...', rows: 3, defaultValue: ''
          },
          {
            type: 'text', key: 'underlineAuthor', label: 'Author',
            placeholder: 'Your name', defaultValue: ''
          },
          {
            type: 'checkbox', key: 'underlineShowText', label: 'Show Text Label',
            defaultValue: false, description: 'Display the underlined text as a small label near the underline'
          },
        ]
      },
    ],
    processPDF: async (doc, settings) => {
      const pages = doc.getPages()
      const pageIdx = Math.min((settings.underlinePage || 1) - 1, pages.length - 1)
      if (pageIdx < 0) return doc
      const page = pages[pageIdx]

      const x = settings.underlineX || 50
      const y = settings.underlineY || 700
      const w = settings.underlineWidth || 200
      const color = settings.underlineColor || '#3b82f6'
      const { r, g, b } = hexToRgb(color)
      const opacity = (settings.underlineOpacity ?? 80) / 100
      const thickness = settings.underlineThickness || 2

      const font = await doc.embedFont(StandardFonts.Helvetica)

      // Draw the underline
      page.drawLine({
        start: { x, y },
        end: { x: x + w, y },
        thickness, color: rgb(r, g, b), opacity,
      })

      // Optionally show text label
      if (settings.underlineShowText && settings.underlineText) {
        try {
          page.drawText(settings.underlineText.substring(0, 100), {
            x, y: y - 12, size: 7, font,
            color: rgb(r, g, b),
          })
        } catch { /* skip */ }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_underlined.pdf'),
  },

  // 5. ADD STRIKETHROUGH
  {
    id: 'add-strikethrough',
    name: 'Add Strikethrough',
    description: 'Add strikethrough annotations to mark text for deletion or review in your PDF',
    icon: Strikethrough,
    color: '#ef4444',
    category: 'Annotation',
    sections: [
      {
        title: 'Style',
        icon: PenLine,
        controls: [
          {
            type: 'color', key: 'strikeColor', label: 'Strikethrough Color',
            defaultValue: '#ef4444'
          },
          {
            type: 'range', key: 'strikeOpacity', label: 'Opacity',
            defaultValue: 80, min: 0, max: 100
          },
          {
            type: 'range', key: 'strikeThickness', label: 'Thickness',
            defaultValue: 2, min: 1, max: 5
          },
        ]
      },
      {
        title: 'Position',
        icon: Eye,
        controls: [
          {
            type: 'number', key: 'strikeX', label: 'X Position',
            defaultValue: 50, min: 0, max: 1000
          },
          {
            type: 'number', key: 'strikeY', label: 'Y Position',
            defaultValue: 700, min: 0, max: 1000
          },
          {
            type: 'number', key: 'strikeWidth', label: 'Width',
            defaultValue: 200, min: 10, max: 1000
          },
          {
            type: 'number', key: 'strikePage', label: 'Page Number',
            defaultValue: 1, min: 1, max: 9999
          },
        ]
      },
      {
        title: 'Content',
        icon: MessageSquare,
        controls: [
          {
            type: 'textarea', key: 'strikeText', label: 'Text Content',
            placeholder: 'Text being struck through...', rows: 3, defaultValue: ''
          },
          {
            type: 'text', key: 'strikeAuthor', label: 'Author',
            placeholder: 'Your name', defaultValue: ''
          },
          {
            type: 'checkbox', key: 'strikeShowText', label: 'Show Text Label',
            defaultValue: false, description: 'Display the struck-through text as a small label below the line'
          },
        ]
      },
    ],
    processPDF: async (doc, settings) => {
      const pages = doc.getPages()
      const pageIdx = Math.min((settings.strikePage || 1) - 1, pages.length - 1)
      if (pageIdx < 0) return doc
      const page = pages[pageIdx]

      const x = settings.strikeX || 50
      const y = settings.strikeY || 700
      const w = settings.strikeWidth || 200
      const color = settings.strikeColor || '#ef4444'
      const { r, g, b } = hexToRgb(color)
      const opacity = (settings.strikeOpacity ?? 80) / 100
      const thickness = settings.strikeThickness || 2

      const font = await doc.embedFont(StandardFonts.Helvetica)

      // Draw the strikethrough line
      page.drawLine({
        start: { x, y },
        end: { x: x + w, y },
        thickness, color: rgb(r, g, b), opacity,
      })

      // Optionally show text label
      if (settings.strikeShowText && settings.strikeText) {
        try {
          page.drawText(settings.strikeText.substring(0, 100), {
            x, y: y - 12, size: 7, font,
            color: rgb(r, g, b),
          })
        } catch { /* skip */ }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_strikethrough.pdf'),
  },

  // 6. DRAW SHAPES
  {
    id: 'draw-shapes',
    name: 'Draw Shapes',
    description: 'Draw rectangles, circles, lines, arrows, and polygons on your PDF pages',
    icon: PenLine,
    color: '#8b5cf6',
    category: 'Annotation',
    sections: [
      {
        title: 'Shape',
        icon: Square,
        controls: [
          {
            type: 'button-group', key: 'shapeType', label: 'Shape Type',
            defaultValue: 'rectangle',
            options: [
              { value: 'rectangle', label: 'Rectangle' },
              { value: 'circle', label: 'Circle' },
              { value: 'line', label: 'Line' },
              { value: 'arrow', label: 'Arrow' },
              { value: 'polygon', label: 'Polygon' },
            ]
          },
          {
            type: 'number', key: 'shapeSides', label: 'Polygon Sides',
            defaultValue: 5, min: 3, max: 12
          },
          {
            type: 'checkbox', key: 'shapeFill', label: 'Fill Shape',
            defaultValue: true, description: 'Fill the shape with the fill color'
          },
        ]
      },
      {
        title: 'Style',
        icon: PenLine,
        controls: [
          {
            type: 'color', key: 'shapeStrokeColor', label: 'Stroke Color',
            defaultValue: '#8b5cf6'
          },
          {
            type: 'color', key: 'shapeFillColor', label: 'Fill Color',
            defaultValue: '#c4b5fd'
          },
          {
            type: 'range', key: 'shapeStrokeWidth', label: 'Stroke Width',
            defaultValue: 2, min: 1, max: 10
          },
          {
            type: 'range', key: 'shapeOpacity', label: 'Opacity',
            defaultValue: 50, min: 0, max: 100
          },
          {
            type: 'checkbox', key: 'shapeDashed', label: 'Dashed Border',
            defaultValue: false, description: 'Use dashed lines for the shape border'
          },
        ]
      },
      {
        title: 'Position',
        icon: Eye,
        controls: [
          {
            type: 'number', key: 'shapeX', label: 'X Position',
            defaultValue: 100, min: 0, max: 1000
          },
          {
            type: 'number', key: 'shapeY', label: 'Y Position',
            defaultValue: 600, min: 0, max: 1000
          },
          {
            type: 'number', key: 'shapeWidth', label: 'Width',
            defaultValue: 200, min: 10, max: 1000
          },
          {
            type: 'number', key: 'shapeHeight', label: 'Height',
            defaultValue: 100, min: 10, max: 1000
          },
          {
            type: 'range', key: 'shapeRotation', label: 'Rotation (degrees)',
            defaultValue: 0, min: -180, max: 180
          },
          {
            type: 'number', key: 'shapePage', label: 'Page Number',
            defaultValue: 1, min: 1, max: 9999
          },
        ]
      },
    ],
    processPDF: async (doc, settings) => {
      const pages = doc.getPages()
      const pageIdx = Math.min((settings.shapePage || 1) - 1, pages.length - 1)
      if (pageIdx < 0) return doc
      const page = pages[pageIdx]

      const x = settings.shapeX || 100
      const y = settings.shapeY || 600
      const w = settings.shapeWidth || 200
      const h = settings.shapeHeight || 100
      const strokeColor = settings.shapeStrokeColor || '#8b5cf6'
      const fillColor = settings.shapeFillColor || '#c4b5fd'
      const { r: sr, g: sg, b: sb } = hexToRgb(strokeColor)
      const { r: fr, g: fg, b: fb } = hexToRgb(fillColor)
      const strokeWidth = settings.shapeStrokeWidth || 2
      const opacity = (settings.shapeOpacity ?? 50) / 100
      const shapeType = settings.shapeType || 'rectangle'
      const rotation = settings.shapeRotation || 0
      const fill = settings.shapeFill !== false

      if (shapeType === 'rectangle') {
        page.drawRectangle({
          x, y, width: w, height: h,
          borderColor: rgb(sr, sg, sb),
          color: fill ? rgb(fr, fg, fb) : undefined,
          borderWidth: strokeWidth,
          opacity: fill ? opacity : 1,
          borderOpacity: 1,
          rotate: degrees(rotation),
        })
      } else if (shapeType === 'circle') {
        page.drawEllipse({
          x: x + w / 2, y: y + h / 2,
          xScale: w / 2, yScale: h / 2,
          borderColor: rgb(sr, sg, sb),
          color: fill ? rgb(fr, fg, fb) : undefined,
          borderWidth: strokeWidth,
          opacity: fill ? opacity : 1,
          borderOpacity: 1,
          rotate: degrees(rotation),
        })
      } else if (shapeType === 'line') {
        page.drawLine({
          start: { x, y },
          end: { x: x + w, y: y + h / 2 },
          thickness: strokeWidth,
          color: rgb(sr, sg, sb),
          opacity,
        })
      } else if (shapeType === 'arrow') {
        // Draw arrow line
        const endX = x + w
        const endY = y + h / 2
        page.drawLine({
          start: { x, y },
          end: { x: endX, y: endY },
          thickness: strokeWidth,
          color: rgb(sr, sg, sb),
          opacity,
        })
        // Draw arrowhead
        const headSize = Math.max(8, strokeWidth * 4)
        const angle = Math.atan2(0, w) // simplified horizontal arrow
        const ax1 = endX - headSize * Math.cos(angle - 0.4)
        const ay1 = endY - headSize * Math.sin(angle - 0.4)
        const ax2 = endX - headSize * Math.cos(angle + 0.4)
        const ay2 = endY - headSize * Math.sin(angle + 0.4)
        page.drawLine({
          start: { x: endX, y: endY },
          end: { x: ax1, y: ay1 },
          thickness: strokeWidth,
          color: rgb(sr, sg, sb),
          opacity,
        })
        page.drawLine({
          start: { x: endX, y: endY },
          end: { x: ax2, y: ay2 },
          thickness: strokeWidth,
          color: rgb(sr, sg, sb),
          opacity,
        })
      } else if (shapeType === 'polygon') {
        const sides = settings.shapeSides || 5
        const centerX = x + w / 2
        const centerY = y + h / 2
        const radiusX = w / 2
        const radiusY = h / 2
        const rotRad = (rotation * Math.PI) / 180

        // Draw polygon as connected lines
        const points: { x: number; y: number }[] = []
        for (let i = 0; i < sides; i++) {
          const angle = rotRad + (2 * Math.PI * i) / sides - Math.PI / 2
          points.push({
            x: centerX + radiusX * Math.cos(angle),
            y: centerY + radiusY * Math.sin(angle),
          })
        }
        // Draw lines connecting the points
        for (let i = 0; i < points.length; i++) {
          const next = points[(i + 1) % points.length]
          page.drawLine({
            start: points[i],
            end: next,
            thickness: strokeWidth,
            color: rgb(sr, sg, sb),
            opacity: 1,
          })
        }
        // Optionally fill
        if (fill) {
          // Use a bounding rectangle approximation for fill (pdf-lib limitation for polygons)
          page.drawRectangle({
            x: x + w * 0.15, y: y + h * 0.15,
            width: w * 0.7, height: h * 0.7,
            color: rgb(fr, fg, fb),
            opacity: opacity * 0.3,
          })
        }
      }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_shapes.pdf'),
  },
]

// ============================================================
// VIEW TOOLS
// ============================================================

const viewTools: AdvancedToolConfig[] = [

  // 7. DARK MODE READER
  {
    id: 'dark-mode-reader',
    name: 'Dark Mode Reader',
    description: 'Apply dark mode viewing settings to your PDF for comfortable reading',
    icon: MoonStar,
    color: '#6366f1',
    category: 'View',
    sections: [
      {
        title: 'Theme',
        icon: MoonStar,
        controls: [
          {
            type: 'range', key: 'darkBrightness', label: 'Brightness',
            defaultValue: 0, min: -100, max: 100
          },
          {
            type: 'range', key: 'darkContrast', label: 'Contrast',
            defaultValue: 100, min: 50, max: 200
          },
          {
            type: 'range', key: 'darkSepia', label: 'Sepia',
            defaultValue: 0, min: 0, max: 100
          },
          {
            type: 'checkbox', key: 'darkInvert', label: 'Invert Colors',
            defaultValue: false, description: 'Invert all colors for a true dark mode effect'
          },
        ]
      },
      {
        title: 'Display',
        icon: Eye,
        controls: [
          {
            type: 'color', key: 'darkBgColor', label: 'Background Color',
            defaultValue: '#1e1e1e'
          },
          {
            type: 'color', key: 'darkTextColor', label: 'Text Color',
            defaultValue: '#e0e0e0'
          },
          {
            type: 'checkbox', key: 'darkApplyOverlay', label: 'Apply Dark Overlay',
            defaultValue: true, description: 'Add a semi-transparent dark overlay to each page'
          },
        ]
      },
    ],
    processPDF: async (doc, settings) => {
      // Dark mode is primarily a viewer mode — we apply an overlay if requested
      if (settings.darkApplyOverlay) {
        const { r, g, b } = hexToRgb(settings.darkBgColor || '#1e1e1e')
        const opacity = Math.max(0.05, Math.min(0.4, Math.abs(settings.darkBrightness || 0) / 250))

        const pages = doc.getPages()
        for (const page of pages) {
          const { width, height } = page.getSize()
          page.drawRectangle({
            x: 0, y: 0, width, height,
            color: rgb(r, g, b),
            opacity,
          })
        }
      }

      // Sepia tint
      if ((settings.darkSepia || 0) > 0) {
        const sepiaAmount = (settings.darkSepia || 0) / 100
        const pages = doc.getPages()
        for (const page of pages) {
          const { width, height } = page.getSize()
          page.drawRectangle({
            x: 0, y: 0, width, height,
            color: rgb(1.0, 0.9, 0.7),
            opacity: sepiaAmount * 0.3,
          })
        }
      }

      doc.setProducer('4uPDF Dark Mode Reader')
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_darkmode.pdf'),
  },

  // 8. PAGE THUMBNAILS
  {
    id: 'page-thumbnails',
    name: 'Page Thumbnails',
    description: 'Generate a thumbnail overview of all pages in your PDF document',
    icon: Sidebar,
    color: '#64748b',
    category: 'View',
    sections: [
      {
        title: 'Thumbnails',
        icon: Sidebar,
        controls: [
          {
            type: 'button-group', key: 'thumbSize', label: 'Thumbnail Size',
            defaultValue: 'medium',
            options: [
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
            ]
          },
          {
            type: 'number', key: 'thumbColumns', label: 'Columns',
            defaultValue: 3, min: 2, max: 5
          },
          {
            type: 'checkbox', key: 'thumbIncludeOriginal', label: 'Keep Original Pages',
            defaultValue: true, description: 'Preserve original pages and append thumbnails as new pages'
          },
        ]
      },
      {
        title: 'Options',
        icon: Eye,
        controls: [
          {
            type: 'checkbox', key: 'thumbShowPageNumbers', label: 'Show Page Numbers',
            defaultValue: true, description: 'Display page numbers below each thumbnail'
          },
          {
            type: 'checkbox', key: 'thumbShowFileName', label: 'Show File Name',
            defaultValue: false, description: 'Display the document file name as a header'
          },
          {
            type: 'color', key: 'thumbBgColor', label: 'Background Color',
            defaultValue: '#f8fafc'
          },
        ]
      },
    ],
    processPDF: async (doc, settings) => {
      // Thumbnail generation is primarily a viewer feature
      // We add a thumbnail index page as the first page
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
      const pages = doc.getPages()
      const totalPages = pages.length
      const columns = settings.thumbColumns || 3
      const { r, g, b } = hexToRgb(settings.thumbBgColor || '#f8fafc')

      // Add an index page
      const indexPage = doc.insertPage(0, [595.28, 841.89])
      const { width: iw, height: ih } = indexPage.getSize()
      const margin = 30
      const gap = 10

      // Draw background
      indexPage.drawRectangle({
        x: 0, y: 0, width: iw, height: ih,
        color: rgb(r, g, b),
      })

      // Title
      try {
        indexPage.drawText('Page Thumbnails', {
          x: margin, y: ih - margin - 10, size: 16, font: fontBold,
          color: rgb(0.15, 0.15, 0.15),
        })
      } catch { /* skip */ }

      if (settings.thumbShowFileName) {
        try {
          indexPage.drawText(doc.getTitle() || 'Document', {
            x: margin, y: ih - margin - 28, size: 10, font,
            color: rgb(0.4, 0.4, 0.4),
          })
        } catch { /* skip */ }
      }

      // Draw thumbnail placeholders
      const cols = Math.max(2, Math.min(columns, 5))
      const rows_per_page = 5
      const thumbW = (iw - margin * 2 - gap * (cols - 1)) / cols
      const thumbH = thumbW * 1.414 // A4 aspect
      const startY = ih - margin - 50

      for (let i = 0; i < Math.min(totalPages, cols * rows_per_page); i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        const tx = margin + col * (thumbW + gap)
        const ty = startY - row * (thumbH + gap + 10)

        // Draw thumbnail border
        indexPage.drawRectangle({
          x: tx, y: ty - thumbH, width: thumbW, height: thumbH,
          borderColor: rgb(0.7, 0.7, 0.7),
          borderWidth: 0.5,
          color: rgb(1, 1, 1),
        })

        // Page number label
        if (settings.thumbShowPageNumbers) {
          try {
            const label = `Page ${i + 1}`
            const labelWidth = font.widthOfTextAtSize(label, 7)
            indexPage.drawText(label, {
              x: tx + (thumbW - labelWidth) / 2, y: ty - thumbH - 12, size: 7, font,
              color: rgb(0.4, 0.4, 0.4),
            })
          } catch { /* skip */ }
        }
      }

      // Summary text
      try {
        indexPage.drawText(`Total: ${totalPages} pages`, {
          x: margin, y: margin, size: 9, font,
          color: rgb(0.5, 0.5, 0.5),
        })
      } catch { /* skip */ }

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_thumbnails.pdf'),
  },

  // 9. FULL SCREEN VIEW
  {
    id: 'full-screen-view',
    name: 'Full Screen View',
    description: 'Configure your PDF for full-screen presentation with transition effects and auto-advance',
    icon: Maximize,
    color: '#3b82f6',
    category: 'View',
    sections: [
      {
        title: 'Display',
        icon: Maximize,
        controls: [
          {
            type: 'checkbox', key: 'fullScreenHideCursor', label: 'Hide Cursor',
            defaultValue: false, description: 'Hide the mouse cursor during presentation'
          },
          {
            type: 'button-group', key: 'fullScreenTransition', label: 'Transition',
            defaultValue: 'none',
            options: [
              { value: 'none', label: 'None' },
              { value: 'fade', label: 'Fade' },
              { value: 'slide', label: 'Slide' },
              { value: 'dissolve', label: 'Dissolve' },
            ]
          },
          {
            type: 'checkbox', key: 'fullScreenAutoAdvance', label: 'Auto-Advance',
            defaultValue: false, description: 'Automatically advance to the next page'
          },
          {
            type: 'number', key: 'fullScreenSeconds', label: 'Seconds per Page',
            defaultValue: 5, min: 1, max: 60
          },
        ]
      },
      {
        title: 'Options',
        icon: Eye,
        controls: [
          {
            type: 'checkbox', key: 'fullScreenShowPageNum', label: 'Show Page Number',
            defaultValue: true, description: 'Display current page number in the corner'
          },
          {
            type: 'checkbox', key: 'fullScreenShowProgress', label: 'Show Progress Bar',
            defaultValue: false, description: 'Show a progress bar at the bottom of each page'
          },
          {
            type: 'checkbox', key: 'fullScreenFitPage', label: 'Fit to Screen',
            defaultValue: true, description: 'Ensure pages fill the entire screen area'
          },
        ]
      },
    ],
    processPDF: async (doc, settings) => {
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const pages = doc.getPages()
      const totalPages = pages.length

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()

        // Add page number indicator
        if (settings.fullScreenShowPageNum) {
          try {
            const label = `${i + 1} / ${totalPages}`
            const labelWidth = font.widthOfTextAtSize(label, 9)
            page.drawText(label, {
              x: width - labelWidth - 20, y: 15, size: 9, font,
              color: rgb(0.5, 0.5, 0.5),
            })
          } catch { /* skip */ }
        }

        // Add progress bar
        if (settings.fullScreenShowProgress) {
          const progress = (i + 1) / totalPages
          const barHeight = 3
          const barWidth = width * progress
          page.drawRectangle({
            x: 0, y: 0, width: barWidth, height: barHeight,
            color: rgb(0.23, 0.51, 0.96),
            opacity: 0.7,
          })
        }
      }

      doc.setProducer('4uPDF Full Screen Viewer')
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_fullscreen.pdf'),
  },

  // 10. COMPARE SIDE BY SIDE
  {
    id: 'compare-side-by-side',
    name: 'Compare Side by Side',
    description: 'Configure side-by-side comparison view for analyzing differences between documents',
    icon: Columns2,
    color: '#6366f1',
    category: 'View',
    allowMultiple: true,
    maxFiles: 2,
    acceptedTypes: '.pdf',
    sections: [
      {
        title: 'Comparison',
        icon: Columns2,
        controls: [
          {
            type: 'checkbox', key: 'compareHighlightDiff', label: 'Highlight Differences',
            defaultValue: true, description: 'Mark differences between the two documents'
          },
          {
            type: 'color', key: 'compareDiffColor', label: 'Difference Color',
            defaultValue: '#ef4444'
          },
          {
            type: 'button-group', key: 'compareSensitivity', label: 'Sensitivity',
            defaultValue: 'medium',
            options: [
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]
          },
        ]
      },
      {
        title: 'Layout',
        icon: Eye,
        controls: [
          {
            type: 'button-group', key: 'compareLayout', label: 'Layout',
            defaultValue: 'horizontal',
            options: [
              { value: 'horizontal', label: 'Horizontal' },
              { value: 'vertical', label: 'Vertical' },
            ]
          },
          {
            type: 'checkbox', key: 'compareSyncScroll', label: 'Sync Scroll',
            defaultValue: true, description: 'Synchronize scrolling between both documents'
          },
          {
            type: 'checkbox', key: 'compareShowLabels', label: 'Show Document Labels',
            defaultValue: true, description: 'Display labels identifying Document A and Document B'
          },
        ]
      },
    ],
    processPDF: async (doc, settings) => {
      // Side-by-side comparison is primarily a viewer mode
      // We add metadata and visual indicators
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
      const pages = doc.getPages()

      if (settings.compareHighlightDiff) {
        const { r, g, b } = hexToRgb(settings.compareDiffColor || '#ef4444')
        for (const page of pages) {
          const { width, height } = page.getSize()
          // Add a subtle border indicator
          page.drawRectangle({
            x: 0, y: 0, width, height: 24,
            color: rgb(r, g, b),
            opacity: 0.1,
          })
        }
      }

      if (settings.compareShowLabels) {
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i]
          const { width } = page.getSize()
          try {
            page.drawText(`Document A — Page ${i + 1}`, {
              x: 10, y: 8, size: 7, font,
              color: rgb(0.39, 0.4, 0.95),
            })
          } catch { /* skip */ }
        }
      }

      doc.setProducer('4uPDF Compare Viewer')
      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_compared.pdf'),
  },

  // 11. PRESENTATION MODE
  {
    id: 'presentation-mode',
    name: 'Presentation Mode',
    description: 'Set up your PDF for presentation with transitions, auto-advance, and display options',
    icon: Presentation,
    color: '#f97316',
    category: 'View',
    sections: [
      {
        title: 'Presentation',
        icon: Presentation,
        controls: [
          {
            type: 'button-group', key: 'presentTransition', label: 'Transition',
            defaultValue: 'none',
            options: [
              { value: 'none', label: 'None' },
              { value: 'fade', label: 'Fade' },
              { value: 'slide', label: 'Slide' },
              { value: 'push', label: 'Push' },
              { value: 'split', label: 'Split' },
            ]
          },
          {
            type: 'range', key: 'presentDuration', label: 'Duration (seconds)',
            defaultValue: 5, min: 1, max: 10
          },
          {
            type: 'checkbox', key: 'presentAutoAdvance', label: 'Auto-Advance',
            defaultValue: false, description: 'Automatically advance to the next slide'
          },
        ]
      },
      {
        title: 'Options',
        icon: Eye,
        controls: [
          {
            type: 'checkbox', key: 'presentShowControls', label: 'Show Controls',
            defaultValue: true, description: 'Display navigation controls at the bottom of the screen'
          },
          {
            type: 'checkbox', key: 'presentLoop', label: 'Loop',
            defaultValue: false, description: 'Return to the first page after the last page'
          },
          {
            type: 'checkbox', key: 'presentFitScreen', label: 'Fit to Screen',
            defaultValue: true, description: 'Scale each page to fill the entire screen'
          },
        ]
      },
    ],
    processPDF: async (doc, settings) => {
      const font = await doc.embedFont(StandardFonts.Helvetica)
      const pages = doc.getPages()
      const totalPages = pages.length
      const duration = settings.presentDuration || 5

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()

        // Draw subtle slide number in bottom-right
        try {
          const label = `${i + 1}`
          const labelWidth = font.widthOfTextAtSize(label, 10)
          page.drawText(label, {
            x: width - labelWidth - 15, y: 12, size: 10, font,
            color: rgb(0.6, 0.6, 0.6),
          })
        } catch { /* skip */ }

        // Draw controls indicator at bottom
        if (settings.presentShowControls) {
          const barHeight = 20
          page.drawRectangle({
            x: 0, y: 0, width, height: barHeight,
            color: rgb(0.1, 0.1, 0.1),
            opacity: 0.15,
          })
          try {
            const ctrlText = `◀  Slide ${i + 1}/${totalPages}  ▶`
            page.drawText(ctrlText, {
              x: width / 2 - 60, y: 6, size: 8, font,
              color: rgb(0.5, 0.5, 0.5),
            })
          } catch { /* skip */ }
        }
      }

      // Add presentation metadata
      doc.setProducer('4uPDF Presentation Mode')
      doc.setKeywords([`transition:${settings.presentTransition || 'none'}`, `duration:${duration}`, `loop:${settings.presentLoop ? 'yes' : 'no'}`])

      return doc
    },
    getDownloadName: (name) => name.replace('.pdf', '_presentation.pdf'),
  },
]

// ============================================================
// EXPORT
// ============================================================

export const PART3D_CONFIGS: AdvancedToolConfig[] = [
  ...annotationTools, ...viewTools
]
