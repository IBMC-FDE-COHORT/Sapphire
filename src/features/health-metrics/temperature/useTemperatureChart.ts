import { gql, useQuery } from '@apollo/client';
import type { ChartRange, TemperatureChartData } from './TemperatureChart.types';

const GET_TEMPERATURE_CHART = gql`
  query GetTemperatureChart($userId: ID!, $range: ChartRange!, $deviceSource: String) {
    temperatureChart(userId: $userId, range: $range, deviceSource: $deviceSource) {
      userId
      unit
      range
      dataPoints {
        periodStart
        minCelsius
        maxCelsius
        avgCelsius
        recordCount
      }
    }
  }
`;

/**
 * Apollo query hook for the body temperature trend chart.
 *
 * Uses `cache-and-network` so the chart reflects committed records immediately
 * on range switch while still showing stale data during the background refresh.
 * Mutable health data must NOT use implicit `cache-first` (constitution III).
 *
 * @param userId      the authenticated user's ID
 * @param range       selected time range (DAY | WEEK | MONTH)
 * @param deviceSource optional device source filter
 */
export function useTemperatureChart(
  userId: string,
  range: ChartRange,
  deviceSource?: string,
) {
  return useQuery<{ temperatureChart: TemperatureChartData | null }>(
    GET_TEMPERATURE_CHART,
    {
      variables: { userId, range, deviceSource: deviceSource ?? null },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );
}
