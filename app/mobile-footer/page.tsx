import MobileFooter from '@/components/mobile/MobileFooter'

export default function MobileFooterPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 p-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mobile Footer Preview
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Scroll down to see the simplified footer
          </p>
          <div className="mt-8 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
              >
                <p className="text-gray-700 dark:text-gray-300">
                  Content block {i + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
        <MobileFooter />
      </div>
    </main>
  )
}
