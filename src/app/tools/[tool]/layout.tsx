import type { Metadata } from 'next'
import { TOOLS, TOOL_CATEGORIES } from '@/lib/tools-data'

const SITE_URL = 'https://4updf-all.vercel.app'

// Generate static params for all tools
export async function generateStaticParams() {
  return TOOLS.map(tool => ({ tool: tool.href.replace('/tools/', '') }))
}

// Generate metadata for each tool page
export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool: toolId } = await params
  const tool = TOOLS.find(t => t.href === `/tools/${toolId}`)

  if (!tool) {
    return { title: 'Tool Not Found | 4uPDF' }
  }

  const toolCategory = TOOL_CATEGORIES.find(c => c.id === tool.category)
  const categoryName = toolCategory?.name || 'PDF Tools'

  const title = `${tool.name} - Free Online Tool | 4uPDF`
  const description = `${tool.desc}. 100% private, no upload required. Free browser-based ${categoryName.toLowerCase()} tool by 4uPDF. Works on all devices.`
  const url = `${SITE_URL}/tools/${toolId}`

  // Generate rich keywords based on tool properties
  const baseKeywords = [
    tool.name.toLowerCase(),
    `${tool.name.toLowerCase()} online`,
    `${tool.name.toLowerCase()} free`,
    `free ${tool.name.toLowerCase()} tool`,
    `${tool.name.toLowerCase()} no upload`,
    `${tool.name.toLowerCase()} browser`,
    `${tool.name.toLowerCase()} private`,
    `${tool.name.toLowerCase()} no registration`,
    `online ${tool.name.toLowerCase()}`,
    'pdf tools',
    '4updf',
    'free pdf tools online',
    categoryName.toLowerCase(),
  ]

  // Add tool-specific keywords based on category
  if (tool.category === 'convert') {
    baseKeywords.push('pdf converter', 'convert pdf', 'pdf format converter')
  } else if (tool.category === 'organize') {
    baseKeywords.push('pdf organizer', 'pdf page management', 'rearrange pdf')
  } else if (tool.category === 'security') {
    baseKeywords.push('pdf security', 'pdf protection', 'secure pdf')
  } else if (tool.category === 'edit') {
    baseKeywords.push('pdf editor', 'edit pdf online', 'modify pdf')
  } else if (tool.category === 'compress') {
    baseKeywords.push('compress pdf', 'reduce pdf size', 'pdf optimizer')
  } else if (tool.category === 'sign') {
    baseKeywords.push('pdf signature', 'esign pdf', 'digital signature pdf')
  } else if (tool.category === 'watermark') {
    baseKeywords.push('pdf watermark', 'add watermark pdf', 'stamp pdf')
  }

  return {
    title,
    description,
    keywords: baseKeywords,
    openGraph: {
      title,
      description,
      url,
      siteName: '4uPDF',
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
    other: {
      'application-name': '4uPDF',
    },
  }
}

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
