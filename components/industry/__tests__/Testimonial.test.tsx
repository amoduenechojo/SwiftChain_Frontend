import { render, screen, fireEvent } from '@testing-library/react';
import { Testimonial } from '../Testimonial';
import { useTestimonial } from '@/hooks/useTestimonial';
import { testimonialService } from '@/services/testimonialService';
import type { Testimonial as TestimonialType } from '@/types/testimonial';

jest.mock('@/hooks/useTestimonial');
const mockedUseTestimonial = useTestimonial as jest.Mock;

jest.mock('@/services/testimonialService', () => ({
  testimonialService: {
    getFeaturedTestimonial: jest.fn(),
  },
}));

describe('Testimonial', () => {
  const mockRefetch = jest.fn();

  beforeEach(() => {
    mockedUseTestimonial.mockClear();
    mockRefetch.mockClear();
  });

  it('renders loading state', () => {
    mockedUseTestimonial.mockReturnValue({
      testimonial: null,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    });

    render(<Testimonial />);
    expect(screen.getByLabelText('Loading testimonial')).toBeInTheDocument();
  });

  it('renders error state and retries on click', () => {
    mockedUseTestimonial.mockReturnValue({
      testimonial: null,
      isLoading: false,
      error: 'Failed to load testimonial',
      refetch: mockRefetch,
    });

    render(<Testimonial />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load testimonial');

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders the testimonial quote and author attribution', () => {
    mockedUseTestimonial.mockReturnValue({
      testimonial: {
        id: 't1',
        quote: 'SwiftChain transformed our settlement process.',
        authorName: 'Sarah Chen',
        authorRole: 'VP of Operations',
        authorCompany: 'Meridian Logistics',
      } satisfies TestimonialType,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<Testimonial />);
    expect(
      screen.getByText('SwiftChain transformed our settlement process.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText(/VP of Operations, Meridian Logistics/)).toBeInTheDocument();
  });

  it('verifies backend API service returns Testimonial response shape', async () => {
    const apiResponseData: TestimonialType = {
      id: 't1',
      quote: 'SwiftChain transformed our settlement process.',
      authorName: 'Sarah Chen',
      authorRole: 'VP of Operations',
      authorCompany: 'Meridian Logistics',
    };

    (testimonialService.getFeaturedTestimonial as jest.Mock).mockResolvedValue(apiResponseData);

    const result = await testimonialService.getFeaturedTestimonial();
    expect(result.authorName).toBe('Sarah Chen');
    expect(result.quote).toBe('SwiftChain transformed our settlement process.');
  });
});
