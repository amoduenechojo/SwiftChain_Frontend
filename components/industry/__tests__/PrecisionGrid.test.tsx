import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PrecisionGrid } from '../PrecisionGrid';

describe('PrecisionGrid Component', () => {
  const mockVerticals = [
    {
      id: 'independent-carriers',
      title: 'Independent Carriers',
      description: 'Test description for independent carriers',
      image: '/test-image.jpg',
    },
    {
      id: 'global-freight',
      title: 'Global Freight',
      description: 'Test description for global freight',
      icon: '🌍',
    },
    {
      id: 'cold-chain',
      title: 'Cold Chain',
      description: 'Test description for cold chain',
      icon: '❄️',
    },
    {
      id: 'last-mile',
      title: 'Last Mile',
      description: 'Test description for last mile',
      icon: '🚚',
    },
  ];

  it('renders the component with default props', () => {
    render(<PrecisionGrid />);
    expect(screen.getByText('Precision Solutions for Specialized Verticals')).toBeInTheDocument();
  });

  it('renders the featured vertical card', () => {
    render(<PrecisionGrid verticals={mockVerticals} />);
    expect(screen.getByText('Independent Carriers')).toBeInTheDocument();
  });

  it('renders all vertical cards', () => {
    render(<PrecisionGrid verticals={mockVerticals} />);
    expect(screen.getByText('Global Freight')).toBeInTheDocument();
    expect(screen.getByText('Cold Chain')).toBeInTheDocument();
    expect(screen.getByText('Last Mile')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <PrecisionGrid className="custom-class" verticals={mockVerticals} />
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('uses default verticals when none provided', () => {
    render(<PrecisionGrid />);
    expect(screen.getByText('Independent Carriers')).toBeInTheDocument();
    expect(screen.getByText('Global Freight')).toBeInTheDocument();
    expect(screen.getByText('Cold Chain')).toBeInTheDocument();
    expect(screen.getByText('Last Mile')).toBeInTheDocument();
  });

  it('applies CSS grid classes for asymmetrical layout', () => {
    const { container } = render(<PrecisionGrid verticals={mockVerticals} />);
    const gridElement = container.querySelector('.grid');
    expect(gridElement).toHaveClass('grid-cols-1');
    expect(gridElement).toHaveClass('md:grid-cols-3');
  });
});
