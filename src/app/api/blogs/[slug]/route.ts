import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
  }

  // Increment views
  await supabaseAdmin
    .from('blog_posts')
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq('id', data.id)

  // Get related posts
  const { data: relatedPosts } = await supabaseAdmin
    .from('blog_posts')
    .select('id,title,slug,excerpt,cover_image,category,created_at')
    .eq('is_published', true)
    .eq('category', data.category)
    .neq('id', data.id)
    .limit(3)

  return NextResponse.json({
    blog: data,
    relatedPosts: relatedPosts || []
  })
}
