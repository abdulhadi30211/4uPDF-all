'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Globe,
  FileCode,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Save,
  ExternalLink,
  Eye,
  Tag,
  Image as ImageIcon,
  FileText
} from 'lucide-react'

interface SeoSetting {
  id?: string
  key: string
  value: string
  updated_at?: string
}

interface BlogSeoItem {
  id: string
  title: string
  slug: string
  meta_title: string
  meta_description: string
  content: string
  tags: string[]
  cover_image: string | null
  category: string
  is_published: boolean
}

type SeoLevel = 'green' | 'yellow' | 'red'

function getSeoIcon(level: SeoLevel) {
  switch (level) {
    case 'green': return <CheckCircle className="w-4 h-4 text-green-400" />
    case 'yellow': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
    case 'red': return <XCircle className="w-4 h-4 text-red-400" />
  }
}

function getMetaTitleLevel(len: number): SeoLevel {
  if (len >= 50 && len <= 60) return 'green'
  if (len >= 30 && len <= 70) return 'yellow'
  return 'red'
}

function getMetaDescLevel(len: number): SeoLevel {
  if (len >= 150 && len <= 160) return 'green'
  if (len >= 100 && len <= 170) return 'yellow'
  return 'red'
}

function getWordCountLevel(words: number): SeoLevel {
  if (words >= 1000) return 'green'
  if (words >= 500) return 'yellow'
  return 'red'
}

function getTagsLevel(count: number): SeoLevel {
  if (count >= 3) return 'green'
  if (count >= 1) return 'yellow'
  return 'red'
}

function calculateSeoScore(post: BlogSeoItem): number {
  let score = 0
  const titleLevel = getMetaTitleLevel(post.meta_title.length)
  const descLevel = getMetaDescLevel(post.meta_description.length)
  const words = post.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length
  const contentLevel = getWordCountLevel(words)
  const tagsLevel = getTagsLevel(post.tags.length)

  const levelToScore = (l: SeoLevel) => l === 'green' ? 25 : l === 'yellow' ? 15 : 5
  score = levelToScore(titleLevel) + levelToScore(descLevel) + levelToScore(contentLevel) + levelToScore(tagsLevel)
  return score
}

export default function SeoClient() {
  const [settings, setSettings] = useState<Record<string, string>>({
    site_title: 'Free Online PDF Tools – Merge, Split, Convert & Edit | 4uPDF',
    site_description: '',
    default_og_image: '',
    google_analytics_id: '',
    google_search_console_tag: '',
  })
  const [robotsTxt, setRobotsTxt] = useState(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://pdf100-tools.vercel.app/sitemap.xml`)
  const [schemaMarkup, setSchemaMarkup] = useState(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "4uPDF",
    "url": "https://pdf100-tools.vercel.app",
    "logo": "https://pdf100-tools.vercel.app/logo.svg",
    "description": "Free Online PDF Tools – Merge, Split, Convert & Edit",
    "sameAs": []
  }, null, 2))
  const [blogs, setBlogs] = useState<BlogSeoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [savingRobots, setSavingRobots] = useState(false)
  const [generatingSitemap, setGeneratingSitemap] = useState(false)
  const [sitemapInfo, setSitemapInfo] = useState<{ urls: number; lastGenerated: string } | null>(null)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch('/api/admin/seo')
      .then(res => res.json())
      .then(data => {
        if (cancelled) return
        if (data.settings && Array.isArray(data.settings)) {
          const map: Record<string, string> = {}
          for (const s of data.settings) {
            map[s.key] = s.value
          }
          setSettings(prev => ({ ...prev, ...map }))
        }
        if (data.robotsTxt) setRobotsTxt(data.robotsTxt)
        if (data.schemaMarkup) setSchemaMarkup(data.schemaMarkup)
        setSettingsLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setSettingsLoaded(true)
      })

    fetch('/api/admin/blogs?limit=100')
      .then(res => res.json())
      .then(data => {
        if (!cancelled) setBlogs(data.blogs || [])
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, schemaMarkup })
      })
    } catch {
      // ignore
    }
    setSavingSettings(false)
  }

  const handleSaveRobots = async () => {
    setSavingRobots(true)
    try {
      await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ robotsTxt })
      })
    } catch {
      // ignore
    }
    setSavingRobots(false)
  }

  const handleGenerateSitemap = async () => {
    setGeneratingSitemap(true)
    try {
      const res = await fetch('/api/admin/seo/sitemap', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setSitemapInfo({
          urls: data.urlCount || 0,
          lastGenerated: new Date().toLocaleString()
        })
      }
    } catch {
      // ignore
    }
    setGeneratingSitemap(false)
  }

  // SEO analysis
  const postsMissingMetaDesc = blogs.filter(b => !b.meta_description || b.meta_description.length < 50)
  const postsShortContent = blogs.filter(b => {
    const words = b.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length
    return words < 300
  })
  const postsNoTags = blogs.filter(b => !b.tags || b.tags.length === 0)
  const postsNoCover = blogs.filter(b => !b.cover_image)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">SEO Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your site&apos;s search engine optimization</p>
      </div>

      {/* Quick SEO Fixes */}
      {(postsMissingMetaDesc.length > 0 || postsShortContent.length > 0 || postsNoTags.length > 0 || postsNoCover.length > 0) && (
        <div className="bg-[#1e293b] border border-yellow-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">Quick SEO Fixes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {postsMissingMetaDesc.length > 0 && (
              <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-700/50">
                <p className="text-yellow-400 text-sm font-medium mb-2">{postsMissingMetaDesc.length} posts missing meta descriptions</p>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {postsMissingMetaDesc.slice(0, 5).map(p => (
                    <Link key={p.id} href={`/admin/blogs/${p.id}/edit`} className="text-slate-400 text-xs hover:text-blue-400 block truncate">{p.title}</Link>
                  ))}
                </div>
              </div>
            )}
            {postsShortContent.length > 0 && (
              <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-700/50">
                <p className="text-red-400 text-sm font-medium mb-2">{postsShortContent.length} posts with short content</p>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {postsShortContent.slice(0, 5).map(p => (
                    <Link key={p.id} href={`/admin/blogs/${p.id}/edit`} className="text-slate-400 text-xs hover:text-blue-400 block truncate">{p.title}</Link>
                  ))}
                </div>
              </div>
            )}
            {postsNoTags.length > 0 && (
              <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-700/50">
                <p className="text-yellow-400 text-sm font-medium mb-2">{postsNoTags.length} posts with no tags</p>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {postsNoTags.slice(0, 5).map(p => (
                    <Link key={p.id} href={`/admin/blogs/${p.id}/edit`} className="text-slate-400 text-xs hover:text-blue-400 block truncate">{p.title}</Link>
                  ))}
                </div>
              </div>
            )}
            {postsNoCover.length > 0 && (
              <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-700/50">
                <p className="text-orange-400 text-sm font-medium mb-2">{postsNoCover.length} posts with no cover image</p>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {postsNoCover.slice(0, 5).map(p => (
                    <Link key={p.id} href={`/admin/blogs/${p.id}/edit`} className="text-slate-400 text-xs hover:text-blue-400 block truncate">{p.title}</Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Two Column: Global SEO + Sitemap/Robots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global SEO Settings */}
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Global SEO Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Site Title</label>
              <input
                type="text"
                value={settings.site_title || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, site_title: e.target.value }))}
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Site Description</label>
              <textarea
                value={settings.site_description || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, site_description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Default OG Image URL</label>
              <input
                type="text"
                value={settings.default_og_image || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, default_og_image: e.target.value }))}
                className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                placeholder="https://pdf100-tools.vercel.app/og-image.jpg"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Google Analytics ID</label>
                <input
                  type="text"
                  value={settings.google_analytics_id || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, google_analytics_id: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Search Console Tag</label>
                <input
                  type="text"
                  value={settings.google_search_console_tag || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, google_search_console_tag: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="Verification tag"
                />
              </div>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Sitemap & Robots.txt */}
        <div className="space-y-6">
          {/* Sitemap */}
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-semibold text-white">Sitemap</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">Generate an XML sitemap for search engines.</p>
            {sitemapInfo && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-green-400 text-sm">
                  <strong>{sitemapInfo.urls}</strong> URLs · Last generated: {sitemapInfo.lastGenerated}
                </p>
              </div>
            )}
            <button
              onClick={handleGenerateSitemap}
              disabled={generatingSitemap}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${generatingSitemap ? 'animate-spin' : ''}`} />
              {generatingSitemap ? 'Generating...' : 'Generate Sitemap'}
            </button>
          </div>

          {/* Robots.txt */}
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileCode className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Robots.txt</h2>
            </div>
            <textarea
              value={robotsTxt}
              onChange={(e) => setRobotsTxt(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 bg-[#0f172a] border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono text-sm resize-y mb-3"
            />
            <button
              onClick={handleSaveRobots}
              disabled={savingRobots}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingRobots ? 'Saving...' : 'Save Robots.txt'}
            </button>
          </div>
        </div>
      </div>

      {/* Schema Markup */}
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileCode className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-semibold text-white">Schema Markup (JSON-LD)</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Organization Schema</label>
            <textarea
              value={schemaMarkup}
              onChange={(e) => setSchemaMarkup(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 bg-[#0f172a] border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono text-xs resize-y"
            />
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 mt-3"
            >
              <Save className="w-4 h-4" />
              {savingSettings ? 'Saving...' : 'Save Schema'}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Schema Preview</label>
            <div className="p-4 bg-[#0f172a] border border-slate-600 rounded-xl">
              <pre className="text-green-400 text-xs overflow-auto max-h-80 whitespace-pre-wrap">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(schemaMarkup), null, 2)
                  } catch {
                    return 'Invalid JSON'
                  }
                })()}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Blog SEO Overview */}
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Blog SEO Overview</h2>
          </div>
          <span className="text-slate-500 text-sm">{blogs.length} posts</span>
        </div>

        {blogs.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No blog posts yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Title</th>
                  <th className="text-center py-3 px-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Meta Title</th>
                  <th className="text-center py-3 px-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Meta Desc</th>
                  <th className="text-center py-3 px-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Words</th>
                  <th className="text-center py-3 px-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Tags</th>
                  <th className="text-center py-3 px-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {blogs.map(post => {
                  const words = post.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length
                  const titleLevel = getMetaTitleLevel(post.meta_title.length)
                  const descLevel = getMetaDescLevel(post.meta_description.length)
                  const contentLevel = getWordCountLevel(words)
                  const tagsLevel = getTagsLevel(post.tags.length)
                  const score = calculateSeoScore(post)

                  return (
                    <tr key={post.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <Link href={`/admin/blogs/${post.id}/edit`} className="text-white text-sm hover:text-blue-400 transition-colors truncate block max-w-[200px]">
                          {post.title}
                        </Link>
                        <span className={`text-xs ${post.is_published ? 'text-green-400' : 'text-yellow-400'}`}>
                          {post.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getSeoIcon(titleLevel)}
                          <span className="text-slate-400 text-xs">{post.meta_title.length}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getSeoIcon(descLevel)}
                          <span className="text-slate-400 text-xs">{post.meta_description.length}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getSeoIcon(contentLevel)}
                          <span className="text-slate-400 text-xs">{words}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getSeoIcon(tagsLevel)}
                          <span className="text-slate-400 text-xs">{post.tags.length}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                          score >= 80 ? 'bg-green-500/20 text-green-400' :
                          score >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {score}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
