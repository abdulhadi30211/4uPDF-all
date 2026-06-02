'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Eye,
  Edit3,
  Trash2,
  ExternalLink,
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  CheckSquare,
  Square,
  Trash,
  FileText,
  MoreVertical,
  Globe,
  FilePen
} from 'lucide-react'

interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  tags: string[]
  is_published: boolean
  views_count: number
  created_at: string
  updated_at: string
}

type SortOption = 'date_desc' | 'date_asc' | 'views_desc' | 'views_asc' | 'title_asc' | 'title_desc'

const CATEGORIES = [
  'PDF Merge & Split',
  'PDF Convert',
  'PDF Edit',
  'PDF Compress',
  'PDF Security',
  'PDF Organize',
  'PDF OCR & Scan',
  'PDF Watermark',
  'PDF Sign & Forms',
  'PDF Optimization',
  'PDF Tools Comparison',
  'PDF Tips & Tricks',
  'PDF for Business',
  'PDF for Education',
  'General'
]

export default function AdminBlogsClient() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('date_desc')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const refresh = () => setRefreshKey(k => k + 1)

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    let cancelled = false

    const params = new URLSearchParams({ page: page.toString(), limit: '20' })
    if (statusFilter) params.set('status', statusFilter)
    if (categoryFilter) params.set('category', categoryFilter)
    if (searchQuery) params.set('search', searchQuery)

    fetch(`/api/admin/blogs?${params}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setBlogs(data.blogs || [])
          setTotal(data.total || 0)
          setTotalPages(data.totalPages || 1)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('Failed to fetch blogs:', err)
          setLoading(false)
        }
      })

    return () => { cancelled = true; controller.abort() }
  }, [page, statusFilter, categoryFilter, searchQuery, refreshKey])

  // Sort blogs client-side
  const sortedBlogs = [...blogs].sort((a, b) => {
    switch (sortBy) {
      case 'date_desc': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'date_asc': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'views_desc': return b.views_count - a.views_count
      case 'views_asc': return a.views_count - b.views_count
      case 'title_asc': return a.title.localeCompare(b.title)
      case 'title_desc': return b.title.localeCompare(a.title)
      default: return 0
    }
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' })
      if (res.ok) {
        refresh()
        setSelected(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    } catch (err) {
      console.error('Failed to delete blog:', err)
    }
    setDeleting(null)
  }

  const togglePublish = async (blog: Blog) => {
    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !blog.is_published })
      })
      if (res.ok) {
        refresh()
      }
    } catch (err) {
      console.error('Failed to toggle publish:', err)
    }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === blogs.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(blogs.map(b => b.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selected.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selected.size} post(s)?`)) return
    setBulkDeleting(true)
    try {
      await Promise.all(
        Array.from(selected).map(id => fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' }))
      )
      setSelected(new Set())
      refresh()
    } catch (err) {
      console.error('Failed to bulk delete:', err)
    }
    setBulkDeleting(false)
  }

  const sortLabels: Record<SortOption, string> = {
    date_desc: 'Newest First',
    date_asc: 'Oldest First',
    views_desc: 'Most Views',
    views_asc: 'Least Views',
    title_asc: 'Title A-Z',
    title_desc: 'Title Z-A',
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
          <p className="text-slate-400 text-sm mt-1">
            {total} total post{total !== 1 ? 's' : ''}
            {selected.size > 0 && <span className="text-blue-400 ml-2">({selected.size} selected)</span>}
          </p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
              className="px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white text-sm hover:border-slate-500 transition-all"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
              </button>
              {showSortDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-[#1e293b] border border-slate-700 rounded-xl shadow-xl z-20 py-1 min-w-[180px]">
                    {(Object.keys(sortLabels) as SortOption[]).map(key => (
                      <button
                        key={key}
                        onClick={() => { setSortBy(key); setShowSortDropdown(false) }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-700 transition-colors ${
                          sortBy === key ? 'text-blue-400 bg-blue-500/10' : 'text-slate-300'
                        }`}
                      >
                        {sortLabels[key]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selected.size > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              {selected.size === blogs.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              Select All
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {bulkDeleting ? 'Deleting...' : `Delete Selected (${selected.size})`}
            </button>
          </div>
        )}
      </div>

      {/* Blog List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-slate-400 mt-4">Loading blogs...</p>
        </div>
      ) : sortedBlogs.length === 0 ? (
        <div className="text-center py-20 bg-[#1e293b] rounded-2xl border border-slate-700">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No blog posts found.</p>
          <Link href="/admin/blogs/new" className="text-blue-500 hover:text-blue-400 mt-2 inline-block">Create your first blog post</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select All Checkbox Row */}
          <div className="flex items-center gap-3 px-4 py-2">
            <button onClick={toggleSelectAll} className="text-slate-500 hover:text-white transition-colors">
              {selected.size === blogs.length && blogs.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </button>
            <span className="text-slate-500 text-xs">
              {total} result{total !== 1 ? 's' : ''} · Page {page} of {totalPages}
            </span>
          </div>

          {sortedBlogs.map((blog) => (
            <div key={blog.id} className={`bg-[#1e293b] border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              selected.has(blog.id) ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 hover:border-slate-600'
            }`}>
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button onClick={() => toggleSelect(blog.id)} className="mt-1 text-slate-500 hover:text-white transition-colors flex-shrink-0">
                  {selected.has(blog.id) ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Link href={`/admin/blogs/${blog.id}/edit`} className="text-white font-semibold hover:text-blue-400 transition-colors truncate">
                      {blog.title}
                    </Link>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      blog.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {blog.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 flex-wrap">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">{blog.category}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {blog.views_count.toLocaleString()}
                    </span>
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-7 sm:ml-0">
                <button
                  onClick={() => togglePublish(blog)}
                  className={`p-2 rounded-lg transition-all ${
                    blog.is_published
                      ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                      : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  }`}
                  title={blog.is_published ? 'Unpublish' : 'Publish'}
                >
                  {blog.is_published ? <FilePen className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                </button>
                <Link
                  href={`/admin/blogs/${blog.id}/edit`}
                  className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>
                {blog.is_published && (
                  <a
                    href={`/blog/${blog.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white rounded-lg transition-all"
                    title="View post"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <div className="relative">
                  <button
                    onClick={() => setShowActionMenu(showActionMenu === blog.id ? null : blog.id)}
                    className="p-2 bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white rounded-lg transition-all"
                    title="More actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showActionMenu === blog.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowActionMenu(null)} />
                      <div className="absolute right-0 top-full mt-1 bg-[#1e293b] border border-slate-700 rounded-xl shadow-xl z-20 py-1 min-w-[140px]">
                        <button
                          onClick={() => { handleDelete(blog.id); setShowActionMenu(null) }}
                          disabled={deleting === blog.id}
                          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          {deleting === blog.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-white disabled:opacity-50 hover:border-blue-500 transition-all text-sm"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-slate-600 px-1">...</span>}
                  <button
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      page === p
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#1e293b] border border-slate-700 text-slate-400 hover:text-white hover:border-blue-500'
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-white disabled:opacity-50 hover:border-blue-500 transition-all text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
