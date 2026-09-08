/**
 * TypeScript interfaces for the body temperature chart feature.
 *
 * Mirrors the GraphQL schema types from sapphire-bff-api temperature.graphql
 * and the Apollo query contract in specs/ADF-3/contracts/ui-component.md.
 */

export type ChartRange = 'DAY' | 'WEEK' | 'MONTH';
export type TemperatureUnit = 'CELSIUS' | 'FAHRENHEIT';

export interface TemperatureDataPoint {
  /** ISO date string for the start of the aggregation bucket. */
  periodStart: string;
  minCelsius: number;
  maxCelsius: number;
  avgCelsius: number;
  recordCount: number;
}

export interface TemperatureChartData {
  userId: string;
  unit: TemperatureUnit;
  range: ChartRange;
  dataPoints: TemperatureDataPoint[];
}

export interface TemperatureChartProps {
  userId: string;
  /** Optional device source filter forwarded to the charting API. */
  deviceSource?: string;
}
