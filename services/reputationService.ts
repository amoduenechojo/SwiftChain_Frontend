import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface DriverReputationData {
  driverId: string;
  onChainScore: number;
  updatedAt: string;
}

/**
 * reputationService — fetches a driver's tokenized on-chain reputation.
 *
 * The backend resolves this by querying the Soroban RPC network for the
 * driver's reputation token state; the frontend only ever talks to the
 * backend API, never the RPC endpoint directly.
 *
 * Hooks call this; components never call this directly.
 */
export const reputationService = {
  async getDriverReputation(
    driverId: string,
    signal?: AbortSignal,
  ): Promise<DriverReputationData> {
    const { data } = await axios.get<DriverReputationData>(
      `${API_BASE_URL}/fleet/drivers/${driverId}/reputation`,
      { signal },
    );
    return data;
  },
};
