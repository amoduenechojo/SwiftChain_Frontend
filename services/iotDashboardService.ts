import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface ColdChainMetric {
  currentTempC: number;
  minSafeTempC: number;
  maxSafeTempC: number;
  complianceRate: number;
}

export interface ShockEvent {
  timestamp: string;
  forceG: number;
}

export interface ShockMonitoring {
  currentForceG: number;
  impactThresholdG: number;
  events: ShockEvent[];
}

export interface FleetTelemetryPoint {
  timestamp: string;
  temperatureC: number;
  humidityPct: number;
  gpsSignalPct: number;
  batteryPct: number;
}

export interface TelemetrySummary {
  temperatureC: number;
  humidityPct: number;
  gpsSignalPct: number;
  batteryPct: number;
}

export interface IoTDashboardData {
  coldChain: ColdChainMetric;
  shockMonitoring: ShockMonitoring;
  telemetry: FleetTelemetryPoint[];
  summary: TelemetrySummary;
}

export const iotDashboardService = {
  async getIoTDashboardData(): Promise<IoTDashboardData> {
    const { data } = await axios.get<IoTDashboardData>(
      `${API_BASE_URL}/api/iot/dashboard`,
    );
    return data;
  },
};
