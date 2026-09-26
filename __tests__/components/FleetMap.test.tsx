// __tests__/components/FleetMap.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import FleetMap from '@/components/FleetMap'; // Adjust path as needed
import mapboxgl from 'mapbox-gl';

// Mock Mapbox GL JS to prevent JSDOM WebGL crash errors
jest.mock('mapbox-gl', () => {
  const mockMap = {
    on: jest.fn(),
    remove: jest.fn(),
    addControl: jest.fn(),
  };
  
  const mockMarker = {
    setLngLat: jest.fn().mockReturnThis(),
    setPopup: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
  };

  return {
    Map: jest.fn(() => mockMap),
    Marker: jest.fn(() => mockMarker),
    NavigationControl: jest.fn(),
  };
});

describe('Component: Mapbox GL JS Rendering and Marker Placement', () => {
  const mockFleetData = [
    { id: 'driver-1', name: 'Alice', coordinates: [3.3792, 6.5244] }, // Lagos coords
    { id: 'driver-2', name: 'Bob', coordinates: [3.4064, 6.4281] },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the map container successfully', () => {
    render(<FleetMap fleet={mockFleetData} />);
    
    // Assert the container exists in the DOM
    const mapContainer = screen.getByTestId('fleet-map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('instantiates the Mapbox map with expected configuration', () => {
    render(<FleetMap fleet={mockFleetData} />);

    expect(mapboxgl.Map).toHaveBeenCalledTimes(1);
    expect(mapboxgl.Map).toHaveBeenCalledWith(
      expect.objectContaining({
        container: expect.any(HTMLDivElement),
        style: expect.any(String),
        center: expect.any(Array),
        zoom: expect.any(Number),
      })
    );
  });

  it('places markers on the correct coordinates for active fleet members', () => {
    render(<FleetMap fleet={mockFleetData} />);

    // Expect a marker to be created for each driver
    expect(mapboxgl.Marker).toHaveBeenCalledTimes(mockFleetData.length);

    // Verify coordinates were applied to the markers
    const markerInstance = new mapboxgl.Marker();
    
    expect(markerInstance.setLngLat).toHaveBeenCalledWith([3.3792, 6.5244]);
    expect(markerInstance.setLngLat).toHaveBeenCalledWith([3.4064, 6.4281]);
    
    // Verify markers were added to the map
    expect(markerInstance.addTo).toHaveBeenCalledTimes(mockFleetData.length);
  });

  it('gracefully handles an empty fleet array', () => {
    render(<FleetMap fleet={[]} />);

    expect(mapboxgl.Map).toHaveBeenCalledTimes(1);
    expect(mapboxgl.Marker).not.toHaveBeenCalled();
  });
});