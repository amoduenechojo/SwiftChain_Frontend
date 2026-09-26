import axios from 'axios';
import type { KineticExplorerResponse } from '@/types/kineticExplorer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * kineticExplorerService — all Kinetic Ledger Explorer API communication.
 * Hooks call this; components never call this directly.
 */
export const kineticExplorerService = {
  async getSnapshot(signal?: AbortSignal): Promise<KineticExplorerResponse> {
    const { data } = await axios.get<KineticExplorerResponse>(
      `${API_BASE_URL}/network/kinetic-explorer`,
      { signal },
    );
    return data;
  },
};
