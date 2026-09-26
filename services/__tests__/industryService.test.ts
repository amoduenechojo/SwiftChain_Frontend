import axios from 'axios';
import { industryService } from '@/services/industryService';
import type { IndustryHeroResponse } from '@/types/industry';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockResponse: IndustryHeroResponse = {
  hero: {
    eyebrow: 'Industry Solutions',
    title: 'Modernizing the Global Supply Chain',
    description: 'Escrow-backed logistics for enterprise networks.',
    primaryCta: { label: 'Talk to our team', href: '/contact' },
    secondaryCta: { label: 'Explore the platform', href: '/dashboard' },
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
      highlights: [
        {
          id: 'highlight-1',
          title: 'Live network visibility',
          description: 'Track every driver and lane on one map.',
        },
      ],
      cta: { label: 'See how it works', href: '/contact' },
    },
  ],
};

describe('industryService', () => {
  afterEach(() => jest.clearAllMocks());

  it('calls GET /api/industry/hero and returns the payload', async () => {
    mockedAxios.get = jest.fn().mockResolvedValue({ data: mockResponse });

    const result = await industryService.getIndustryHero();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/industry/hero'),
      expect.objectContaining({ signal: undefined }),
    );
    expect(result).toEqual(mockResponse);
  });

  it('forwards the abort signal so requests can be cancelled', async () => {
    mockedAxios.get = jest.fn().mockResolvedValue({ data: mockResponse });
    const controller = new AbortController();

    await industryService.getIndustryHero(controller.signal);

    expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), {
      signal: controller.signal,
    });
  });

  it('normalises missing collections and optional CTAs', async () => {
    mockedAxios.get = jest.fn().mockResolvedValue({
      data: {
        hero: {
          eyebrow: 'Industry Solutions',
          title: 'Modernizing the Global Supply Chain',
          description: 'Escrow-backed logistics.',
        },
        features: [
          {
            id: 'enterprise-logistics',
            eyebrow: 'Enterprise Logistics',
            title: 'Command center',
            description: 'One view.',
            image: mockResponse.features[0].image,
          },
        ],
      },
    });

    const result = await industryService.getIndustryHero();

    expect(result.hero?.stats).toEqual([]);
    expect(result.hero?.primaryCta).toBeNull();
    expect(result.hero?.secondaryCta).toBeNull();
    expect(result.features[0].highlights).toEqual([]);
    expect(result.features[0].cta).toBeNull();
    // Defaults to an image-right layout when the backend omits the position.
    expect(result.features[0].imagePosition).toBe('right');
  });

  it('returns a null hero when nothing is published', async () => {
    mockedAxios.get = jest
      .fn()
      .mockResolvedValue({ data: { hero: null, features: [] } });

    const result = await industryService.getIndustryHero();

    expect(result.hero).toBeNull();
    expect(result.features).toEqual([]);
  });

  it('throws when the API call fails', async () => {
    mockedAxios.get = jest.fn().mockRejectedValue(new Error('Network Error'));

    await expect(industryService.getIndustryHero()).rejects.toThrow(
      'Network Error',
    );
  });
});
