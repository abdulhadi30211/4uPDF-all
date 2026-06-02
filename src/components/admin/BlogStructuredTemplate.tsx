'use client'

import { useState } from 'react'
import {
  Plus, Trash2, ChevronDown, ChevronUp, GripVertical,
  Link as LinkIcon, FileText, HelpCircle, Wrench, BookOpen, List,
  Image as ImageIcon, Code, Search, Calendar, Clock, User, Tag,
  Navigation, Award, BarChart3
} from 'lucide-react'

export interface FaqItem {
  question: string
  answer: string
}

export interface TocItem {
  id: string
  text: string
  level: number
}

export interface RelatedTool {
  name: string
  url: string
  description: string
}

export interface StructuredData {
  // SEO
  seoTitle: string
  metaDescription: string
  urlSlug: string
  canonicalUrl: string

  // Article Meta
  featuredImage: string
  featuredImageAlt: string
  author: string
  publishDate: string
  modifiedDate: string
  readingTime: number

  // Breadcrumbs
  breadcrumbs: { name: string; url: string }[]

  // TOC
  enableToc: boolean
  tocItems: TocItem[]

  // FAQ
  faqs: FaqItem[]

  // Related
  relatedTools: RelatedTool[]
  relatedArticleIds: string[]

  // Tool CTA
  toolCtaName: string
  toolCtaUrl: string
  toolCtaDescription: string

  // Schema
  customSchema: string
  enableArticleSchema: boolean
  enableFaqSchema: boolean
  enableHowToSchema: boolean
  enableBreadcrumbsSchema: boolean
}

export const defaultStructuredData: StructuredData = {
  seoTitle: '',
  metaDescription: '',
  urlSlug: '',
  canonicalUrl: '',
  featuredImage: '',
  featuredImageAlt: '',
  author: '4uPDF Team',
  publishDate: new Date().toISOString().split('T')[0],
  modifiedDate: new Date().toISOString().split('T')[0],
  readingTime: 0,
  breadcrumbs: [
    { name: 'Home', url: 'https://pdf100-tools.vercel.app' },
    { name: 'Blog', url: 'https://pdf100-tools.vercel.app/blog' },
  ],
  enableToc: true,
  tocItems: [],
  faqs: [],
  relatedTools: [],
  relatedArticleIds: [],
  toolCtaName: '',
  toolCtaUrl: '',
  toolCtaDescription: '',
  customSchema: '',
  enableArticleSchema: true,
  enableFaqSchema: true,
  enableHowToSchema: false,
  enableBreadcrumbsSchema: true,
}

// Generate JSON-LD schema from structured data
export function generateSchemaMarkup(data: StructuredData, blogTitle: string, blogSlug: string): string {
  const schemas: object[] = []
  const siteUrl = 'https://pdf100-tools.vercel.app'

  // Article Schema
  if (data.enableArticleSchema) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.seoTitle || blogTitle,
      description: data.metaDescription,
      image: data.featuredImage ? `${siteUrl}${data.featuredImage}` : undefined,
      datePublished: data.publishDate,
      dateModified: data.modifiedDate || data.publishDate,
      author: {
        '@type': data.author === '4uPDF Team' ? 'Organization' : 'Person',
        name: data.author,
      },
      publisher: {
        '@type': 'Organization',
        name: '4uPDF',
        logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.svg` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/blog/${data.urlSlug || blogSlug}` },
    })
  }

  // FAQ Schema
  if (data.enableFaqSchema && data.faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    })
  }

  // Breadcrumbs Schema
  if (data.enableBreadcrumbsSchema && data.breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        ...data.breadcrumbs.map((bc, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: bc.name,
          item: bc.url,
        })),
        {
          '@type': 'ListItem',
          position: data.breadcrumbs.length + 1,
          name: data.seoTitle || blogTitle,
          item: `${siteUrl}/blog/${data.urlSlug || blogSlug}`,
        },
      ],
    })
  }

  // HowTo Schema
  if (data.enableHowToSchema) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: data.seoTitle || blogTitle,
      description: data.metaDescription,
      image: data.featuredImage ? `${siteUrl}${data.featuredImage}` : undefined,
      step: data.tocItems.filter(t => t.level === 2).map((item, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: item.text,
      })),
    })
  }

  // Custom schema
  if (data.customSchema) {
    try {
      schemas.push(JSON.parse(data.customSchema))
    } catch {}
  }

  return schemas.map(s => JSON.stringify(s)).join('\n')
}

// Section Component
function SectionCard({ title, icon: Icon, children, defaultOpen = true, color = '#3b82f6' }: {
  title: string
  icon: any
  children: React.ReactNode
  defaultOpen?: boolean
  color?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-800/30 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span className="text-white font-semibold text-sm flex-1 text-left">{title}</span>
        {open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-slate-700/50 pt-4">{children}</div>}
    </div>
  )
}

// Input Field
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-slate-500 text-xs mt-1">{hint}</p>}
    </div>
  )
}

interface BlogStructuredTemplateProps {
  data: StructuredData
  onChange: (data: StructuredData) => void
}

export default function BlogStructuredTemplate({ data, onChange }: BlogStructuredTemplateProps) {
  const update = (partial: Partial<StructuredData>) => {
    onChange({ ...data, ...partial })
  }

  const addFaq = () => {
    update({ faqs: [...data.faqs, { question: '', answer: '' }] })
  }

  const removeFaq = (index: number) => {
    update({ faqs: data.faqs.filter((_, i) => i !== index) })
  }

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const faqs = [...data.faqs]
    faqs[index] = { ...faqs[index], [field]: value }
    update({ faqs })
  }

  const addRelatedTool = () => {
    update({ relatedTools: [...data.relatedTools, { name: '', url: '', description: '' }] })
  }

  const removeRelatedTool = (index: number) => {
    update({ relatedTools: data.relatedTools.filter((_, i) => i !== index) })
  }

  const updateRelatedTool = (index: number, field: keyof RelatedTool, value: string) => {
    const tools = [...data.relatedTools]
    tools[index] = { ...tools[index], [field]: value }
    update({ relatedTools: tools })
  }

  const addBreadcrumb = () => {
    update({ breadcrumbs: [...data.breadcrumbs, { name: '', url: '' }] })
  }

  const removeBreadcrumb = (index: number) => {
    update({ breadcrumbs: data.breadcrumbs.filter((_, i) => i !== index) })
  }

  const updateBreadcrumb = (index: number, field: 'name' | 'url', value: string) => {
    const bcs = [...data.breadcrumbs]
    bcs[index] = { ...bcs[index], [field]: value }
    update({ breadcrumbs: bcs })
  }

  const schemaPreview = generateSchemaMarkup(data, data.seoTitle, data.urlSlug)

  return (
    <div className="space-y-4">
      {/* SEO Settings */}
      <SectionCard title="SEO Settings" icon={Search} color="#10b981" defaultOpen={true}>
        <Field label="SEO Title" hint="Recommended: 50-60 characters. This appears in search results.">
          <input
            type="text"
            value={data.seoTitle}
            onChange={(e) => update({ seoTitle: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            placeholder="Enter SEO-optimized title..."
          />
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs ${data.seoTitle.length >= 50 && data.seoTitle.length <= 60 ? 'text-green-400' : 'text-yellow-400'}`}>
              {data.seoTitle.length}/60 characters
            </span>
          </div>
        </Field>

        <Field label="Meta Description" hint="Recommended: 150-160 characters. This appears below the title in search results.">
          <textarea
            value={data.metaDescription}
            onChange={(e) => update({ metaDescription: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 resize-y"
            placeholder="Write a compelling meta description..."
          />
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs ${data.metaDescription.length >= 150 && data.metaDescription.length <= 160 ? 'text-green-400' : 'text-yellow-400'}`}>
              {data.metaDescription.length}/160 characters
            </span>
          </div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="URL Slug">
            <input
              type="text"
              value={data.urlSlug}
              onChange={(e) => update({ urlSlug: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="url-friendly-slug"
            />
          </Field>
          <Field label="Canonical URL">
            <input
              type="text"
              value={data.canonicalUrl}
              onChange={(e) => update({ canonicalUrl: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="https://pdf100-tools.vercel.app/blog/..."
            />
          </Field>
        </div>
      </SectionCard>

      {/* Featured Image */}
      <SectionCard title="Featured Image" icon={ImageIcon} color="#ec4899" defaultOpen={true}>
        <Field label="Image URL">
          <input
            type="text"
            value={data.featuredImage}
            onChange={(e) => update({ featuredImage: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            placeholder="https://example.com/image.jpg or /blog-images/image.png"
          />
        </Field>
        <Field label="Image Alt Text" hint="Describe the image for accessibility and SEO.">
          <input
            type="text"
            value={data.featuredImageAlt}
            onChange={(e) => update({ featuredImageAlt: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            placeholder="Describe the featured image..."
          />
        </Field>
        {data.featuredImage && (
          <div className="mt-3 rounded-xl overflow-hidden border border-slate-700">
            <img src={data.featuredImage} alt={data.featuredImageAlt || 'Preview'} className="w-full h-48 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
        )}
      </SectionCard>

      {/* Article Meta */}
      <SectionCard title="Article Meta" icon={FileText} color="#6366f1" defaultOpen={true}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Author">
            <input
              type="text"
              value={data.author}
              onChange={(e) => update({ author: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="Author name"
            />
          </Field>
          <Field label="Reading Time (minutes)" hint="Auto-calculated from content if set to 0">
            <input
              type="number"
              value={data.readingTime}
              onChange={(e) => update({ readingTime: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              min={0}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Publish Date">
            <input
              type="date"
              value={data.publishDate}
              onChange={(e) => update({ publishDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </Field>
          <Field label="Modified Date">
            <input
              type="date"
              value={data.modifiedDate}
              onChange={(e) => update({ modifiedDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </Field>
        </div>
      </SectionCard>

      {/* Breadcrumbs */}
      <SectionCard title="Breadcrumbs" icon={Navigation} color="#f59e0b" defaultOpen={false}>
        <div className="space-y-3">
          {data.breadcrumbs.map((bc, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-slate-500 text-xs w-6 text-center">{i + 1}</span>
              <input
                type="text"
                value={bc.name}
                onChange={(e) => updateBreadcrumb(i, 'name', e.target.value)}
                className="flex-1 px-3 py-2 bg-[#0f172a] border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Name"
              />
              <input
                type="text"
                value={bc.url}
                onChange={(e) => updateBreadcrumb(i, 'url', e.target.value)}
                className="flex-1 px-3 py-2 bg-[#0f172a] border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="URL"
              />
              <button type="button" onClick={() => removeBreadcrumb(i)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addBreadcrumb} className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm">
            <Plus size={14} /> Add Breadcrumb
          </button>
        </div>
      </SectionCard>

      {/* Table of Contents */}
      <SectionCard title="Table of Contents" icon={List} color="#06b6d4" defaultOpen={false}>
        <div className="flex items-center gap-3 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.enableToc}
              onChange={(e) => update({ enableToc: e.target.checked })}
              className="w-4 h-4 rounded bg-[#0f172a] border-slate-600 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-slate-300 text-sm">Enable Table of Contents</span>
          </label>
        </div>
        <p className="text-slate-500 text-xs">TOC is auto-generated from H2 and H3 headings in the content. No manual entry needed.</p>
        {data.tocItems.length > 0 && (
          <div className="mt-3 space-y-1">
            {data.tocItems.map((item, i) => (
              <div key={i} className={`text-sm ${item.level === 2 ? 'text-slate-300' : 'text-slate-500 pl-4'}`}>
                H{item.level}: {item.text}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* FAQ Section */}
      <SectionCard title="FAQ Section" icon={HelpCircle} color="#f43f5e" defaultOpen={true}>
        <p className="text-slate-500 text-xs mb-4">FAQs appear at the bottom of the article and generate FAQ Schema markup for Google rich results.</p>
        <div className="space-y-4">
          {data.faqs.map((faq, i) => (
            <div key={i} className="bg-[#0f172a] border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-xs font-medium">FAQ #{i + 1}</span>
                <button type="button" onClick={() => removeFaq(i)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
              <input
                type="text"
                value={faq.question}
                onChange={(e) => updateFaq(i, 'question', e.target.value)}
                className="w-full px-3 py-2 bg-[#1e293b] border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 mb-2"
                placeholder="Question..."
              />
              <textarea
                value={faq.answer}
                onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-[#1e293b] border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-y"
                placeholder="Answer..."
              />
            </div>
          ))}
          <button type="button" onClick={addFaq} className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm">
            <Plus size={14} /> Add FAQ
          </button>
        </div>
      </SectionCard>

      {/* Tool CTA */}
      <SectionCard title="Tool CTA (Call-to-Action)" icon={Wrench} color="#10b981" defaultOpen={true}>
        <p className="text-slate-500 text-xs mb-4">Promote a specific tool within the article. Shows as a prominent call-to-action card.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tool Name">
            <input
              type="text"
              value={data.toolCtaName}
              onChange={(e) => update({ toolCtaName: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="e.g., Merge PDF"
            />
          </Field>
          <Field label="Tool URL">
            <input
              type="text"
              value={data.toolCtaUrl}
              onChange={(e) => update({ toolCtaUrl: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="/tools/merge.html"
            />
          </Field>
        </div>
        <Field label="Tool Description">
          <input
            type="text"
            value={data.toolCtaDescription}
            onChange={(e) => update({ toolCtaDescription: e.target.value })}
            className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            placeholder="Brief description of what this tool does"
          />
        </Field>
      </SectionCard>

      {/* Related Tools */}
      <SectionCard title="Related Tools" icon={Award} color="#8b5cf6" defaultOpen={false}>
        <div className="space-y-3">
          {data.relatedTools.map((tool, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={tool.name}
                onChange={(e) => updateRelatedTool(i, 'name', e.target.value)}
                className="flex-1 px-3 py-2 bg-[#0f172a] border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Tool name"
              />
              <input
                type="text"
                value={tool.url}
                onChange={(e) => updateRelatedTool(i, 'url', e.target.value)}
                className="flex-1 px-3 py-2 bg-[#0f172a] border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="URL"
              />
              <input
                type="text"
                value={tool.description}
                onChange={(e) => updateRelatedTool(i, 'description', e.target.value)}
                className="flex-1 px-3 py-2 bg-[#0f172a] border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Description"
              />
              <button type="button" onClick={() => removeRelatedTool(i)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addRelatedTool} className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm">
            <Plus size={14} /> Add Related Tool
          </button>
        </div>
      </SectionCard>

      {/* Schema Markup */}
      <SectionCard title="Schema Markup" icon={Code} color="#f97316" defaultOpen={false}>
        <p className="text-slate-500 text-xs mb-4">Schema markup helps search engines understand your content and display rich results.</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={data.enableArticleSchema} onChange={(e) => update({ enableArticleSchema: e.target.checked })} className="w-4 h-4 rounded bg-[#0f172a] border-slate-600 text-blue-500" />
            <span className="text-slate-300 text-sm">Article Schema</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={data.enableFaqSchema} onChange={(e) => update({ enableFaqSchema: e.target.checked })} className="w-4 h-4 rounded bg-[#0f172a] border-slate-600 text-blue-500" />
            <span className="text-slate-300 text-sm">FAQ Schema</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={data.enableBreadcrumbsSchema} onChange={(e) => update({ enableBreadcrumbsSchema: e.target.checked })} className="w-4 h-4 rounded bg-[#0f172a] border-slate-600 text-blue-500" />
            <span className="text-slate-300 text-sm">Breadcrumbs Schema</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={data.enableHowToSchema} onChange={(e) => update({ enableHowToSchema: e.target.checked })} className="w-4 h-4 rounded bg-[#0f172a] border-slate-600 text-blue-500" />
            <span className="text-slate-300 text-sm">HowTo Schema</span>
          </label>
        </div>
        <Field label="Custom Schema (JSON-LD)" hint="Add custom schema markup. Must be valid JSON.">
          <textarea
            value={data.customSchema}
            onChange={(e) => update({ customSchema: e.target.value })}
            rows={4}
            className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-blue-500 resize-y"
            placeholder='{"@context":"https://schema.org","@type":"..."}'
          />
        </Field>
        <div className="mt-3">
          <p className="text-slate-400 text-xs font-medium mb-2">Generated Schema Preview:</p>
          <pre className="bg-[#0f172a] border border-slate-700 rounded-xl p-4 text-xs text-green-400 overflow-x-auto max-h-[300px] overflow-y-auto">
            {schemaPreview || '// Enable schemas above to see preview'}
          </pre>
        </div>
      </SectionCard>
    </div>
  )
}
