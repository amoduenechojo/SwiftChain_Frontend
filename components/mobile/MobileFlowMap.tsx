'use client'

import React, { useState } from 'react'
import { useProtocolFlow } from '@/hooks/useProtocolFlow'
import { ProtocolStep, MapLocation } from '@/types/protocolFlow'

// Step 1: Timeline Component
function TimelineStep({ step, index, isLast }: { step: ProtocolStep; index: number; isLast: boolean }) {
  const statusColors = {
    completed: 'bg-green-500',
    active: 'bg-blue-500',
    pending: 'bg-gray-300',
  }

  const statusTextColors = {
    completed: 'text-green-600',
    active: 'text-blue-600',
    pending: 'text-gray-400',
  }

  return (
    <div className="relative flex gap-4 pb-8">
      {/* Vertical connecting line */}
      {!isLast && (
        <div className="absolute left-5 top-8 h-full w-0.5 -translate-x-1/2 bg-gray-200 dark:bg-gray-700" />
      )}

      {/* Step number circle */}
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {step.number}
      </div>

      {/* Content */}
      <div className="flex-1 pt-0.5">
        <h3 className={`text-sm font-semibold ${statusTextColors[step.status]}`}>{step.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
        <span className="mt-1 inline-block text-xs text-gray-400">
          {step.status === 'completed' && '✅ Completed'}
          {step.status === 'active' && '⏳ In progress'}
          {step.status === 'pending' && '⏱️ Pending'}
        </span>
      </div>
    </div>
  )
}

// Step 2: Map Component
function MapWidget({ locations }: { locations: MapLocation[] }) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">📍 Global Map</h3>

      {/* Map placeholder - In production, use Leaflet/Mapbox */}
      <div className="relative h-48 w-full rounded-lg bg-gray-100 dark:bg-gray-800">
        <div className="flex h-full items-center justify-center text-sm text-gray-400">
          Map widget placeholder
        </div>

        {/* Location pins */}
        <div className="absolute inset-0">
          {locations.map((loc) => (
            <button
              key={loc.id}
              className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all hover:scale-125 ${
                loc.status === 'active' ? 'bg-blue-500' : 'bg-gray-400'
              }`}
              style={{
                left: `${((loc.lng + 180) / 360) * 100}%`,
                top: `${((90 - loc.lat) / 180) * 100}%`,
              }}
              onClick={() => setSelectedLocation(loc.id)}
              aria-label={loc.name}
            >
              <span className="sr-only">{loc.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Location list */}
      <div className="mt-3 flex flex-wrap gap-2">
        {locations.map((loc) => (
          <span
            key={loc.id}
            className={`rounded-full px-3 py-1 text-xs ${
              loc.status === 'active'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {loc.name}
          </span>
        ))}
      </div>
    </div>
  )
}

// Main Component
export function MobileFlowMap() {
  const { data, isLoading, error } = useProtocolFlow()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        <p>Error loading data: {error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
        <p>No data available</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-6 p-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{data.title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{data.subtitle}</p>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Protocol Flow</h2>
        <div className="space-y-1">
          {data.steps.map((step, index) => (
            <TimelineStep
              key={step.id}
              step={step}
              index={index}
              isLast={index === data.steps.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Map */}
      <MapWidget locations={data.mapLocations} />
    </div>
  )
}

export default MobileFlowMap
