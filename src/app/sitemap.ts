import { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { TOOLS } from '@/lib/tools-data'

const BASE_URL = 'https://4updf-all.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  // Tool pages
  const toolPages: MetadataRoute.Sitemap = TOOLS.map(tool => ({
    url: `${BASE_URL}${tool.href}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Blog posts
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const { data: blogs } = await supabaseAdmin
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (blogs) {
      blogPages = blogs.map((blog: { slug: string; updated_at: string }) => ({
        url: `${BASE_URL}/blog/${blog.slug}`,
        lastModified: new Date(blog.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (e) {
    console.error('Sitemap blog fetch error:', e)
  }

  return [...staticPages, ...toolPages, ...blogPages]
}
