import axios from 'axios';
import type { ContractSnippet } from '@/types/contractMockup';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * contractMockupService — all contract-mockup-related API communication.
 * Hooks call this; components never call this directly.
 */
export const contractMockupService = {
  async getContractSnippet(signal?: AbortSignal): Promise<ContractSnippet> {
    const { data } = await axios.get<ContractSnippet>(
      `${API_BASE_URL}/api/product/contract-mockup`,
      { signal },
    );
    return data;
  },
};
