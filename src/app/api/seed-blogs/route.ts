import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminSession } from '@/lib/admin-auth'
import { BLOG_ARTICLES } from '@/lib/blog-seed-data'

export async function POST(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    // Also allow seeding via secret key for initial setup
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    if (secret !== '4updf-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let created = 0
  let skipped = 0
  let errors = 0

  for (const article of BLOG_ARTICLES) {
    // Check if slug already exists
    const { data: existing } = await supabaseAdmin
      .from('blog_posts')
      .select('id')
      .eq('slug', article.slug)
      .single()

    if (existing) {
      skipped++
      continue
    }

    const { error } = await supabaseAdmin
      .from('blog_posts')
      .insert({
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        tags: article.tags,
        is_published: true,
        author_id: 'e8fc3d1d-1d09-493c-b4f1-30eaaed509de',
        meta_title: article.meta_title,
        meta_description: article.meta_description,
        views_count: Math.floor(Math.random() * 500) + 10
      })

    if (error) {
      console.error(`Error creating ${article.slug}:`, error.message)
      errors++
    } else {
      created++
    }
  }

  return NextResponse.json({
    success: true,
    created,
    skipped,
    errors,
    total: BLOG_ARTICLES.length
  })
}
