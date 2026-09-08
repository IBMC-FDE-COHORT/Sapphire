import React from 'react';
import { NetworkStatus } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import { useTemperatureChart } from './useTemperatureChart';
import type { ChartRange, TemperatureChartProps } from './TemperatureChart.types';

const RANGE_OPTIONS: ChartRange[] = ['DAY', 'WEEK', 'MONTH'];
const RANGE_LABELS: Record<ChartRange, string> = { DAY: 'Day', WEEK: 'Week', MONTH: 'Month' };
const UNIT_LABEL = '\u00b0C';
const EMPTY_STATE_MESSAGE = 'No temperature data available for the selected period';
const DEFAULT_RANGE: ChartRange = 'WEEK';

/**
 * Body temperature trend chart component.
 *
 * Handles all five required UI states: initial loading skeleton, data present,
 * empty state, loading overlay during range switch, and error boundary with retry.
 * URL search param `range` is the source of truth for the selected range
 * (constitution III \u2014 URL state is source of truth for selections).
 */
export function TemperatureChart({ userId, deviceSource }: TemperatureChartProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const rangeParam = searchParams.get('range') as ChartRange | null;
  const range: ChartRange =
    rangeParam && RANGE_OPTIONS.includes(rangeParam) ? rangeParam : DEFAULT_RANGE;

  const { data, loading, error, networkStatus, refetch } = useTemperatureChart(
    userId,
    range,
    deviceSource,
  );

  const isInitialLoad = loading && networkStatus === NetworkStatus.loading;
  const isRefetching =
    loading &&
    (networkStatus === NetworkStatus.setVariables ||
      networkStatus === NetworkStatus.refetch);
  const chartData = data?.temperatureChart ?? null;

  function handleRangeSelect(selected: ChartRange) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('range', selected);
      return next;
    });
  }

  if (error && !chartData) {
    return (
      <div role="alert" className="chart-error-boundary">
        <p>Unable to load temperature data. Please try again.</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="temperature-chart">
      <div className="chart-range-selector" role="group" aria-label="Select time range">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => handleRangeSelect(option)}
            aria-pressed={range === option}
            className={range === option ? 'active' : undefined}
          >
            {RANGE_LABELS[option]}
          </button>
        ))}
      </div>

      {isInitialLoad ? (
        <div className="chart-skeleton" aria-label="Loading temperature data" />
      ) : chartData && chartData.dataPoints.length > 0 ? (
        <div className="chart-content">
          {isRefetching && (
            <div className="chart-loading-overlay" aria-label="Updating chart" />
          )}
          <span className="chart-unit-label">{UNIT_LABEL}</span>
          <ul className="chart-data-list" data-testid="temperature-chart-data">
            {chartData.dataPoints.map((pt) => (
              <li key={pt.periodStart}>
                {pt.periodStart}: avg {pt.avgCelsius}{UNIT_LABEL}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="chart-empty-state">{EMPTY_STATE_MESSAGE}</p>
      )}
    </div>
  );
}
