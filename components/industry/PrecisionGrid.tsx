import React from 'react';
import Image from 'next/image';

interface Vertical {
  id: string;
  title: string;
  description: string;
  image?: string;
  icon?: React.ReactNode;
  link?: string;
}

interface PrecisionGridProps {
  verticals?: Vertical[];
  className?: string;
}

const defaultVerticals: Vertical[] = [
  {
    id: 'independent-carriers',
    title: 'Independent Carriers',
    description: 'Empower owner-operators and small fleets with real-time tracking, automated settlements, and instant freight matching.',
    image: '/images/industry/truck-cab.svg',
  },
  {
    id: 'global-freight',
    title: 'Global Freight',
    description: 'Manage cross-border shipments with integrated customs documentation and multi-modal transport coordination.',
    icon: '🌍',
  },
  {
    id: 'cold-chain',
    title: 'Cold Chain',
    description: 'Maintain temperature integrity with real-time monitoring, automated alerts, and compliance reporting for perishable goods.',
    icon: '❄️',
  },
  {
    id: 'last-mile',
    title: 'Last Mile',
    description: 'Optimize final delivery with dynamic routing, real-time ETA updates, and proof of delivery capture.',
    icon: '🚚',
  },
];

export const PrecisionGrid: React.FC<PrecisionGridProps> = ({
  verticals = defaultVerticals,
  className = '',
}) => {
  // Get the featured vertical (first one) and the rest
  const [featured, ...rest] = verticals;

  return (
    <section className={`py-16 px-4 md:px-8 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Precision Solutions for Specialized Verticals
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tailored logistics solutions designed for the unique challenges of each industry segment.
          </p>
        </div>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Featured Card - Spans 2 columns on desktop */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-600 to-blue-800">
              {featured?.image ? (
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white text-6xl">
                  🚛
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{featured?.title}</h3>
                  <p className="text-sm opacity-90 max-w-lg">{featured?.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rest of the grid - 3 items in 2 rows with asymmetrical layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-1">
            {rest.slice(0, 3).map((vertical, index) => (
              <div
                key={vertical.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
                  index === 2 ? 'md:col-span-2' : ''
                }`}
              >
                <div className="p-6">
                  <div className="text-4xl mb-3">{vertical.icon || '📦'}</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {vertical.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {vertical.description}
                  </p>
                  <button className="mt-4 text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors">
                    Learn More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row with the remaining verticals if any */}
        {rest.length > 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {rest.slice(3).map((vertical) => (
              <div
                key={vertical.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="text-4xl mb-3">{vertical.icon || '📦'}</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {vertical.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {vertical.description}
                  </p>
                  <button className="mt-4 text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors">
                    Learn More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PrecisionGrid;
