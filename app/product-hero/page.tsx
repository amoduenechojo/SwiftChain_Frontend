import ProductHero from '@/components/product/ProductHero'

export default function ProductHeroPage() {
  return (
    <main>
      <ProductHero />
      <div className="bg-gray-50 px-4 py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Page Content Below Hero
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              This section demonstrates how the hero integrates with the rest of the page.
              The hero is centered on desktop viewports.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
