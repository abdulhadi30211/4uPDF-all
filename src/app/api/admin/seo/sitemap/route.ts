import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminSession } from '@/lib/admin-auth'

export async function POST() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const SITE_URL = 'https://pdf100-tools.vercel.app'

    // Fetch all published blog posts
    const { data: posts } = await supabaseAdmin
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true)

    // Build sitemap XML
    const urls: string[] = []

    // Homepage
    urls.push(`  <url>
    <loc>${SITE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`)

    // Blog listing
    urls.push(`  <url>
    <loc>${SITE_URL}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`)

    // Blog posts
    for (const post of posts || []) {
      const lastmod = post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      urls.push(`  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
    }

    // Common PDF tool pages
    const toolPages = [
      'merge', 'split', 'compress', 'pdf-to-word', 'pdf-to-excel',
      'pdf-to-jpg', 'pdf-to-png', 'pdf-to-html', 'word-to-pdf',
      'excel-to-pdf', 'jpg-to-pdf', 'png-to-pdf', 'html-to-pdf',
      'rotate', 'watermark', 'protect', 'unlock', 'sign', 'ocr',
      'edit-text', 'extract', 'organize', 'crop', 'repair'
    ]

    for (const tool of toolPages) {
      urls.push(`  <url>
    <loc>${SITE_URL}/${tool}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`)
    }

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

    const urlCount = 1 + 1 + (posts?.length || 0) + toolPages.length

    return NextResponse.json({
      success: true,
      sitemap: sitemapXml,
      urlCount,
      message: `Sitemap generated with ${urlCount} URLs`
    })
  } catch {
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 })
  }
}
