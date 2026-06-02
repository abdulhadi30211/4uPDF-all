import { BlogListClient } from './BlogListClient'
import type { Metadata } from 'next'

const SITE_URL = 'https://4updf-all.vercel.app'

export const metadata: Metadata = {
  title: 'Blog - PDF Tips, Tutorials & Guides | 4uPDF',
  description: 'Expert tips, tutorials, and guides on PDF tools. Learn how to merge, split, convert, compress, edit, and secure your PDF files with 4uPDF free online tools.',
  keywords: 'pdf blog, pdf tips, pdf tutorials, pdf guides, pdf tools blog, merge pdf tutorial, split pdf guide, compress pdf tips, pdf converter guide, pdf editor tips',
  openGraph: {
    title: 'Blog - PDF Tips, Tutorials & Guides | 4uPDF',
    description: 'Expert tips, tutorials, and guides on PDF tools. Learn how to merge, split, convert, compress, edit, and secure your PDF files.',
    url: `${SITE_URL}/blog`,
    siteName: '4uPDF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - PDF Tips, Tutorials & Guides | 4uPDF',
    description: 'Expert tips, tutorials, and guides on PDF tools.',
  },
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
}

export default function BlogPage() {
  return <BlogListClient />
}
