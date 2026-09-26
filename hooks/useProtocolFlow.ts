import { useState, useEffect } from 'react'
import { ProtocolFlowData } from '@/types/protocolFlow'
import { protocolFlowService } from '@/services/protocolFlowService'

export function useProtocolFlow() {
  const [data, setData] = useState<ProtocolFlowData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const result = await protocolFlowService.getFlowData()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, isLoading, error }
}
