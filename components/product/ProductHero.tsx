'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, FileText, Code } from 'lucide-react'

// Data interface
export interface ProductHeroData {
  overline: string
  title: string
  description: string
  primaryCta: {
    label: string
    href: string
  }
  secondaryCta: {
    label: string
    href: string
  }
}

// Default data (will be replaced by API)
const defaultHeroData: ProductHeroData = {
  overline: 'CORE TECHNOLOGY',
  title: 'Logistics Redefined',
  description: 'SwiftChain is a decentralized logistics platform that combines blockchain technology with real-world supply chain management to create transparent, efficient, and trustless freight operations.',
  primaryCta: {
    label: 'Download Whitepaper',
    href: '/whitepaper',
  },
  secondaryCta: {
    label: 'View API Docs',
    href: '/api-docs',
  },
}

// Hook to fetch data (will be connected to API)
function useProductHeroData() {
  // TODO: Replace with API call
  // const [data, setData] = useState<ProductHeroData | null>(null)
  // useEffect(() => { fetch('/api/product-hero').then(...) }, [])
  return defaultHeroData
}

export function ProductHero() {
  const data = useProductHeroData()

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white px-4 py-16 dark:from-gray-950 dark:to-gray-900 md:py-24 lg:py-32">
      <div className="mx-auto max-w-4xl text-center">
        {/* Overline */}
        <div className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
          {data.overline}
        </div>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          {data.title}
        </h1>

        {/* Description */}
        <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300 md:text-xl">
          {data.description}
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={data.primaryCta.href}
            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <FileText className="mr-2 h-4 w-4" />
            {data.primaryCta.label}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href={data.secondaryCta.href}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Code className="mr-2 h-4 w-4" />
            {data.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ProductHero
