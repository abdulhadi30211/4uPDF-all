'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Calendar, Eye, ArrowRight, Tag } from 'lucide-react'
import Header from '@/components/shared/Header'

interface BlogListItem {
  id: string
  title: string
  slug: string
  excerpt: string
  cover_image: string | null
  category: string
  tags: string[]
  created_at: string
  views_count: number
}

export function BlogListClient() {
  const [blogs, setBlogs] = useState<BlogListItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchBlogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '12' })
      if (activeCategory) params.set('category', activeCategory)
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/blogs?${params}`)
      const data = await res.json()
      if (res.ok) {
        setBlogs(data.blogs || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
        if (data.categories) setCategories(data.categories)
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err)
    }
    setLoading(false)
  }, [page, activeCategory, searchQuery])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchBlogs()
  }

  // Format views count for display
  const formatViews = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
    return count.toString()
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Header currentPath="/blog" />

      {/* Hero */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            PDF Tips, Tutorials & <span className="text-blue-500">Guides</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
            Expert advice on PDF tools. Learn how to merge, split, convert, compress, edit, and secure your PDF files with our free online tools.
          </p>
          <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-10 pr-5 py-3 bg-[#1e293b] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setActiveCategory(''); setPage(1) }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!activeCategory ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'}`}
            >
              All Posts ({total})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPage(1) }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="text-slate-400 mt-4">Loading articles...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No articles found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="group bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
              >
                <div className="h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center overflow-hidden">
                  {blog.cover_image ? (
                    <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">{blog.category}</span>
                    <span className="flex items-center gap-1 text-slate-300 text-xs">
                      <Calendar size={10} className="text-blue-400" />
                      {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1 text-slate-300 text-xs">
                      <Eye size={10} className="text-purple-400" />
                      {formatViews(blog.views_count)}
                    </span>
                  </div>
                  <h2 className="text-white font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {blog.title}
                  </h2>
                  <p className="text-slate-400 text-sm line-clamp-3">{blog.excerpt}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {blog.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-xs border border-slate-700">
                        <Tag size={8} className="text-blue-400" />{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-3 bg-[#1e293b] border border-slate-700 rounded-xl text-white disabled:opacity-50 hover:border-blue-500 transition-all"
            >
              Previous
            </button>
            <span className="text-slate-300 px-4">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-6 py-3 bg-[#1e293b] border border-slate-700 rounded-xl text-white disabled:opacity-50 hover:border-blue-500 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-[#070d19] border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} 4uPDF. All rights reserved. Free Online PDF Tools.</p>
        </div>
      </footer>
    </div>
  )
}
