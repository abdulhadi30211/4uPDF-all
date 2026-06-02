import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import BlogDetailClient from './BlogDetailClient'

const SITE_URL = 'https://4updf-all.vercel.app'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data: blog } = await supabaseAdmin
    .from('blog_posts')
    .select('title, meta_title, meta_description, excerpt, category, cover_image, created_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!blog) return { title: 'Blog Post Not Found - 4uPDF' }

  const title = blog.meta_title || `${blog.title} | 4uPDF Blog`
  const description = blog.meta_description || blog.excerpt
  const url = `${SITE_URL}/blog/${slug}`

  return {
    title,
    description,
    keywords: [blog.category, 'pdf tools', 'pdf tips', '4updf blog', blog.title.toLowerCase()],
    openGraph: {
      title,
      description,
      url,
      siteName: '4uPDF',
      type: 'article',
      publishedTime: blog.created_at,
      images: blog.cover_image ? [{ url: blog.cover_image, width: 1200, height: 630, alt: blog.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: blog.cover_image ? [blog.cover_image] : [],
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: blog } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!blog) {
    notFound()
  }

  // Increment views count (server-side, non-blocking)
  supabaseAdmin
    .from('blog_posts')
    .update({ views_count: (blog.views_count || 0) + 1 })
    .eq('id', blog.id)
    .then(() => {}) // fire-and-forget

  // Get related posts
  const { data: relatedPosts } = await supabaseAdmin
    .from('blog_posts')
    .select('id,title,slug,excerpt,category,cover_image,created_at')
    .eq('is_published', true)
    .eq('category', blog.category)
    .neq('id', blog.id)
    .limit(3)

  return <BlogDetailClient blog={blog} relatedPosts={relatedPosts || []} />
}
