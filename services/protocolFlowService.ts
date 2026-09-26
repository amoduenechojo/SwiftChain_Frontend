import { ProtocolFlowData } from '@/types/protocolFlow'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

export const protocolFlowService = {
  async getFlowData(): Promise<ProtocolFlowData> {
    const response = await fetch(`${API_BASE}/protocol-flow`)
    if (!response.ok) {
      throw new Error('Failed to fetch protocol flow data')
    }
    return response.json()
  },
}
