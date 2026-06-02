'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdvancedToolPage from '@/components/pdf/AdvancedToolPage'
import type { AdvancedToolConfig } from '@/components/pdf/AdvancedToolPage'
import { Loader2 } from 'lucide-react'
import Header from '@/components/shared/Header'

// Combined config map from all config files
let combinedConfigMap: Map<string, AdvancedToolConfig> | null = null

async function getConfigMap(): Promise<Map<string, AdvancedToolConfig>> {
  if (combinedConfigMap) return combinedConfigMap

  const [part1, part2, part3a, part3b, part3c, part3d, part4] = await Promise.all([
    import('@/lib/pdf/tool-configs-part1'),
    import('@/lib/pdf/tool-configs-part2'),
    import('@/lib/pdf/tool-configs-part3a'),
    import('@/lib/pdf/tool-configs-part3b'),
    import('@/lib/pdf/tool-configs-part3c'),
    import('@/lib/pdf/tool-configs-part3d'),
    import('@/lib/pdf/tool-configs-part4'),
  ])

  combinedConfigMap = new Map(part1.TOOL_CONFIG_MAP)

  // Add missing configs from part2
  for (const config of part2.ALL_MISSING_CONFIGS) {
    if (!combinedConfigMap.has(config.id)) {
      combinedConfigMap.set(config.id, config)
    }
  }

  // Add configs from part3a (security, compress, OCR)
  for (const config of part3a.PART3A_CONFIGS) {
    if (!combinedConfigMap.has(config.id)) {
      combinedConfigMap.set(config.id, config)
    }
  }

  // Add configs from part3b (watermark/overlay, sign/forms, edit extra)
  for (const config of part3b.PART3B_CONFIGS) {
    if (!combinedConfigMap.has(config.id)) {
      combinedConfigMap.set(config.id, config)
    }
  }

  // Add configs from part3c (convert extra, advanced extra, organize extra)
  for (const config of part3c.PART3C_CONFIGS) {
    if (!combinedConfigMap.has(config.id)) {
      combinedConfigMap.set(config.id, config)
    }
  }

  // Add configs from part3d (annotation, view)
  for (const config of part3d.PART3D_CONFIGS) {
    if (!combinedConfigMap.has(config.id)) {
      combinedConfigMap.set(config.id, config)
    }
  }

  // Add configs from part4 (more tools - page numbers, borders, date stamps, etc.)
  for (const config of part4.PART4_CONFIGS) {
    if (!combinedConfigMap.has(config.id)) {
      combinedConfigMap.set(config.id, config)
    }
  }

  return combinedConfigMap
}

export default function DynamicToolPage() {
  const params = useParams()
  const toolId = params.tool as string
  const [config, setConfig] = useState<AdvancedToolConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadConfig() {
      try {
        const configMap = await getConfigMap()
        const toolConfig = configMap.get(toolId)
        if (toolConfig) {
          setConfig(toolConfig)
        } else {
          setError(`Tool "${toolId}" not found`)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load tool')
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [toolId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-blue-400 mx-auto mb-3" />
          <p className="text-slate-400">Loading tool...</p>
        </div>
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Header currentPath={`/tools/${toolId}`} />
        <div className="text-center mt-20">
          <p className="text-red-400 text-lg mb-2">Tool not found</p>
          <p className="text-slate-500">{error || `No configuration for "${toolId}"`}</p>
          <a href="/" className="text-blue-400 hover:text-blue-300 text-sm mt-4 inline-block">← Back to Home</a>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Schema markup for tool page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: config.name,
            description: config.description,
            url: `https://4updf-all.vercel.app/tools/${toolId}`,
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            provider: {
              '@type': 'Organization',
              name: '4uPDF',
              url: 'https://4updf-all.vercel.app',
            },
            browserRequirements: 'Requires JavaScript. Requires HTML5.',
          }),
        }}
      />
      {/* BreadcrumbList schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://4updf-all.vercel.app' },
              { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://4updf-all.vercel.app/#tools' },
              { '@type': 'ListItem', position: 3, name: config.name, item: `https://4updf-all.vercel.app/tools/${toolId}` },
            ],
          }),
        }}
      />
      <AdvancedToolPage config={config} />
    </>
  )
}
