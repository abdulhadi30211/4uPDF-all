'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { Calendar, Clock, Eye, Tag, ArrowLeft, Share2, ChevronRight, BookOpen, Wrench, HelpCircle, ExternalLink, List } from 'lucide-react'
import Header from '@/components/shared/Header'
import { TOOLS } from '@/lib/tools-data'

interface FaqItem { question: string; answer: string }
interface RelatedTool { name: string; url: string; description: string }
interface TocItem { id: string; text: string; level: number }
interface StructuredData {
  seoTitle?: string
  metaDescription?: string
  urlSlug?: string
  featuredImage?: string
  featuredImageAlt?: string
  author?: string
  publishDate?: string
  modifiedDate?: string
  readingTime?: number
  breadcrumbs?: { name: string; url: string }[]
  enableToc?: boolean
  tocItems?: TocItem[]
  faqs?: FaqItem[]
  relatedTools?: RelatedTool[]
  relatedArticleIds?: string[]
  toolCtaName?: string
  toolCtaUrl?: string
  toolCtaDescription?: string
  customSchema?: string
  enableArticleSchema?: boolean
  enableFaqSchema?: boolean
  enableHowToSchema?: boolean
  enableBreadcrumbsSchema?: boolean
}

interface BlogPost {
  id: string; title: string; slug: string; content: string; excerpt: string
  cover_image: string | null; category: string; tags: string[]
  meta_title: string; meta_description: string; views_count: number
  created_at: string; updated_at: string; structured_data?: string; schema_markup?: string
}

interface RelatedPost {
  id: string; title: string; slug: string; excerpt: string
  category: string; cover_image: string | null; created_at: string
}

// Build a lookup map of tool names to their hrefs for auto-linking
const TOOL_LINK_MAP = new Map<string, string>()
TOOLS.forEach(tool => {
  // Map lowercase tool name to its href
  TOOL_LINK_MAP.set(tool.name.toLowerCase(), tool.href)
  // Also map common variations
  if (tool.name.includes('PDF')) {
    TOOL_LINK_MAP.set(tool.name.toLowerCase().replace('pdf', '').trim(), tool.href)
  }
})

function autoLinkTools(content: string): string {
  // Sort tool names by length (longest first) to avoid partial matches
  const toolNames = Array.from(TOOL_LINK_MAP.keys()).sort((a, b) => b.length - a.length)

  let result = content
  for (const toolName of toolNames) {
    if (toolName.length < 4) continue // Skip very short names to avoid false positives

    const href = TOOL_LINK_MAP.get(toolName)!
    // Match tool name in text but NOT inside existing <a> tags or HTML tags
    const escapedName = toolName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Case-insensitive match, not inside HTML tags or existing links
    const regex = new RegExp(`(?<![<\\w/])\\b(${escapedName})\\b(?![^<]*>|[^<]*<\\/a)`, 'gi')
    result = result.replace(regex, (match, p1) => {
      return `<a href="${href}" class="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors inline-flex items-center gap-1" title="Try ${p1} tool">${p1}<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block ml-0.5 opacity-60"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>`
    })
  }
  return result
}

export default function BlogDetailClient({ blog, relatedPosts }: { blog: BlogPost; relatedPosts: RelatedPost[] }) {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const wordCount = blog.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  // Increment views on mount
  useEffect(() => {
    fetch(`/api/blogs/${blog.slug}`, { method: 'GET' }).catch(() => {})
  }, [blog.slug])

  // Parse structured data
  let structured: StructuredData = {}
  try { if (blog.structured_data) structured = JSON.parse(blog.structured_data) } catch {}

  const author = structured.author || '4uPDF Team'
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://4updf-all.vercel.app'
  const breadcrumbs = structured.breadcrumbs || [
    { name: 'Home', url: baseUrl },
    { name: 'Blog', url: `${baseUrl}/blog` },
  ]
  const faqs = structured.faqs || []
  const relatedTools = structured.relatedTools || []
  const tocItems = structured.tocItems || []
  const enableToc = structured.enableToc !== false && tocItems.length > 0

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: blog.title, text: blog.excerpt, url: window.location.href }) } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  // Find tools mentioned in tags/content for auto-linking
  const articleToolLinks = TOOLS.filter(tool => {
    const toolNameLower = tool.name.toLowerCase()
    return blog.tags?.some(tag => tag.toLowerCase().includes(toolNameLower) || toolNameLower.includes(tag.toLowerCase())) ||
           blog.title.toLowerCase().includes(toolNameLower) ||
           blog.category.toLowerCase() === tool.category
  }).slice(0, 8)

  // Add IDs to headings in content for TOC linking
  // Also strip inline color/background-color styles that conflict with dark theme
  // And auto-link tool names in content
  const processedContent = autoLinkTools(
    blog.content
      // Remove inline color styles that make text dark on dark bg
      .replace(/\s*style\s*=\s*"[^"]*color\s*:[^"]*"/gi, (match) => {
        // Keep the style attr but remove color and background-color properties
        return match.replace(/(?:background-)?color\s*:\s*[^;"]+;?\s*/gi, '')
      })
      .replace(/\s*style\s*=\s*""/gi, '') // Clean empty style attrs
      .replace(/<h([2-3])([^>]*)>(.*?)<\/h[2-3]>/gi, (match, level, attrs, text) => {
        const id = text.replace(/<[^>]*>/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        return `<h${level}${attrs} id="${id}">${text}</h${level}>`
      })
  )

  // Schema markup
  const schemaMarkup = blog.schema_markup || ''

  // Format views count for display
  const formatViews = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
    return count.toString()
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Header currentPath="/blog" />

      {/* Schema Markup */}
      {schemaMarkup && schemaMarkup.split('\n').map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      ))}

      <article className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Breadcrumbs */}
            <nav className="mb-6 text-sm" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 text-slate-300 flex-wrap">
                {breadcrumbs.map((bc, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight size={12} className="text-slate-500" />}
                    <a href={bc.url} className="hover:text-blue-400 transition-colors text-slate-300">{bc.name}</a>
                  </span>
                ))}
                <ChevronRight size={12} className="text-slate-500" />
                <span className="text-slate-400 truncate max-w-xs">{blog.title}</span>
              </ol>
            </nav>

            {/* Article Header */}
            <header className="mb-8">
              {blog.cover_image && (
                <div className="mb-8 rounded-2xl overflow-hidden">
                  <img src={blog.cover_image} alt={structured.featuredImageAlt || blog.title} className="w-full h-64 sm:h-80 object-cover" />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">{blog.category}</span>
                <span className="flex items-center gap-1 text-slate-300 text-sm"><Calendar size={14} className="text-blue-400" />{formatDate(blog.created_at)}</span>
                <span className="flex items-center gap-1 text-slate-300 text-sm"><Clock size={14} className="text-green-400" />{readingTime} min read</span>
                <span className="flex items-center gap-1 text-slate-300 text-sm"><Eye size={14} className="text-purple-400" />{formatViews(blog.views_count)} views</span>
                <button onClick={handleShare} className="flex items-center gap-1 text-slate-300 hover:text-blue-400 text-sm transition-colors ml-auto">
                  <Share2 size={14} /> Share
                </button>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">{blog.title}</h1>
              <p className="text-slate-300 text-lg">{blog.excerpt}</p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-700">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {author.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-semibold">{author}</p>
                  <p className="text-slate-400 text-sm">Published {formatDate(blog.created_at)}</p>
                </div>
              </div>
            </header>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {blog.tags.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm border border-slate-700">
                    <Tag size={10} className="text-blue-400" /> {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Related Tools Quick Links - Auto-detected from article tags and content */}
            {articleToolLinks.length > 0 && (
              <div className="mb-8 p-5 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl">
                <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <Wrench size={16} className="text-blue-400" />
                  Tools Mentioned in This Article
                </h3>
                <div className="flex flex-wrap gap-2">
                  {articleToolLinks.map((tool, i) => {
                    const Icon = tool.icon
                    return (
                      <a
                        key={i}
                        href={tool.href}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-blue-600/30 border border-slate-700 hover:border-blue-500/50 rounded-lg text-sm text-slate-300 hover:text-blue-400 transition-all"
                      >
                        <Icon size={12} style={{ color: tool.color }} />
                        {tool.name}
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Tool CTA */}
            {structured.toolCtaName && (
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <Wrench size={20} className="text-blue-400" />
                      {structured.toolCtaName}
                    </h3>
                    {structured.toolCtaDescription && (
                      <p className="text-slate-400 text-sm mt-1">{structured.toolCtaDescription}</p>
                    )}
                  </div>
                  <a href={structured.toolCtaUrl || '#'} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center gap-2 flex-shrink-0">
                    Try it Free <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-invert max-w-none prose-headings:text-white prose-h2:text-2xl prose-h3:text-xl prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-a:text-blue-400 prose-code:text-blue-300 prose-blockquote:text-slate-400 prose-th:text-white prose-td:text-slate-300 prose-img:rounded-xl prose-img:shadow-lg"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            {/* FAQ Section */}
            {faqs.length > 0 && (
              <section className="mt-12 pt-8 border-t border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <HelpCircle size={24} className="text-blue-400" />
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, i) => (
                    <details key={i} className="group bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden">
                      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-800/50 transition-colors">
                        <span className="text-white font-medium">{faq.question}</span>
                        <ChevronRight size={16} className="text-slate-400 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="px-6 pb-4 text-slate-300 text-sm leading-relaxed border-t border-slate-700/50 pt-3">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Related Tools */}
            {relatedTools.length > 0 && (
              <section className="mt-12 pt-8 border-t border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Wrench size={24} className="text-green-400" />
                  Related Tools
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedTools.map((tool, i) => (
                    <a key={i} href={tool.url} className="group p-4 bg-[#1e293b] border border-slate-700 rounded-xl hover:border-blue-500/50 transition-all">
                      <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors flex items-center gap-2">
                        <Wrench size={14} className="text-green-400" /> {tool.name}
                      </h3>
                      {tool.description && <p className="text-slate-400 text-sm mt-1">{tool.description}</p>}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Tools Mentioned CTA at Bottom */}
            {articleToolLinks.length > 0 && (
              <section className="mt-12 pt-8 border-t border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Wrench size={24} className="text-blue-400" />
                  Try the Tools from This Article
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {articleToolLinks.map((tool, i) => {
                    const Icon = tool.icon
                    return (
                      <a
                        key={i}
                        href={tool.href}
                        className="group p-4 bg-[#1e293b] border border-slate-700 rounded-xl hover:border-blue-500/50 transition-all text-center"
                      >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ backgroundColor: tool.color + '20' }}>
                          <Icon size={20} style={{ color: tool.color }} />
                        </div>
                        <h3 className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors">{tool.name}</h3>
                        <p className="text-slate-500 text-xs mt-1 line-clamp-1">{tool.desc}</p>
                      </a>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Share & Author Footer */}
            <div className="mt-12 pt-8 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">{author.charAt(0)}</div>
                  <div>
                    <p className="text-white font-semibold">{author}</p>
                    <p className="text-slate-400 text-sm">PDF Tools &amp; Resources</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleShare} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-all flex items-center gap-2">
                    <Share2 size={14} /> Share
                  </button>
                  <Link href="/blog" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-all flex items-center gap-2">
                    <ArrowLeft size={14} /> All Articles
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - TOC + Related */}
          {(enableToc || relatedPosts.length > 0) && (
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Table of Contents */}
                {enableToc && tocItems.length > 0 && (
                  <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-5">
                    <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                      <List size={14} className="text-blue-400" /> Table of Contents
                    </h3>
                    <nav className="space-y-1.5">
                      {tocItems.map((item, i) => (
                        <a key={i} href={`#${item.id}`}
                          className={`block text-sm transition-colors hover:text-blue-400 ${item.level === 2 ? 'text-slate-300 font-medium' : 'text-slate-400 pl-4'}`}>
                          {item.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Quick Tool Links Sidebar */}
                {articleToolLinks.length > 0 && (
                  <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-5">
                    <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                      <Wrench size={14} className="text-green-400" /> Related Tools
                    </h3>
                    <div className="space-y-2">
                      {articleToolLinks.slice(0, 6).map((tool, i) => {
                        const Icon = tool.icon
                        return (
                          <a key={i} href={tool.href} className="flex items-center gap-2 text-slate-300 text-sm hover:text-blue-400 transition-colors group">
                            <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tool.color + '20' }}>
                              <Icon size={12} style={{ color: tool.color }} />
                            </div>
                            <span className="group-hover:underline">{tool.name}</span>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-5">
                    <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                      <BookOpen size={14} className="text-purple-400" /> Related Articles
                    </h3>
                    <div className="space-y-3">
                      {relatedPosts.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
                          <span className="text-slate-300 text-sm group-hover:text-blue-400 transition-colors line-clamp-2">{post.title}</span>
                          <span className="text-slate-500 text-xs">{formatDate(post.created_at)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </article>

      {/* Footer */}
      <footer className="bg-[#070d19] border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} 4uPDF. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
