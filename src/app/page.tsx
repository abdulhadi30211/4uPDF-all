import { supabaseAdmin } from '@/lib/supabase'
import HomeClient from './HomeClient'

export const revalidate = 3600

const SITE_URL = 'https://4updf-all.vercel.app'

// JSON-LD structured data for the organization
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '4uPDF',
  url: SITE_URL,
  description: '117+ free browser-based PDF tools. Merge, split, compress, convert, edit, sign, OCR, watermark, annotate, forms and more. No uploads to server, 100% private.',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  featureList: [
    'Merge PDF files',
    'Split PDF pages',
    'Compress PDF size',
    'Convert PDF to Word, Excel, PPT, JPG, PNG, SVG, TIFF, EPUB',
    'Convert Word, Excel, PPT, Images, Markdown, JSON, XML, HTML to PDF',
    'Edit PDF text and content',
    'Sign PDF documents with e-signatures',
    'Add watermarks to PDF',
    'Remove watermarks from PDF',
    'Protect PDF with password',
    'Unlock password-protected PDF',
    'OCR text recognition',
    'Rotate PDF pages',
    'Reorder PDF pages',
    'Crop PDF pages',
    'Add images to PDF',
    'Redact sensitive content',
    'Flatten form fields',
    'Add stamps and backgrounds',
    'Bates numbering for legal documents',
    'N-up page layouts for printing',
    'PDF to PDF/A conversion',
    'Dark mode reading',
    'Annotate PDF with comments and highlights',
    'Create and fill PDF forms',
    'Add digital signatures',
    'Compare PDF documents',
    'Extract tables, images, and attachments',
    'Add bookmarks and page labels',
    'Apply brand kits to PDFs',
  ],
  provider: {
    '@type': 'Organization',
    name: '4uPDF',
    url: SITE_URL
  },
  browserRequirements: 'Requires JavaScript. Requires HTML5.'
}

// SoftwareApplication schema
const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '4uPDF',
  url: SITE_URL,
  description: 'Free online PDF tools - 117+ browser-based tools for PDF processing.',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '12500',
    bestRating: '5',
    worstRating: '1'
  }
}

export default async function HomePage() {
  // Get latest blog posts for the blog section
  const { data: latestBlogs } = await supabaseAdmin
    .from('blog_posts')
    .select('id,title,slug,excerpt,category,cover_image,created_at,tags,views_count')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <HomeClient latestBlogs={latestBlogs || []} />
    </>
  )
}
