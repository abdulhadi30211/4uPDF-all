'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search, Shield, Zap, Infinity, Smartphone, ArrowRight, TrendingUp, Star, Calendar, Eye } from 'lucide-react'
import Header from '@/components/shared/Header'
import { TOOLS, TOOL_CATEGORIES, getToolsByCategory, POPULAR_TOOLS } from '@/lib/tools-data'

interface BlogItem {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  cover_image: string | null
  created_at: string
  tags: string[]
  views_count: number
}

export default function HomeClient({ latestBlogs }: { latestBlogs: BlogItem[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('popular')

  const filteredTools = searchQuery
    ? TOOLS.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : getToolsByCategory(activeCategory)

  const currentCatData = TOOL_CATEGORIES.find(c => c.id === activeCategory)

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Header currentPath="/" />

      <main>
        {/* Hero */}
        <section className="py-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 relative">
            <span className="inline-flex items-center gap-2 bg-blue-500/15 text-blue-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-blue-500/30">
              <Star size={14} className="text-yellow-400" />
              117+ Free Online PDF Tools
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight">
              Your Complete <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">PDF Solution</span>
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
              117+ powerful tools to merge, split, compress, convert, edit, sign, annotate, and transform PDFs. 100% Free &amp; Private. Everything runs in your browser.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="#tools" className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25">
                Explore All Tools <ArrowRight size={16} />
              </a>
              <Link href="/blog" className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all border border-slate-700">
                Read Blog
              </Link>
            </div>
            <div className="flex justify-center gap-16 mt-12">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-blue-500">117+</div>
                <div className="text-slate-500 text-sm uppercase tracking-wider mt-1">Tools</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-green-500">100%</div>
                <div className="text-slate-500 text-sm uppercase tracking-wider mt-1">Private</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-yellow-500">$0</div>
                <div className="text-slate-500 text-sm uppercase tracking-wider mt-1">Always Free</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Shield, title: 'Bank-Level Privacy', desc: 'Files never leave your computer. All processing happens in your browser.', color: 'from-green-500/20 to-green-600/20', border: 'border-green-500/30', iconColor: '#10b981' },
              { icon: Zap, title: 'Lightning Fast', desc: 'No upload/download wait times. Instant processing in your browser.', color: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/30', iconColor: '#3b82f6' },
              { icon: Infinity, title: 'Unlimited & Free', desc: 'No file size limits, no daily limits, no watermarks. Use freely.', color: 'from-yellow-500/20 to-yellow-600/20', border: 'border-yellow-500/30', iconColor: '#f59e0b' },
              { icon: Smartphone, title: 'Works Everywhere', desc: 'Fully responsive. Use on Desktop, Tablet, or Mobile device.', color: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-500/30', iconColor: '#8b5cf6' },
            ].map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className={`bg-gradient-to-br ${f.color} border ${f.border} rounded-2xl p-6`}>
                  <Icon size={28} style={{ color: f.iconColor }} className="mb-3" />
                  <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Tools */}
        <section id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold mb-3">The Complete PDF Toolkit</h2>
            <p className="text-slate-400">117+ free browser-based tools for all your PDF needs</p>
          </div>

          {/* Search */}
          <div className="max-w-lg mx-auto mb-6">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g., Merge, Convert, Compress...)"
                className="w-full pl-11 pr-5 py-3.5 bg-[#1e293b] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Category Tabs */}
          {!searchQuery && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
              {TOOL_CATEGORIES.map(cat => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-[#1e293b] text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'}`}
                  >
                    <Icon size={14} />
                    {cat.name}
                    <span className="text-xs opacity-70">({getToolsByCategory(cat.id).length})</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Tools Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredTools.map((tool, i) => {
              const Icon = tool.icon
              return (
                <a
                  key={i}
                  href={tool.href}
                  className="group bg-[#1e293b] border border-slate-700 rounded-xl p-3 flex flex-col items-center gap-2 hover:border-blue-500/50 hover:bg-[#273548] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: tool.color + '20' }}
                  >
                    <Icon size={20} style={{ color: tool.color }} />
                  </div>
                  <div className="text-center">
                    <div className="text-white text-sm font-semibold group-hover:text-blue-400 transition-colors">{tool.name}</div>
                    <div className="text-slate-500 text-[10px] mt-0.5">{tool.desc}</div>
                  </div>
                  {tool.popular && (
                    <span className="flex items-center gap-1 text-[9px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded-full">
                      <TrendingUp size={9} /> Popular
                    </span>
                  )}
                </a>
              )
            })}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-12 text-slate-500">No tools found matching &ldquo;{searchQuery}&rdquo;</div>
          )}
        </section>

        {/* Blog Section */}
        {latestBlogs.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-extrabold mb-2">Latest from Our Blog</h2>
                <p className="text-slate-400">Tips, tutorials, and guides for PDF tools</p>
              </div>
              <Link href="/blog" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all text-sm hidden sm:inline-flex items-center gap-2">
                View All Posts <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
                >
                  <div className="h-44 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center overflow-hidden">
                    {blog.cover_image ? (
                      <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">{blog.category}</span>
                      <span className="flex items-center gap-1 text-slate-300 text-xs">
                        <Calendar size={10} className="text-blue-400" />
                        {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1 text-slate-300 text-xs">
                        <Eye size={10} className="text-purple-400" />
                        {blog.views_count >= 1000 ? `${(blog.views_count / 1000).toFixed(1)}k` : blog.views_count} views
                      </span>
                    </div>
                    <h3 className="text-white font-bold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">{blog.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">{blog.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link href="/blog" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all text-sm inline-flex items-center gap-2">
                View All Blog Posts <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#070d19] border-t border-slate-800 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <span className="text-lg font-bold">4uPDF<span className="text-blue-500">-all</span></span>
              </div>
              <p className="text-slate-500 text-sm">Free online PDF tools that work entirely in your browser. 117+ tools for all your PDF needs. No upload, 100% private.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Popular Tools</h4>
              <div className="space-y-2">
                <a href="/tools/merge" className="block text-slate-500 hover:text-blue-400 text-sm transition-colors">Merge PDF</a>
                <a href="/tools/split" className="block text-slate-500 hover:text-blue-400 text-sm transition-colors">Split PDF</a>
                <a href="/tools/compress" className="block text-slate-500 hover:text-blue-400 text-sm transition-colors">Compress PDF</a>
                <a href="/tools/pdf-to-word" className="block text-slate-500 hover:text-blue-400 text-sm transition-colors">PDF to Word</a>
                <a href="/tools/sign" className="block text-slate-500 hover:text-blue-400 text-sm transition-colors">Sign PDF</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Convert Tools</h4>
              <div className="space-y-2">
                <a href="/tools/word-to-pdf" className="block text-slate-500 hover:text-blue-400 text-sm transition-colors">Word to PDF</a>
                <a href="/tools/excel-to-pdf" className="block text-slate-500 hover:text-blue-400 text-sm transition-colors">Excel to PDF</a>
                <a href="/tools/image-to-pdf" className="block text-slate-500 hover:text-blue-400 text-sm transition-colors">Image to PDF</a>
                <a href="/tools/ppt-to-pdf" className="block text-slate-500 hover:text-blue-400 text-sm transition-colors">PPT to PDF</a>
                <a href="/tools/url-to-pdf" className="block text-slate-500 hover:text-blue-400 text-sm transition-colors">URL to PDF</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <div className="space-y-2">
                <Link href="/blog" className="block text-slate-500 hover:text-blue-400 text-sm transition-colors">Blog</Link>
                <a href="#tools" className="block text-slate-500 hover:text-blue-400 text-sm transition-colors">All Tools</a>
                <a href="#features" className="block text-slate-500 hover:text-blue-400 text-sm transition-colors">Features</a>
              </div>
            </div>
          </div>
          <div className="text-center text-slate-600 text-sm pt-6 border-t border-slate-800">
            &copy; 2024 4uPDF-all. All rights reserved. Free Online PDF Tools.
          </div>
        </div>
      </footer>
    </div>
  )
}
