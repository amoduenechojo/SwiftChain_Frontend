import axios from 'axios';
import type { Testimonial } from '@/types/testimonial';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * testimonialService — all industry testimonial API communication.
 * Hooks call this; components never call this directly.
 */
export const testimonialService = {
  async getFeaturedTestimonial(signal?: AbortSignal): Promise<Testimonial> {
    const { data } = await axios.get<Testimonial>(
      `${API_BASE_URL}/industry/testimonial`,
      { signal },
    );
    return data;
  },
};
