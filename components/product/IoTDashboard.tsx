'use client';

import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Battery, Droplets, Radio, Snowflake, Thermometer, Zap } from 'lucide-react';
import { useIoTDashboard } from '@/hooks/useIoTDashboard';

const SERIES_TEMP = '#2a78d6';
const SERIES_HUMIDITY = '#eb6834';
const SERIES_SHOCK = '#e34948';

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function LiveStreamBanner() {
  return (
    <header className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-900 p-4 text-white dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Live Fleet Stream</h1>
        <p className="text-sm text-gray-300">
          Real-time IoT telemetry from connected shipment sensors.
        </p>
      </div>
      <div
        className="flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1"
        role="status"
        aria-live="polite"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide">Live</span>
      </div>
    </header>
  );
}

interface HighlightCardProps {
  icon: ReactNode;
  title: string;
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel: string;
  secondaryValue: string;
}

function HighlightCard({
  icon,
  title,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
}: HighlightCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{primaryLabel}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{primaryValue}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">{secondaryLabel}</p>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            {secondaryValue}
          </p>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function MetricCard({ icon, label, value }: MetricCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-base font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6" role="status" aria-label="Loading IoT dashboard">
      <div className="h-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-28 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-28 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-72 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

export function IoTDashboard() {
  const { data, isLoading, isError, error } = useIoTDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
      >
        Failed to load IoT dashboard data{error ? `: ${error.message}` : '.'}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { coldChain, shockMonitoring, telemetry, summary } = data;

  const latestTemp = telemetry.length
    ? telemetry[telemetry.length - 1].temperatureC
    : coldChain.currentTempC;
  const firstTemp = telemetry.length ? telemetry[0].temperatureC : latestTemp;
  const tempTrend = latestTemp >= firstTemp ? 'rising' : 'falling';

  const shockTrendSummary = shockMonitoring.events.length
    ? `${shockMonitoring.events.length} impact events recorded, peak force ${Math.max(
        ...shockMonitoring.events.map((event) => event.forceG),
      ).toFixed(2)}g.`
    : 'No impact events recorded in this window.';

  return (
    <div className="space-y-6">
      <LiveStreamBanner />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Sensor highlights">
        <HighlightCard
          icon={<Snowflake className="h-4 w-4 text-blue-500" aria-hidden="true" />}
          title="Cold Chain Integrity"
          primaryLabel="Current Temperature"
          primaryValue={`${coldChain.currentTempC.toFixed(1)}°C`}
          secondaryLabel="Compliance"
          secondaryValue={`${coldChain.complianceRate.toFixed(1)}%`}
        />
        <HighlightCard
          icon={<Zap className="h-4 w-4 text-amber-500" aria-hidden="true" />}
          title="Shock Monitoring"
          primaryLabel="Current G-Force"
          primaryValue={`${shockMonitoring.currentForceG.toFixed(2)}g`}
          secondaryLabel="Impact Events"
          secondaryValue={`${shockMonitoring.events.length}`}
        />
      </section>

      <section
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        aria-label="Live telemetry metrics"
      >
        <MetricCard
          icon={<Thermometer className="h-4 w-4" aria-hidden="true" />}
          label="Temperature"
          value={`${summary.temperatureC.toFixed(1)}°C`}
        />
        <MetricCard
          icon={<Droplets className="h-4 w-4" aria-hidden="true" />}
          label="Humidity"
          value={`${summary.humidityPct.toFixed(0)}%`}
        />
        <MetricCard
          icon={<Radio className="h-4 w-4" aria-hidden="true" />}
          label="GPS Signal"
          value={`${summary.gpsSignalPct.toFixed(0)}%`}
        />
        <MetricCard
          icon={<Battery className="h-4 w-4" aria-hidden="true" />}
          label="Battery Level"
          value={`${summary.batteryPct.toFixed(0)}%`}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
            Temperature &amp; Humidity Over Time
          </h2>
          <p className="sr-only">
            {`Temperature is currently ${tempTrend} and reads ${latestTemp.toFixed(
              1,
            )}°C. Humidity is at ${summary.humidityPct.toFixed(0)} percent.`}
          </p>
          <div
            className="h-64 w-full"
            role="img"
            aria-label={`Line chart of temperature and humidity readings over time, temperature is ${tempTrend}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetry}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  stroke="#898781"
                  fontSize={12}
                />
                <YAxis stroke="#898781" fontSize={12} />
                <Tooltip labelFormatter={(value) => formatTime(String(value))} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="temperatureC"
                  name="Temperature (°C)"
                  stroke={SERIES_TEMP}
                  fill={SERIES_TEMP}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="humidityPct"
                  name="Humidity (%)"
                  stroke={SERIES_HUMIDITY}
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
            Shock Events (G-Force)
          </h2>
          <p className="sr-only">{shockTrendSummary}</p>
          <div
            className="h-64 w-full"
            role="img"
            aria-label={`Bar chart of shock events by G-force. ${shockTrendSummary}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shockMonitoring.events}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  stroke="#898781"
                  fontSize={12}
                />
                <YAxis stroke="#898781" fontSize={12} />
                <Tooltip labelFormatter={(value) => formatTime(String(value))} />
                <Bar dataKey="forceG" name="Force (g)" fill={SERIES_SHOCK} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
