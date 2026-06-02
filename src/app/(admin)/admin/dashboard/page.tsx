import { getAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import AdminDashboardClient from './AdminDashboardClient'
import AdminLayout from '@/components/admin/AdminLayout'

export const metadata = {
  title: 'Admin Dashboard - 4uPDF',
  robots: 'noindex, nofollow'
}

export default async function AdminDashboardPage() {
  const session = await getAdminSession()
  if (!session) {
    redirect('/admin/login')
  }

  // Fetch comprehensive stats
  const [
    publishedRes,
    draftRes,
    allPostsRes,
    topPostsRes,
    recentPostsRes,
    allForCategoriesRes
  ] = await Promise.all([
    supabaseAdmin.from('blog_posts').select('id', { count: 'exact', head: true }).eq('is_published', true),
    supabaseAdmin.from('blog_posts').select('id', { count: 'exact', head: true }).eq('is_published', false),
    supabaseAdmin.from('blog_posts').select('views_count'),
    supabaseAdmin.from('blog_posts').select('id, title, slug, views_count, category, is_published, created_at').order('views_count', { ascending: false }).limit(5),
    supabaseAdmin.from('blog_posts').select('id, title, slug, views_count, category, is_published, created_at').order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('blog_posts').select('category, tags')
  ])

  const publishedCount = publishedRes.count || 0
  const draftCount = draftRes.count || 0
  const totalViews = (allPostsRes.data || []).reduce((sum: number, b: { views_count: number }) => sum + (b.views_count || 0), 0)

  // Category counts
  const categoryMap = new Map<string, number>()
  const tagSet = new Set<string>()
  for (const post of allForCategoriesRes.data || []) {
    const cat = (post as { category: string; tags: string[] }).category || 'Uncategorized'
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
    const tags = (post as { category: string; tags: string[] }).tags || []
    for (const tag of tags) {
      tagSet.add(tag)
    }
  }
  const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }))
  const totalTags = tagSet.size

  const stats = {
    published: publishedCount,
    drafts: draftCount,
    totalViews,
    topPosts: topPostsRes.data || [],
    recentPosts: recentPostsRes.data || [],
    categories,
    totalTags
  }

  return (
    <AdminLayout>
      <AdminDashboardClient session={session} stats={stats} />
    </AdminLayout>
  )
}
