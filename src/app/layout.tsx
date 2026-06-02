import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const SITE_URL = "https://4updf-all.vercel.app";
const SITE_NAME = "4uPDF - Free PDF Tools";
const SITE_DESCRIPTION = "117+ free browser-based PDF tools. Merge, split, compress, convert, edit, sign, OCR, watermark, annotate, forms and more. No uploads to server, 100% private. Works on all devices.";

export const metadata: Metadata = {
  title: {
    default: "Free Online PDF Tools – Merge, Split, Convert & Edit | 4uPDF",
    template: "%s | 4uPDF - Free PDF Tools",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "free pdf tools", "online pdf editor", "merge pdf", "split pdf", "compress pdf",
    "pdf converter", "pdf to word", "word to pdf", "pdf to excel", "pdf to jpg",
    "sign pdf", "edit pdf", "pdf watermark", "protect pdf", "unlock pdf",
    "pdf to image", "image to pdf", "ocr pdf", "4updf", "pdf tools online",
    "pdf merge free", "pdf split free", "pdf compress free", "convert pdf free",
    "pdf editor online", "free pdf converter", "pdf tools no upload", "private pdf tools",
    "pdf to png", "pdf rotate", "pdf crop", "pdf reorder", "add watermark pdf",
    "remove watermark pdf", "pdf stamp", "pdf redact", "pdf flatten", "pdf metadata",
    "protect pdf password", "unlock pdf free", "pdf grayscale", "pdf optimize",
    "pdf bates numbering", "n-up pdf", "pdf to svg", "pdf to tiff", "html to pdf",
    "url to pdf", "epub to pdf", "heic to pdf", "ppt to pdf", "pdf to ppt",
    "pdf scanner", "deskew pdf", "ocr online free", "pdf to audio", "read pdf aloud",
    "pdf annotation", "pdf forms", "fill pdf form", "pdf digital signature",
    "pdf highlight", "pdf comment", "add text to pdf", "pdf branding",
    "pdf to markdown", "markdown to pdf", "json to pdf", "xml to pdf",
    "pdf to epub", "tiff to pdf", "pdf overlay", "pdf booklet",
    "pdf compare", "extract pdf tables", "extract pdf images",
    "pdf dark mode", "pdf page thumbnails", "pdf presentation mode",
    "pdf header footer", "scale pdf", "alternate merge pdf", "pdf page labels",
    "pdf bookmark", "create blank pdf", "pdf repair", "linearize pdf",
    "reduce pdf image size", "pdf to pdfa", "anonymize pdf",
    "draw shapes pdf", "sticky note pdf", "strikethrough pdf",
    "underline pdf", "pdf certify", "search and redact pdf",
    "remove links pdf", "request signature pdf", "import form data pdf",
    "export form data pdf", "reset pdf form"
  ],
  authors: [{ name: "4uPDF", url: SITE_URL }],
  creator: "4uPDF",
  publisher: "4uPDF",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Free Online PDF Tools – Merge, Split, Convert & Edit | 4uPDF",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "4uPDF - Free Online PDF Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "4uPDF - Free Online PDF Tools",
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://ehieczmqbhqrtnrtthob.supabase.co" />
        <link rel="dns-prefetch" href="https://ehieczmqbhqrtnrtthob.supabase.co" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="antialiased bg-[#0f172a] text-white">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
