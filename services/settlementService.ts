import axios from 'axios';
import type { SettlementDiagramData } from '@/types/settlement';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * settlementService — all automated settlement flow API communication.
 * Hooks call this; components never call this directly.
 */
export const settlementService = {
  async getSettlementDiagram(signal?: AbortSignal): Promise<SettlementDiagramData> {
    const { data } = await axios.get<SettlementDiagramData>(
      `${API_BASE_URL}/product/settlement`,
      { signal },
    );
    return data;
  },
};
