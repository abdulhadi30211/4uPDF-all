'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import ImageExt from '@tiptap/extension-image'
import { Link as TiptapLink } from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import Youtube from '@tiptap/extension-youtube'
import CharacterCount from '@tiptap/extension-character-count'
import { common, createLowlight } from 'lowlight'
import { useCallback, useEffect, useState } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Quote, Minus, Link as LinkIcon, Image as ImageIcon, Table as TableIcon,
  Undo, Redo, Highlighter, Type, Palette, Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon, Youtube as YoutubeIcon, RemoveFormatting,
  Indent, Outdent, Columns, ChevronDown, Video, FileCode, Pilcrow,
  RectangleHorizontal, SplitSquareHorizontal
} from 'lucide-react'

const lowlight = createLowlight(common)

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

// Font size + line height extension using TextStyle
const FontSizeLineStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize?.replace(/['"]+/g, ''),
        renderHTML: (attributes: Record<string, string>) => {
          if (!attributes.fontSize) return {}
          return { style: `font-size: ${attributes.fontSize}` }
        },
      },
      fontFamily: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontFamily?.replace(/['"]+/g, ''),
        renderHTML: (attributes: Record<string, string>) => {
          if (!attributes.fontFamily) return {}
          return { style: `font-family: ${attributes.fontFamily}` }
        },
      },
      lineHeight: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.lineHeight,
        renderHTML: (attributes: Record<string, string>) => {
          if (!attributes.lineHeight) return {}
          return { style: `line-height: ${attributes.lineHeight}` }
        },
      },
    }
  },
})

// Toolbar Button Component
function ToolbarButton({ onClick, isActive, disabled, title, children, className = '' }: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-blue-600/30 text-blue-400 border border-blue-500/50'
          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
      } ${className}`}
    >
      {children}
    </button>
  )
}

// Toolbar Divider
function ToolbarDivider() {
  return <div className="w-px h-6 bg-slate-700 mx-1 flex-shrink-0" />
}

// Dropdown Component
function ToolbarDropdown({ label, options, value, onChange }: {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (val: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-2 py-1 bg-[#0f172a] border border-slate-700 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-blue-500 h-8"
      title={label}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

// Color Picker Component
function ColorPicker({ icon: Icon, currentColor, onColorChange, title }: {
  icon: any
  currentColor: string
  onColorChange: (color: string) => void
  title: string
}) {
  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
    '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
    '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
    '#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47',
  ]

  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={title}
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all flex items-center gap-1"
      >
        <Icon className="w-4 h-4" />
        <div className="w-3 h-3 rounded-sm border border-slate-600" style={{ backgroundColor: currentColor || 'transparent' }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl p-3 w-[260px]">
          <div className="grid grid-cols-10 gap-1">
            {colors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => { onColorChange(color); setOpen(false) }}
                className="w-5 h-5 rounded border border-slate-600 hover:scale-125 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700 flex items-center gap-2">
            <input
              type="color"
              value={currentColor || '#000000'}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer bg-transparent"
            />
            <span className="text-slate-500 text-xs">Custom color</span>
            <button
              type="button"
              onClick={() => { onColorChange(''); setOpen(false) }}
              className="ml-auto text-xs text-slate-400 hover:text-red-400"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TiptapEditor({ content, onChange, placeholder = 'Start writing your blog post...' }: TiptapEditorProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [showImageInput, setShowImageInput] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [showYoutubeInput, setShowYoutubeInput] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [showTableCreator, setShowTableCreator] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: false,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      FontSizeLineStyle,
      Color,
      ImageExt.configure({
        HTMLAttributes: { class: 'blog-image' },
        allowBase64: true,
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'blog-link', rel: 'noopener noreferrer', target: '_blank' },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder }),
      Typography,
      Superscript,
      Subscript,
      Youtube.configure({
        HTMLAttributes: { class: 'blog-video' },
      }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content prose prose-invert prose-slate max-w-none focus:outline-none min-h-[500px] px-6 py-4',
      },
    },
  })

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const setLink = useCallback(() => {
    if (!editor) return
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    }
    setShowLinkInput(false)
    setLinkUrl('')
  }, [editor, linkUrl])

  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return
    editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt || 'Blog image' }).run()
    setShowImageInput(false)
    setImageUrl('')
    setImageAlt('')
  }, [editor, imageUrl, imageAlt])

  const addYoutube = useCallback(() => {
    if (!editor || !youtubeUrl) return
    editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run()
    setShowYoutubeInput(false)
    setYoutubeUrl('')
  }, [editor, youtubeUrl])

  const addTable = useCallback(() => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run()
    setShowTableCreator(false)
  }, [editor, tableRows, tableCols])

  if (!editor) return null

  const wordCount = editor.storage.characterCount.words()
  const charCount = editor.storage.characterCount.characters()

  return (
    <div className="border border-slate-700 rounded-2xl overflow-hidden bg-[#1e293b]">
      {/* Toolbar */}
      <div className="border-b border-slate-700 bg-[#162032]">
        {/* Row 1: Headings, Blocks, Text Alignment */}
        <div className="flex items-center gap-0.5 px-3 py-2 overflow-x-auto flex-wrap">
          {/* Undo/Redo */}
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
            <Redo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarDivider />

          {/* Heading Dropdown */}
          <ToolbarDropdown
            label="Heading Level"
            value={
              editor.isActive('heading', { level: 1 }) ? '1' :
              editor.isActive('heading', { level: 2 }) ? '2' :
              editor.isActive('heading', { level: 3 }) ? '3' :
              editor.isActive('heading', { level: 4 }) ? '4' :
              editor.isActive('heading', { level: 5 }) ? '5' :
              editor.isActive('heading', { level: 6 }) ? '6' :
              editor.isActive('paragraph') ? 'p' : 'p'
            }
            onChange={(val) => {
              if (val === 'p') {
                editor.chain().focus().setParagraph().run()
              } else {
                editor.chain().focus().toggleHeading({ level: parseInt(val) as any }).run()
              }
            }}
            options={[
              { value: 'p', label: 'Paragraph' },
              { value: '1', label: 'Heading 1 (H1)' },
              { value: '2', label: 'Heading 2 (H2)' },
              { value: '3', label: 'Heading 3 (H3)' },
              { value: '4', label: 'Heading 4 (H4)' },
              { value: '5', label: 'Heading 5 (H5)' },
              { value: '6', label: 'Heading 6 (H6)' },
            ]}
          />
          <ToolbarDivider />

          {/* Font Size */}
          <ToolbarDropdown
            label="Font Size"
            value="default"
            onChange={(val) => {
              if (val === 'default') {
                editor.chain().focus().unsetMark('textStyle').run()
              editor.chain().focus().setParagraph().run()
              } else {
                editor.chain().focus().setMark('textStyle', { fontSize: val }).run()
                editor.chain().focus().setMark('fontSizeLineStyle', { fontSize: val }).run()
              }
            }}
            options={[
              { value: 'default', label: 'Font Size' },
              { value: '12px', label: '12px - Small' },
              { value: '14px', label: '14px - Normal' },
              { value: '16px', label: '16px - Medium' },
              { value: '18px', label: '18px - Large' },
              { value: '20px', label: '20px - X-Large' },
              { value: '24px', label: '24px - XX-Large' },
              { value: '28px', label: '28px - Huge' },
              { value: '32px', label: '32px - Massive' },
              { value: '36px', label: '36px - Gigantic' },
              { value: '48px', label: '48px - Display' },
            ]}
          />
          <ToolbarDivider />

          {/* Text Formatting */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)">
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)">
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline (Ctrl+U)">
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={editor.isActive('superscript')} title="Superscript">
            <SuperscriptIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={editor.isActive('subscript')} title="Subscript">
            <SubscriptIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code">
            <Code className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarDivider />

          {/* Colors */}
          <ColorPicker
            icon={Palette}
            currentColor={editor.getAttributes('textStyle').color || ''}
            onColorChange={(color) => {
              if (color) {
                editor.chain().focus().setColor(color).run()
              } else {
                editor.chain().focus().unsetColor().run()
              }
            }}
            title="Text Color"
          />
          <ColorPicker
            icon={Highlighter}
            currentColor={editor.getAttributes('highlight').color || ''}
            onColorChange={(color) => {
              if (color) {
                editor.chain().focus().toggleHighlight({ color }).run()
              } else {
                editor.chain().focus().unsetHighlight().run()
              }
            }}
            title="Highlight Color"
          />
          <ToolbarDivider />

          {/* Alignment */}
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify">
            <AlignJustify className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarDivider />

          {/* Blocks */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Block Quote">
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block">
            <FileCode className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Divider">
            <Minus className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarDivider />

          {/* Insert */}
          <ToolbarButton onClick={() => setShowLinkInput(!showLinkInput)} isActive={editor.isActive('link')} title="Insert Link">
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => setShowImageInput(!showImageInput)} title="Insert Image">
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => setShowYoutubeInput(!showYoutubeInput)} title="Insert YouTube Video">
            <YoutubeIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => setShowTableCreator(!showTableCreator)} title="Insert Table">
            <TableIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarDivider />

          {/* Clear Formatting */}
          <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting">
            <RemoveFormatting className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} title="Paragraph">
            <Pilcrow className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Inline Input Popups */}
        {(showLinkInput || showImageInput || showYoutubeInput || showTableCreator) && (
          <div className="px-3 py-2 border-t border-slate-700/50 flex items-center gap-2 flex-wrap">
            {showLinkInput && (
              <>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Enter URL (https://...)"
                  className="flex-1 min-w-[200px] px-3 py-1.5 bg-[#0f172a] border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && setLink()}
                />
                <button onClick={setLink} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Apply</button>
                {editor.isActive('link') && (
                  <button onClick={() => editor.chain().focus().unsetLink().run()} className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-sm">Remove Link</button>
                )}
                <button onClick={() => setShowLinkInput(false)} className="px-2 py-1.5 text-slate-400 hover:text-white text-sm">Cancel</button>
              </>
            )}
            {showImageInput && (
              <>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Image URL"
                  className="flex-1 min-w-[200px] px-3 py-1.5 bg-[#0f172a] border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Alt text"
                  className="w-32 px-3 py-1.5 bg-[#0f172a] border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <button onClick={addImage} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Insert</button>
                <button onClick={() => setShowImageInput(false)} className="px-2 py-1.5 text-slate-400 hover:text-white text-sm">Cancel</button>
              </>
            )}
            {showYoutubeInput && (
              <>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="YouTube URL"
                  className="flex-1 min-w-[200px] px-3 py-1.5 bg-[#0f172a] border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <button onClick={addYoutube} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Embed</button>
                <button onClick={() => setShowYoutubeInput(false)} className="px-2 py-1.5 text-slate-400 hover:text-white text-sm">Cancel</button>
              </>
            )}
            {showTableCreator && (
              <>
                <span className="text-slate-400 text-xs">Rows:</span>
                <input type="number" min={1} max={20} value={tableRows} onChange={(e) => setTableRows(parseInt(e.target.value) || 3)} className="w-16 px-2 py-1 bg-[#0f172a] border border-slate-600 rounded text-white text-sm focus:outline-none" />
                <span className="text-slate-400 text-xs">Cols:</span>
                <input type="number" min={1} max={10} value={tableCols} onChange={(e) => setTableCols(parseInt(e.target.value) || 3)} className="w-16 px-2 py-1 bg-[#0f172a] border border-slate-600 rounded text-white text-sm focus:outline-none" />
                <button onClick={addTable} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Insert Table</button>
                <button onClick={() => setShowTableCreator(false)} className="px-2 py-1.5 text-slate-400 hover:text-white text-sm">Cancel</button>
              </>
            )}
          </div>
        )}

        {/* Table Operations (shown when inside table) */}
        {editor.isActive('table') && (
          <div className="px-3 py-1.5 border-t border-slate-700/50 flex items-center gap-1 flex-wrap">
            <span className="text-slate-500 text-xs mr-2">Table:</span>
            <ToolbarButton onClick={() => editor.chain().focus().addRowBefore().run()} title="Add Row Before">+ Row ↑</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row After">+ Row ↓</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add Col Before">+ Col ←</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Col After">+ Col →</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row" className="!text-red-400">- Row</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Col" className="!text-red-400">- Col</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table" className="!text-red-400">Delete Table</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().mergeCells().run()} title="Merge Cells">Merge</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().splitCell().run()} title="Split Cell">Split</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeaderRow().run()} title="Toggle Header Row">Header Row</ToolbarButton>
          </div>
        )}
      </div>



      {/* Editor Content Area */}
      <EditorContent editor={editor} />

      {/* Footer Stats */}
      <div className="px-4 py-2 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          <span>{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
        </div>
        <div className="flex items-center gap-2">
          {editor.isActive('heading') && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">Heading</span>}
          {editor.isActive('bulletList') && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded">Bullet List</span>}
          {editor.isActive('orderedList') && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">Numbered List</span>}
          {editor.isActive('blockquote') && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">Quote</span>}
          {editor.isActive('codeBlock') && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded">Code Block</span>}
          {editor.isActive('table') && <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded">Table</span>}
        </div>
      </div>

      {/* Tiptap Styles */}
      <style jsx global>{`
        .tiptap-editor-content {
          min-height: 500px;
        }
        .tiptap-editor-content h1 { font-size: 2em; font-weight: 800; margin: 1em 0 0.5em; color: white; }
        .tiptap-editor-content h2 { font-size: 1.5em; font-weight: 700; margin: 0.8em 0 0.4em; color: white; border-bottom: 1px solid #334155; padding-bottom: 0.3em; }
        .tiptap-editor-content h3 { font-size: 1.25em; font-weight: 600; margin: 0.6em 0 0.3em; color: #e2e8f0; }
        .tiptap-editor-content h4 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0 0.25em; color: #cbd5e1; }
        .tiptap-editor-content h5 { font-size: 1em; font-weight: 600; margin: 0.4em 0 0.2em; color: #94a3b8; }
        .tiptap-editor-content h6 { font-size: 0.9em; font-weight: 600; margin: 0.4em 0 0.2em; color: #64748b; }
        .tiptap-editor-content p { margin: 0.5em 0; color: #cbd5e1; line-height: 1.7; }
        .tiptap-editor-content ul { list-style: disc; margin: 0.5em 0; padding-left: 1.5em; color: #cbd5e1; }
        .tiptap-editor-content ol { list-style: decimal; margin: 0.5em 0; padding-left: 1.5em; color: #cbd5e1; }
        .tiptap-editor-content li { margin: 0.2em 0; }
        .tiptap-editor-content blockquote {
          border-left: 3px solid #3b82f6;
          margin: 1em 0;
          padding: 0.5em 1em;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 0 8px 8px 0;
          color: #94a3b8;
          font-style: italic;
        }
        .tiptap-editor-content code {
          background: rgba(59, 130, 246, 0.2);
          color: #93c5fd;
          padding: 0.15em 0.4em;
          border-radius: 4px;
          font-size: 0.9em;
          font-family: 'Fira Code', monospace;
        }
        .tiptap-editor-content pre {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 1em;
          margin: 1em 0;
          overflow-x: auto;
        }
        .tiptap-editor-content pre code {
          background: none;
          padding: 0;
          color: #e2e8f0;
        }
        .tiptap-editor-content .blog-image {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 1em auto;
          display: block;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .tiptap-editor-content .blog-link {
          color: #60a5fa;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .tiptap-editor-content .blog-link:hover {
          color: #93c5fd;
        }
        .tiptap-editor-content hr {
          border: none;
          border-top: 2px solid #334155;
          margin: 2em 0;
        }
        .tiptap-editor-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
          border-radius: 8px;
          overflow: hidden;
        }
        .tiptap-editor-content th, .tiptap-editor-content td {
          border: 1px solid #334155;
          padding: 0.5em 0.75em;
          text-align: left;
          color: #cbd5e1;
        }
        .tiptap-editor-content th {
          background: #1e293b;
          font-weight: 600;
          color: white;
        }
        .tiptap-editor-content td {
          background: #0f172a;
        }
        .tiptap-editor-content .blog-video {
          width: 100%;
          margin: 1em 0;
          border-radius: 12px;
          overflow: hidden;
        }
        .tiptap-editor-content .blog-video iframe {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 12px;
        }
        .tiptap-editor-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #475569;
          pointer-events: none;
          height: 0;
        }
        .tiptap-editor-content mark {
          border-radius: 2px;
          padding: 0.1em 0.2em;
        }
      `}</style>
    </div>
  )
}
