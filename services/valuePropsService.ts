import axios from 'axios';
import type { ValuePropsResponse } from '@/types/valueProp';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * valuePropsService — all landing-page value proposition API communication.
 * Hooks call this; components never call this directly.
 */
export const valuePropsService = {
  async getValueProps(signal?: AbortSignal): Promise<ValuePropsResponse> {
    const { data } = await axios.get<ValuePropsResponse>(
      `${API_BASE_URL}/content/value-props`,
      { signal },
    );
    return data;
  },
};
