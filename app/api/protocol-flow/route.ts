import { NextResponse } from 'next/server'

export async function GET() {
  // In production, this would fetch from a database
  const mockData = {
    steps: [
      {
        id: 1,
        number: '01',
        title: 'Initiate Protocol',
        description: 'Start the escrow process by creating a new agreement',
        status: 'completed' as const,
      },
      {
        id: 2,
        number: '02',
        title: 'Smart Contract Execution',
        description: 'Funds are locked in the escrow smart contract',
        status: 'active' as const,
      },
      {
        id: 3,
        number: '03',
        title: 'Confirmation & Release',
        description: 'Both parties confirm delivery and release funds',
        status: 'pending' as const,
      },
    ],
    mapLocations: [
      { id: '1', name: 'New York', lat: 40.7128, lng: -74.006, status: 'active' as const },
      { id: '2', name: 'London', lat: 51.5074, lng: -0.1278, status: 'completed' as const },
      { id: '3', name: 'Tokyo', lat: 35.6762, lng: 139.6503, status: 'inactive' as const },
      { id: '4', name: 'Sydney', lat: -33.8688, lng: 151.2093, status: 'active' as const },
    ],
    title: 'Global Protocol Flow',
    subtitle: 'Real-time status of all active protocols',
  }

  return NextResponse.json(mockData)
}
