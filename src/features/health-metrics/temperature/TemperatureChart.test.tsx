import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NetworkStatus } from '@apollo/client';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TemperatureChart } from './TemperatureChart';
import * as hook from './useTemperatureChart';

vi.mock('./useTemperatureChart');
const mockUseTemperatureChart = vi.mocked(hook.useTemperatureChart);

const MOCK_DATA_POINTS = [
  { periodStart: '2026-09-01', minCelsius: 36.4, maxCelsius: 37.8, avgCelsius: 37.1, recordCount: 4 },
];

function renderChart(userId = 'user-abc') {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <TemperatureChart userId={userId} />
    </MemoryRouter>,
  );
}

describe('TemperatureChart', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('renders loading skeleton on initial fetch', () => {
    mockUseTemperatureChart.mockReturnValue({
      data: undefined, loading: true, error: undefined,
      networkStatus: NetworkStatus.loading, refetch: vi.fn(),
    } as never);
    renderChart();
    expect(screen.getByLabelText('Loading temperature data')).toBeInTheDocument();
  });

  it('renders chart data and unit label when data is present', () => {
    mockUseTemperatureChart.mockReturnValue({
      data: { temperatureChart: { userId: 'user-abc', unit: 'CELSIUS', range: 'WEEK', dataPoints: MOCK_DATA_POINTS } },
      loading: false, error: undefined, networkStatus: NetworkStatus.ready, refetch: vi.fn(),
    } as never);
    renderChart();
    expect(screen.getByTestId('temperature-chart-data')).toBeInTheDocument();
    expect(screen.getByText('\u00b0C')).toBeInTheDocument();
  });

  it('renders empty state message when dataPoints is empty', () => {
    mockUseTemperatureChart.mockReturnValue({
      data: { temperatureChart: { userId: 'user-abc', unit: 'CELSIUS', range: 'WEEK', dataPoints: [] } },
      loading: false, error: undefined, networkStatus: NetworkStatus.ready, refetch: vi.fn(),
    } as never);
    renderChart();
    expect(screen.getByText('No temperature data available for the selected period')).toBeInTheDocument();
  });

  it('renders error boundary with retry button on fetch error', () => {
    const refetch = vi.fn();
    mockUseTemperatureChart.mockReturnValue({
      data: undefined, loading: false, error: new Error('Network error'),
      networkStatus: NetworkStatus.error, refetch,
    } as never);
    renderChart();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('updates URL search param when user selects a range', () => {
    mockUseTemperatureChart.mockReturnValue({
      data: { temperatureChart: { userId: 'user-abc', unit: 'CELSIUS', range: 'WEEK', dataPoints: MOCK_DATA_POINTS } },
      loading: false, error: undefined, networkStatus: NetworkStatus.ready, refetch: vi.fn(),
    } as never);
    renderChart();
    fireEvent.click(screen.getByRole('button', { name: 'Month' }));
    expect(screen.getByRole('button', { name: 'Month' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows loading overlay over existing data during range switch', () => {
    mockUseTemperatureChart.mockReturnValue({
      data: { temperatureChart: { userId: 'user-abc', unit: 'CELSIUS', range: 'WEEK', dataPoints: MOCK_DATA_POINTS } },
      loading: true, error: undefined, networkStatus: NetworkStatus.setVariables, refetch: vi.fn(),
    } as never);
    renderChart();
    expect(screen.getByTestId('temperature-chart-data')).toBeInTheDocument();
    expect(screen.getByLabelText('Updating chart')).toBeInTheDocument();
  });
});
