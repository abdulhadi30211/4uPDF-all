'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Eye, FileText, Clock, Tag, Copy, Save,
  CheckCircle, AlertTriangle, XCircle, Info,
  ArrowLeft, ChevronDown, Settings, BookOpen, Edit3
} from 'lucide-react'
import TiptapEditor from '@/components/admin/TiptapEditor'
import BlogStructuredTemplate, { StructuredData, defaultStructuredData, generateSchemaMarkup } from '@/components/admin/BlogStructuredTemplate'

interface BlogData {
  id?: string
  title: string
  slug: string
  content: string
  excerpt: string
  cover_image: string | null
  category: string
  tags: string[]
  is_published: boolean
  meta_title: string
  meta_description: string
  focus_keyword?: string
  structured_data?: string
}

const CATEGORIES = [
  'PDF Merge & Split', 'PDF Convert', 'PDF Edit', 'PDF Compress',
  'PDF Security', 'PDF Organize', 'PDF OCR & Scan', 'PDF Watermark',
  'PDF Sign & Forms', 'PDF Optimization', 'PDF Tools Comparison',
  'PDF Tips & Tricks', 'PDF for Business', 'PDF for Education', 'General'
]

type SeoScore = 'green' | 'yellow' | 'red'

function getSeoIndicator(score: SeoScore) {
  switch (score) {
    case 'green': return <CheckCircle className="w-4 h-4 text-green-400" />
    case 'yellow': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
    case 'red': return <XCircle className="w-4 h-4 text-red-400" />
  }
}

function getTitleScore(title: string): SeoScore {
  if (title.length >= 50 && title.length <= 60) return 'green'
  if (title.length >= 30 && title.length <= 70) return 'yellow'
  return 'red'
}

function getMetaDescScore(desc: string): SeoScore {
  if (desc.length >= 150 && desc.length <= 160) return 'green'
  if (desc.length >= 100 && desc.length <= 170) return 'yellow'
  return 'red'
}

function getContentScore(html: string): SeoScore {
  const words = html.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length
  if (words >= 1000) return 'green'
  if (words >= 500) return 'yellow'
  return 'red'
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','it','this','that','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','need','from','as','into','through','during','before','after','above','below','between','out','off','over','under','again','further','then','once','here','there','when','where','why','how','all','both','each','few','more','most','other','some','such','no','not','only','own','same','so','than','too','very','just','because','also','if','about','up','which','their','what','your','pdf','how','why','best','tips','guide','free','online','use'])
  const words = text.toLowerCase().replace(/<[^>]*>/g, '').replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w))
  const freq = new Map<string, number>()
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1)
  return Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([word]) => word)
}

export default function BlogFormClient({ mode, blog }: { mode: 'create' | 'edit'; blog?: BlogData }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'structured' | 'seo'>('editor')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false)

  const [form, setForm] = useState<BlogData>({
    title: blog?.title || '',
    slug: blog?.slug || '',
    content: blog?.content || '',
    excerpt: blog?.excerpt || '',
    cover_image: blog?.cover_image || '',
    category: blog?.category || 'General',
    tags: blog?.tags || [],
    is_published: blog?.is_published || false,
    meta_title: blog?.meta_title || '',
    meta_description: blog?.meta_description || '',
    focus_keyword: blog?.focus_keyword || '',
    structured_data: blog?.structured_data || '',
  })

  // Structured data state
  const [structuredData, setStructuredData] = useState<StructuredData>(() => {
    try {
      if (blog?.structured_data) {
        return { ...defaultStructuredData, ...JSON.parse(blog.structured_data) }
      }
    } catch {}
    return {
      ...defaultStructuredData,
      seoTitle: blog?.meta_title || '',
      metaDescription: blog?.meta_description || '',
      urlSlug: blog?.slug || '',
      featuredImage: blog?.cover_image || '',
    }
  })

  // Auto-save for edit mode
  const formRef = useRef(form)
  useEffect(() => { formRef.current = form })

  useEffect(() => {
    if (mode !== 'edit' || !blog?.id) return
    const interval = setInterval(async () => {
      const currentForm = formRef.current
      if (!currentForm.title && !currentForm.content) return
      try {
        setAutoSaveIndicator(true)
        await fetch(`/api/admin/blogs/${blog.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...currentForm, is_published: currentForm.is_published })
        })
        setLastSaved(new Date())
        setTimeout(() => setAutoSaveIndicator(false), 2000)
      } catch { setAutoSaveIndicator(false) }
    }, 30000)
    return () => clearInterval(interval)
  }, [mode, blog?.id])

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleTitleChange = (title: string) => {
    setForm(prev => ({ ...prev, title, slug: generateSlug(title), meta_title: prev.meta_title || title }))
    setStructuredData(prev => ({ ...prev, seoTitle: title, urlSlug: generateSlug(title) }))
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    setTagInput('')
  }

  const addSuggestedTag = (tag: string) => {
    if (!form.tags.includes(tag)) setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }))
  }

  const removeTag = (tag: string) => setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))

  // Extract TOC from content
  const extractToc = (html: string) => {
    const headingRegex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi
    const items: { id: string; text: string; level: number }[] = []
    let match
    while ((match = headingRegex.exec(html)) !== null) {
      const text = match[2].replace(/<[^>]*>/g, '')
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      items.push({ id, text, level: parseInt(match[1]) })
    }
    return items
  }

  // Update structured data TOC when content changes
  const handleContentChange = (html: string) => {
    setForm(prev => ({ ...prev, content: html }))
    const tocItems = extractToc(html)
    const wordCount = html.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length
    setStructuredData(prev => ({
      ...prev,
      tocItems,
      readingTime: prev.readingTime || Math.max(1, Math.ceil(wordCount / 200)),
    }))
  }

  // Sync structured data fields back to form
  const handleStructuredDataChange = (data: StructuredData) => {
    setStructuredData(data)
    setForm(prev => ({
      ...prev,
      meta_title: data.seoTitle || prev.meta_title,
      meta_description: data.metaDescription || prev.meta_description,
      slug: data.urlSlug || prev.slug,
      cover_image: data.featuredImage || prev.cover_image,
    }))
  }

  const handleDuplicate = async () => {
    if (!blog?.id || !confirm('Create a duplicate?')) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, title: `${form.title} (Copy)`, slug: `${form.slug}-copy`, is_published: false })
      })
      if (res.ok) router.push('/admin/blogs')
      else { const data = await res.json(); setError(data.error || 'Failed to duplicate') }
    } catch { setError('Network error') }
    setSaving(false)
  }

  const handleSubmit = async (publish: boolean) => {
    setSaving(true)
    setError('')

    // Generate schema and save structured data
    const schemaMarkup = generateSchemaMarkup(structuredData, form.title, form.slug)
    const payload = {
      ...form,
      is_published: publish,
      meta_title: structuredData.seoTitle || form.meta_title || form.title,
      meta_description: structuredData.metaDescription || form.meta_description || form.excerpt,
      slug: structuredData.urlSlug || form.slug,
      cover_image: structuredData.featuredImage || form.cover_image,
      structured_data: JSON.stringify(structuredData),
      schema_markup: schemaMarkup,
    }

    try {
      const url = mode === 'create' ? '/api/admin/blogs' : `/api/admin/blogs/${blog?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) { router.push('/admin/blogs'); router.refresh() }
      else { const data = await res.json(); setError(data.error || 'Failed to save') }
    } catch { setError('Network error') }
    setSaving(false)
  }

  // SEO calculations
  const titleScore = getTitleScore(structuredData.seoTitle || form.meta_title || form.title)
  const metaDescScore = getMetaDescScore(structuredData.metaDescription || form.meta_description)
  const contentScore = getContentScore(form.content)
  const slugScore: SeoScore = (structuredData.urlSlug || form.slug) ? 'green' : 'red'
  const tagsScore: SeoScore = form.tags.length >= 3 ? 'green' : form.tags.length >= 1 ? 'yellow' : 'red'

  const scores = [titleScore, metaDescScore, contentScore, slugScore, tagsScore]
  const greenCount = scores.filter(s => s === 'green').length
  const seoPercentage = Math.round((greenCount / scores.length) * 100)

  const suggestedTags = extractKeywords(`${form.title} ${form.content}`)
  const wordCount = form.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/blogs" className="text-slate-400 hover:text-white transition-colors p-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">{mode === 'create' ? 'New Blog Post' : 'Edit Blog Post'}</h1>
            {lastSaved && <p className="text-slate-500 text-xs mt-0.5">Last auto-saved: {lastSaved.toLocaleTimeString()}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {autoSaveIndicator && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <Save className="w-3 h-3 animate-pulse" /> Auto-saving...
            </span>
          )}
          {mode === 'edit' && (
            <button onClick={handleDuplicate} disabled={saving} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-all disabled:opacity-50 flex items-center gap-1.5">
              <Copy className="w-4 h-4" /> Duplicate
            </button>
          )}
          <button onClick={() => setShowPreview(!showPreview)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-all flex items-center gap-1.5">
            <Eye className="w-4 h-4" /> {showPreview ? 'Editor' : 'Preview'}
          </button>
          <button onClick={() => handleSubmit(false)} disabled={saving} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={() => handleSubmit(true)} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50">
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      {/* Title */}
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-5">
        <input
          type="text"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full bg-transparent text-white text-2xl font-bold focus:outline-none placeholder-slate-600"
          placeholder="Enter your blog post title..."
        />
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
          <span>Slug: /blog/{structuredData.urlSlug || form.slug}</span>
          <span>{form.title.length} chars</span>
        </div>
      </div>

      {/* Quick Settings Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={form.category} onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
          className="px-4 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500">
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            className="px-3 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 w-48"
            placeholder="Add tag/keyword..." />
          <button onClick={addTag} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm">Add</button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {form.tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs">
              {tag}
              <button onClick={() => removeTag(tag)} className="text-slate-500 hover:text-red-400">&times;</button>
            </span>
          ))}
        </div>
        {suggestedTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 text-xs">Suggested:</span>
            {suggestedTags.filter(t => !form.tags.includes(t)).slice(0, 5).map((tag, i) => (
              <button key={i} onClick={() => addSuggestedTag(tag)} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs hover:bg-blue-500/20 transition-all">+ {tag}</button>
            ))}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-[#1e293b] rounded-xl p-1 border border-slate-700">
        <button onClick={() => setActiveTab('editor')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${activeTab === 'editor' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
          <Edit3 className="w-4 h-4" /> Content Editor
        </button>
        <button onClick={() => setActiveTab('structured')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${activeTab === 'structured' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
          <BookOpen className="w-4 h-4" /> Structured Data
        </button>
        <button onClick={() => setActiveTab('seo')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${activeTab === 'seo' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
          <Settings className="w-4 h-4" /> SEO Settings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'editor' && (
        <div className="space-y-4">
          {showPreview ? (
            <div className="bg-white rounded-2xl p-8 max-h-[800px] overflow-y-auto border border-slate-700">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{form.title}</h1>
              {form.excerpt && <p className="text-gray-600 text-lg mb-6">{form.excerpt}</p>}
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: form.content || '<p class="text-gray-400">Start writing to see preview...</p>' }} />
            </div>
          ) : (
            <TiptapEditor
              content={form.content}
              onChange={handleContentChange}
              placeholder="Start writing your blog post content here. Use the toolbar above for formatting..."
            />
          )}

          {/* Excerpt */}
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-5">
            <label className="block text-sm font-medium text-slate-300 mb-2">Excerpt</label>
            <textarea value={form.excerpt} onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
              rows={2} className="w-full px-4 py-3 bg-[#0f172a] border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 resize-y text-sm"
              placeholder="Brief description for blog listing and SEO..." />
          </div>

          {/* Focus Keyword */}
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-5">
            <label className="block text-sm font-medium text-slate-300 mb-2">Focus Keyword</label>
            <input type="text" value={form.focus_keyword || ''} onChange={(e) => setForm(prev => ({ ...prev, focus_keyword: e.target.value }))}
              className="w-full px-4 py-3 bg-[#0f172a] border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
              placeholder="Primary SEO keyword for this article" />
          </div>

          {/* Content Stats */}
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4 flex items-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {wordCount} words</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.max(1, Math.ceil(wordCount / 200))} min read</span>
            <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {form.tags.length} tags</span>
            <span className="flex items-center gap-1">
              SEO: <span className={seoPercentage >= 80 ? 'text-green-400' : seoPercentage >= 40 ? 'text-yellow-400' : 'text-red-400'}>
                {seoPercentage}%
              </span>
            </span>
          </div>
        </div>
      )}

      {activeTab === 'structured' && (
        <BlogStructuredTemplate data={structuredData} onChange={handleStructuredDataChange} />
      )}

      {activeTab === 'seo' && (
        <div className="space-y-4">
          {/* SEO Score */}
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">SEO Score</h3>
              <span className={`text-2xl font-bold ${seoPercentage >= 80 ? 'text-green-400' : seoPercentage >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                {seoPercentage}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full mb-6">
              <div className={`h-full rounded-full transition-all ${seoPercentage >= 80 ? 'bg-green-500' : seoPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${seoPercentage}%` }} />
            </div>
            <div className="space-y-3">
              {[
                { label: 'SEO Title', score: titleScore, detail: `${(structuredData.seoTitle || form.meta_title || form.title).length} chars (ideal: 50-60)` },
                { label: 'Meta Description', score: metaDescScore, detail: `${(structuredData.metaDescription || form.meta_description).length} chars (ideal: 150-160)` },
                { label: 'Content Length', score: contentScore, detail: `${wordCount} words (ideal: 1000+)` },
                { label: 'URL Slug', score: slugScore, detail: (structuredData.urlSlug || form.slug) ? 'Slug set' : 'No slug' },
                { label: 'Tags/Keywords', score: tagsScore, detail: `${form.tags.length} tags (ideal: 3+)` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-[#0f172a] rounded-xl">
                  <div className="flex items-center gap-3">
                    {getSeoIndicator(item.score)}
                    <span className="text-slate-300 text-sm">{item.label}</span>
                  </div>
                  <span className="text-slate-500 text-xs">{item.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Tips */}
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">SEO Best Practices</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { tip: 'Include focus keyword in title', desc: 'Place your primary keyword near the beginning of the title' },
                { tip: 'Write a compelling meta description', desc: 'Include the keyword and a call-to-action within 150-160 chars' },
                { tip: 'Use H2 and H3 headings', desc: 'Break content into sections with keyword-rich headings' },
                { tip: 'Add internal links', desc: 'Link to related blog posts and tools within your content' },
                { tip: 'Optimize images with alt text', desc: 'Describe images with relevant keywords for image search' },
                { tip: 'Write 1000+ words', desc: 'Long-form content ranks better for competitive keywords' },
                { tip: 'Add FAQ section', desc: 'FAQs generate rich snippets in Google search results' },
                { tip: 'Use schema markup', desc: 'Structured data helps Google understand and display your content' },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-[#0f172a] rounded-xl border border-slate-700/50">
                  <p className="text-white text-sm font-medium">{item.tip}</p>
                  <p className="text-slate-500 text-xs mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
