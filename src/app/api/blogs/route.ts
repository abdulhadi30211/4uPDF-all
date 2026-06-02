import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabaseAdmin
    .from('blog_posts')
    .select('id,title,slug,excerpt,cover_image,category,tags,is_published,meta_title,meta_description,views_count,created_at,updated_at', { count: 'exact' })
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (category) {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,category.ilike.%${search}%,tags.cs.{${search}}`)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get unique categories
  const { data: categories } = await supabaseAdmin
    .from('blog_posts')
    .select('category')
    .eq('is_published', true)

  const uniqueCategories = [...new Set((categories || []).map(c => c.category))]

  return NextResponse.json({
    blogs: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
    categories: uniqueCategories
  })
}
