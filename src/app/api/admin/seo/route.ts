import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminSession } from '@/lib/admin-auth'

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Try to fetch SEO settings - gracefully handle if table doesn't exist
    const { data: settings, error } = await supabaseAdmin
      .from('seo_settings')
      .select('*')

    if (error) {
      // Table might not exist yet - return empty defaults
      return NextResponse.json({
        settings: [],
        robotsTxt: null,
        schemaMarkup: null
      })
    }

    // Extract special values
    const robotsSetting = (settings || []).find((s: { key: string }) => s.key === 'robots_txt')
    const schemaSetting = (settings || []).find((s: { key: string }) => s.key === 'schema_markup')
    const filteredSettings = (settings || []).filter(
      (s: { key: string }) => s.key !== 'robots_txt' && s.key !== 'schema_markup'
    )

    return NextResponse.json({
      settings: filteredSettings,
      robotsTxt: robotsSetting?.value || null,
      schemaMarkup: schemaSetting?.value || null
    })
  } catch {
    return NextResponse.json({
      settings: [],
      robotsTxt: null,
      schemaMarkup: null
    })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const now = new Date().toISOString()

    // Helper to upsert a setting
    const upsertSetting = async (key: string, value: string) => {
      // Try to update first
      const { error: updateError } = await supabaseAdmin
        .from('seo_settings')
        .update({ value, updated_at: now })
        .eq('key', key)

      if (updateError) {
        // Might not exist, try insert
        const { error: insertError } = await supabaseAdmin
          .from('seo_settings')
          .insert({ key, value, updated_at: now })

        if (insertError) {
          console.error(`Failed to upsert setting ${key}:`, insertError)
        }
      }
    }

    // Save settings object
    if (body.settings && typeof body.settings === 'object') {
      for (const [key, value] of Object.entries(body.settings)) {
        if (typeof value === 'string') {
          await upsertSetting(key, value)
        }
      }
    }

    // Save robots.txt
    if (body.robotsTxt) {
      await upsertSetting('robots_txt', body.robotsTxt)
    }

    // Save schema markup
    if (body.schemaMarkup) {
      await upsertSetting('schema_markup', body.schemaMarkup)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
