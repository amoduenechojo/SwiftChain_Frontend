import { act, renderHook, waitFor } from '@testing-library/react';
import { useIndustryHero } from '@/hooks/useIndustryHero';
import { industryService } from '@/services/industryService';
import type { IndustryHeroResponse } from '@/types/industry';

jest.mock('@/services/industryService', () => ({
  industryService: {
    getIndustryHero: jest.fn(),
  },
}));

const mockGetIndustryHero = industryService.getIndustryHero as jest.Mock;

const mockResponse: IndustryHeroResponse = {
  hero: {
    eyebrow: 'Industry Solutions',
    title: 'Modernizing the Global Supply Chain',
    description: 'Escrow-backed logistics for enterprise networks.',
    primaryCta: { label: 'Talk to our team', href: '/contact' },
    secondaryCta: null,
    stats: [{ id: 'stat-1', label: 'Active trade corridors', value: '120+' }],
  },
  features: [
    {
      id: 'enterprise-logistics',
      eyebrow: 'Enterprise Logistics',
      title: 'One command center for every shipment you move',
      description: 'Dispatch, exceptions and escrow release in one view.',
      imagePosition: 'right',
      image: {
        src: '/images/industry/enterprise-command-center.png',
        alt: 'SwiftChain enterprise command center',
        width: 1280,
        height: 960,
      },
      highlights: [],
      cta: null,
    },
  ],
};

describe('useIndustryHero', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts in a loading state and returns hero content from the service', async () => {
    mockGetIndustryHero.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useIndustryHero());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.hero).toBeNull();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hero?.title).toBe(
      'Modernizing the Global Supply Chain',
    );
    expect(result.current.features).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('exposes an error message when the request fails', async () => {
    mockGetIndustryHero.mockRejectedValueOnce(new Error('Service unavailable'));

    const { result } = renderHook(() => useIndustryHero());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Service unavailable');
    expect(result.current.hero).toBeNull();
    expect(result.current.features).toEqual([]);
  });

  it('clears the previous error and refetches on demand', async () => {
    mockGetIndustryHero
      .mockRejectedValueOnce(new Error('Service unavailable'))
      .mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useIndustryHero());

    await waitFor(() => expect(result.current.error).toBe('Service unavailable'));

    act(() => result.current.refetch());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetIndustryHero).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
    expect(result.current.hero?.eyebrow).toBe('Industry Solutions');
  });

  it('aborts the in-flight request on unmount', async () => {
    let received: AbortSignal | undefined;
    mockGetIndustryHero.mockImplementationOnce((signal?: AbortSignal) => {
      received = signal;
      return new Promise(() => {});
    });

    const { unmount } = renderHook(() => useIndustryHero());
    unmount();

    expect(received?.aborted).toBe(true);
  });
});
