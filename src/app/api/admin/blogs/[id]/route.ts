import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminSession } from '@/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json({ blog: data })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.content !== undefined) updateData.content = body.content
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt
    if (body.cover_image !== undefined) updateData.cover_image = body.cover_image
    if (body.category !== undefined) updateData.category = body.category
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.is_published !== undefined) updateData.is_published = body.is_published
    if (body.meta_title !== undefined) updateData.meta_title = body.meta_title
    if (body.meta_description !== undefined) updateData.meta_description = body.meta_description
    if (body.focus_keyword !== undefined) updateData.focus_keyword = body.focus_keyword
    if (body.structured_data !== undefined) updateData.structured_data = body.structured_data
    if (body.schema_markup !== undefined) updateData.schema_markup = body.schema_markup

    let data, error
    const result = await supabaseAdmin
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    data = result.data
    error = result.error

    // If error is about missing columns, retry without the new columns
    if (error && error.message && error.message.includes('column')) {
      delete updateData.focus_keyword
      delete updateData.structured_data
      delete updateData.schema_markup
      const retryResult = await supabaseAdmin
        .from('blog_posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      data = retryResult.data
      error = retryResult.error
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ blog: data })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { error } = await supabaseAdmin
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
