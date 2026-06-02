import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminSession } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabaseAdmin
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status === 'published') {
    query = query.eq('is_published', true)
  } else if (status === 'draft') {
    query = query.eq('is_published', false)
  }

  if (category) {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,category.ilike.%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    blogs: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  })
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, slug, content, excerpt, cover_image, category, tags, is_published, meta_title, meta_description, focus_keyword, structured_data, schema_markup } = body

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      )
    }

    const insertData: Record<string, unknown> = {
      title,
      slug,
      content,
      excerpt: excerpt || title,
      cover_image: cover_image || null,
      category: category || 'General',
      tags: tags || [],
      is_published: is_published || false,
      author_id: 'e8fc3d1d-1d09-493c-b4f1-30eaaed509de',
      meta_title: meta_title || title,
      meta_description: meta_description || excerpt || title,
      views_count: 0
    }

    // These columns may not exist yet - try to add them
    // If they fail, the insert still succeeds without them
    if (focus_keyword) insertData.focus_keyword = focus_keyword
    if (structured_data) insertData.structured_data = structured_data
    if (schema_markup) insertData.schema_markup = schema_markup

    let data, error
    const result = await supabaseAdmin
      .from('blog_posts')
      .insert(insertData)
      .select()
      .single()
    data = result.data
    error = result.error

    // If error is about missing columns, retry without the new columns
    if (error && error.message && error.message.includes('column')) {
      delete insertData.focus_keyword
      delete insertData.structured_data
      delete insertData.schema_markup
      const retryResult = await supabaseAdmin
        .from('blog_posts')
        .insert(insertData)
        .select()
        .single()
      data = retryResult.data
      error = retryResult.error
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ blog: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
