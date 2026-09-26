import { useQuery } from '@tanstack/react-query';
import {
  iotDashboardService,
  type IoTDashboardData,
} from '@/services/iotDashboardService';

export const IOT_DASHBOARD_QUERY_KEY = ['iot-dashboard'] as const;

export interface UseIoTDashboardReturn {
  data: IoTDashboardData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * useIoTDashboard — fetches live IoT fleet telemetry for the product
 * showcase dashboard. Polls on an interval to simulate a live stream.
 */
export function useIoTDashboard(): UseIoTDashboardReturn {
  const { data, isLoading, isError, error } = useQuery<IoTDashboardData, Error>({
    queryKey: IOT_DASHBOARD_QUERY_KEY,
    queryFn: () => iotDashboardService.getIoTDashboardData(),
    refetchInterval: 10000,
  });

  return {
    data: data ?? null,
    isLoading,
    isError,
    error: error ?? null,
  };
}
