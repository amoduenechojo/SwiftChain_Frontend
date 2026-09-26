import React from 'react';
import { render, screen } from '@testing-library/react';
import { FleetPartnerDirectory } from '@/components/fleet/FleetPartnerDirectory';
import type { Driver } from '@/types/fleet';

jest.mock('@/hooks/useDriverReputation');

const mockDrivers: Driver[] = [
  {
    id: 'driver-1',
    name: 'Alice Johnson',
    phone: '+1111111111',
    vehicleType: 'Sedan',
    vehiclePlate: 'ABC-123',
    status: 'active',
    rating: 4.8,
    activeDeliveries: 3,
    completedDeliveries: 150,
    location: { lat: 9.082, lng: 7.6753, updatedAt: '2024-01-01T00:00:00Z' },
    trustScore: 1250,
  },
  {
    id: 'driver-2',
    name: 'Bob Smith',
    phone: '+2222222222',
    vehicleType: 'Van',
    vehiclePlate: 'XYZ-789',
    status: 'on_delivery',
    rating: 4.5,
    activeDeliveries: 1,
    completedDeliveries: 89,
    location: { lat: 9.5, lng: 8.0, updatedAt: '2024-01-01T00:00:00Z' },
    trustScore: 980,
  },
  {
    id: 'driver-3',
    name: 'Carol White',
    phone: '+3333333333',
    vehicleType: 'Truck',
    vehiclePlate: 'TRK-456',
    status: 'idle',
    rating: 3.9,
    activeDeliveries: 0,
    completedDeliveries: 42,
    location: { lat: 8.5, lng: 7.5, updatedAt: '2024-01-01T00:00:00Z' },
    trustScore: 0,
  },
];

describe('FleetPartnerDirectory', () => {
  it('renders loading skeletons when isLoading is true', () => {
    render(<FleetPartnerDirectory partners={[]} isLoading />);

    const skeletons = screen.getAllByRole('generic').filter((el) =>
      el.className.includes('animate-pulse'),
    );
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders empty state when partners array is empty', () => {
    render(<FleetPartnerDirectory partners={[]} />);

    expect(
      screen.getByText('No partners found in your fleet network.'),
    ).toBeInTheDocument();
  });

  it('renders partner cards for each driver', () => {
    render(<FleetPartnerDirectory partners={mockDrivers} />);

    expect(screen.getByText('Fleet & Partner Network')).toBeInTheDocument();
    expect(screen.getByText('3 partners in your network')).toBeInTheDocument();

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('Carol White')).toBeInTheDocument();

    const cards = screen.getAllByTestId('partner-card');
    expect(cards).toHaveLength(3);
  });

  it('displays vehicle information for each partner', () => {
    render(<FleetPartnerDirectory partners={mockDrivers} />);

    expect(screen.getByText('Sedan · ABC-123')).toBeInTheDocument();
    expect(screen.getByText('Van · XYZ-789')).toBeInTheDocument();
    expect(screen.getByText('Truck · TRK-456')).toBeInTheDocument();
  });

  it('displays delivery counts for each partner', () => {
    render(<FleetPartnerDirectory partners={mockDrivers} />);

    expect(screen.getByText('3 active · 150 done')).toBeInTheDocument();
    expect(screen.getByText('1 active · 89 done')).toBeInTheDocument();
    expect(screen.getByText('0 active · 42 done')).toBeInTheDocument();
  });

  it('displays status badges with correct labels', () => {
    render(<FleetPartnerDirectory partners={mockDrivers} />);

    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('on delivery')).toBeInTheDocument();
    expect(screen.getByText('idle')).toBeInTheDocument();
  });

  it('displays star ratings formatted to one decimal', () => {
    render(<FleetPartnerDirectory partners={mockDrivers} />);

    const ratingElements = screen.getAllByText('4.8');
    expect(ratingElements.length).toBeGreaterThanOrEqual(1);

    const ratingElements2 = screen.getAllByText('4.5');
    expect(ratingElements2.length).toBeGreaterThanOrEqual(1);

    const ratingElements3 = screen.getAllByText('3.9');
    expect(ratingElements3.length).toBeGreaterThanOrEqual(1);
  });

  it('handles single partner correctly', () => {
    render(<FleetPartnerDirectory partners={[mockDrivers[0]]} />);

    expect(screen.getByText('1 partner in your network')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();

    const cards = screen.getAllByTestId('partner-card');
    expect(cards).toHaveLength(1);
  });

  it('renders correct pluralization for multiple partners', () => {
    render(<FleetPartnerDirectory partners={mockDrivers} />);

    expect(screen.getByText('3 partners in your network')).toBeInTheDocument();
  });

  it('applies correct status badge styling for each status', () => {
    render(<FleetPartnerDirectory partners={mockDrivers} />);

    const activeBadge = screen.getByText('active');
    expect(activeBadge).toHaveClass('bg-emerald-100', 'text-emerald-700');

    const onDeliveryBadge = screen.getByText('on delivery');
    expect(onDeliveryBadge).toHaveClass('bg-blue-100', 'text-blue-700');

    const idleBadge = screen.getByText('idle');
    expect(idleBadge).toHaveClass('bg-amber-100', 'text-amber-700');
  });
});
