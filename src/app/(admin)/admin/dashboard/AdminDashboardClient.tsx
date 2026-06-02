'use client'

import Link from 'next/link'
import {
  FileCheck,
  FilePen,
  Eye,
  BarChart3,
  Tags,
  Layers,
  PlusCircle,
  FileText,
  Search,
  ExternalLink,
  ArrowUpRight
} from 'lucide-react'

interface AdminSession {
  email: string
  name: string
  role: string
}

interface BlogStat {
  id: string
  title: string
  slug: string
  views_count: number
  category: string
  is_published: boolean
  created_at: string
}

interface Stats {
  published: number
  drafts: number
  totalViews: number
  topPosts: BlogStat[]
  recentPosts: BlogStat[]
  categories: { name: string; count: number }[]
  totalTags: number
}

export default function AdminDashboardClient({ session, stats }: { session: AdminSession; stats: Stats }) {
  const avgViews = stats.published > 0 ? Math.round(stats.totalViews / (stats.published + stats.drafts)) : 0
  const maxCategoryCount = Math.max(...stats.categories.map(c => c.count), 1)

  const statCards = [
    { label: 'Published Posts', value: stats.published, icon: FileCheck, color: 'text-green-400', bgColor: 'bg-green-500/20' },
    { label: 'Draft Posts', value: stats.drafts, icon: FilePen, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    { label: 'Avg Views/Post', value: avgViews.toLocaleString(), icon: BarChart3, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
    { label: 'Categories Used', value: stats.categories.length, icon: Layers, color: 'text-teal-400', bgColor: 'bg-teal-500/20' },
    { label: 'Total Tags', value: stats.totalTags, icon: Tags, color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  ]

  const quickActions = [
    { label: 'New Blog Post', desc: 'Create a new post', href: '/admin/blogs/new', icon: PlusCircle, color: 'text-green-400', bgColor: 'bg-green-500/20' },
    { label: 'Manage Blogs', desc: 'View all posts', href: '/admin/blogs', icon: FileText, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
    { label: 'SEO Settings', desc: 'Optimize your site', href: '/admin/seo', icon: Search, color: 'text-teal-400', bgColor: 'bg-teal-500/20' },
    { label: 'View Blog', desc: 'Public blog page', href: '/blog', icon: ExternalLink, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Welcome back, {session.name || session.email}</p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          New Blog Post
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4 hover:border-slate-600 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${card.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-slate-400 text-xs mt-1">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Viewed Posts */}
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Top Viewed Posts</h2>
            <Eye className="w-5 h-5 text-slate-500" />
          </div>
          {stats.topPosts.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No posts yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topPosts.map((post, idx) => (
                <div key={post.id} className="flex items-center gap-3 p-3 bg-[#0f172a] rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    idx === 1 ? 'bg-slate-400/20 text-slate-300' :
                    idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-slate-700/50 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link href={`/admin/blogs/${post.id}/edit`} className="text-white text-sm font-medium hover:text-blue-400 transition-colors truncate block">
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-slate-500 text-xs">{post.category}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-500 text-xs">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-blue-400 flex-shrink-0">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-sm font-medium">{post.views_count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Posts */}
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Posts</h2>
            <FileText className="w-5 h-5 text-slate-500" />
          </div>
          {stats.recentPosts.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No posts yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentPosts.map((post) => (
                <div key={post.id} className="flex items-center gap-3 p-3 bg-[#0f172a] rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all">
                  <div className="flex-1 min-w-0">
                    <Link href={`/admin/blogs/${post.id}/edit`} className="text-white text-sm font-medium hover:text-blue-400 transition-colors truncate block">
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        post.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {post.is_published ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-slate-500 text-xs">{post.category}</span>
                    </div>
                  </div>
                  <span className="text-slate-500 text-xs flex-shrink-0">{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions + Content Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-4 bg-[#0f172a] rounded-xl border border-slate-700 hover:border-blue-500 transition-all group"
                >
                  <div className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm">{action.label}</p>
                    <p className="text-slate-500 text-xs">{action.desc}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors ml-auto flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Content Overview - Posts per Category */}
        <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Content Overview</h2>
            <BarChart3 className="w-5 h-5 text-slate-500" />
          </div>
          {stats.categories.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No categories yet</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {stats.categories
                .sort((a, b) => b.count - a.count)
                .map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 text-sm truncate mr-3">{cat.name}</span>
                    <span className="text-slate-400 text-xs flex-shrink-0">{cat.count} post{cat.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, (cat.count / maxCategoryCount) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
