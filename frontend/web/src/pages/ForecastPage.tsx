import { useEffect, useState, useMemo, useRef } from 'react';
import { getRestaurants } from '../api/RestaurantAPI';
import { getForecast } from '../api/ForecastAPI';
import { IRestaurant, IForecastData } from '../context/interfaces';
import { useAuth } from '../services/AuthProvider';
import {
  Select, MenuItem, FormControl, InputLabel,
  Box, Typography, CircularProgress, Paper, Stack, Divider,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { usePostHog } from '@posthog/react';

/** Returns the pixel width of a DOM element, updating on resize. */
function useElementWidth(ref: React.RefObject<HTMLElement>) {
  const [width, setWidth] = useState(800);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);

  return width;
}

export const ForecastPage = () => {
  const { isAxiosReady } = useAuth();
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | ''>('');
  const [forecastData, setForecastData] = useState<IForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartWidth = useElementWidth(chartContainerRef);
  const posthog = usePostHog();

  useEffect(() => {
    if (isAxiosReady) {
      getRestaurants().then(setRestaurants).catch(console.error);
    }
  }, [isAxiosReady]);

  useEffect(() => {
    if (isAxiosReady && selectedRestaurantId !== '') {
      setLoading(true);
      setForecastData(null);
      getForecast(selectedRestaurantId as number)
        .then((data) => {
          setForecastData(data);
          posthog.capture('restaurant_forecast_viewed', {
            restaurant_id: selectedRestaurantId,
          });
        })
        .catch((err) => {
          console.error(err);
          posthog.capture('failed_restaurant_forecast_view', {
            restaurant_id: selectedRestaurantId,
          });
        })
        .finally(() => setLoading(false));
    }
  }, [selectedRestaurantId, posthog, isAxiosReady]);

  const chartData = useMemo(() => {
    if (!forecastData) return { xAxis: [], series: [] };

    // Historical: last 30 points
    const historicalPoints = forecastData.historical.slice(-30);
    const historicalX = historicalPoints.map((p) => new Date(p[0]));
    const historicalY = historicalPoints.map((p) => p[1]);

    // Forecast mean
    const forecastY = forecastData.forecast[0];

    // Generate forecast X dates (daily intervals after last historical point)
    const lastDate = historicalX[historicalX.length - 1];
    const forecastX = forecastY.map((_, i) => {
      const d = new Date(lastDate);
      d.setDate(d.getDate() + i + 1);
      return d;
    });

    const combinedX = [...historicalX, ...forecastX];
    const nullPad = (arr: (number | null)[]) => arr;

    // Historical series — null for forecast range
    const historicalSeries = nullPad([
      ...historicalY,
      ...forecastX.map(() => null),
    ]);

    // Forecast mean series — connect from last historical value
    const forecastMeanSeries = nullPad([
      ...historicalY.map((v, i) => (i === historicalY.length - 1 ? v : null)),
      ...forecastY,
    ]);

    // 90th percentile band:
    // quantile_forecast[0] has 12 time steps; each step has 10 quantile levels.
    // Index 0 = p5 (lower bound), Index 9 = p95 (upper bound) → ~90% interval.
    const qSteps = forecastData.quantile_forecast[0]; // length = 12

    const forecastP5Series = nullPad([
      ...historicalY.map((v, i) => (i === historicalY.length - 1 ? v : null)),
      ...qSteps.map((step) => step[0]),   // p5
    ]);

    const forecastP95Series = nullPad([
      ...historicalY.map((v, i) => (i === historicalY.length - 1 ? v : null)),
      ...qSteps.map((step) => step[9]),   // p95
    ]);

    return {
      xAxis: combinedX,
      series: [
        {
          data: historicalSeries,
          label: 'Historical',
          color: '#1976d2',
          showMark: false,
          curve: 'linear' as const,
        },
        {
          data: forecastP95Series,
          label: 'upper bound',
          color: 'rgba(46,125,50,0.20)',
          showMark: false,
          curve: 'linear' as const,
          area: true,
          // Hide from legend — it's visual context, not a primary series
          hideLegend: true,
        },
        {
          data: forecastP5Series,
          label: 'lower bound',
          color: 'rgba(255,255,255,0)',  // transparent fill cancels out upper area
          showMark: false,
          curve: 'linear' as const,
          area: true,
          hideLegend: true,
          baseline: 'min' as const,
        },
        {
          data: forecastMeanSeries,
          label: 'Forecast (mean)',
          color: '#2e7d32',
          showMark: false,
          curve: 'linear' as const,
        },
      ],
    };
  }, [forecastData]);

  return (
    <Box sx={pageStyles.container}>
      <Typography variant="h4" sx={pageStyles.header}>
        Restaurant Demand Forecast
      </Typography>

      <FormControl fullWidth sx={pageStyles.selectWrapper}>
        <InputLabel id="restaurant-select-label">Select Restaurant</InputLabel>
        <Select
          labelId="restaurant-select-label"
          value={selectedRestaurantId}
          label="Select Restaurant"
          onChange={(e) => setSelectedRestaurantId(e.target.value as number)}
        >
          {restaurants.map((r) => (
            <MenuItem key={r.restaurant_id} value={r.restaurant_id}>
              {r.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {forecastData && (
        <>
          <Divider sx={{ mb: 3 }} />
          <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Forecast Visualization
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              Shaded area = possible error
            </Typography>
          </Stack>
          <Paper elevation={3} sx={{ p: 3 }}>
            {/* ref container fills Paper width; chart reads it */}
            <Box ref={chartContainerRef} sx={{ width: '100%' }}>
              <LineChart
                xAxis={[{
                  data: chartData.xAxis,
                  scaleType: 'time',
                  valueFormatter: (value) => (value as Date).toLocaleDateString(),
                }]}
                series={chartData.series}
                height={420}
                width={chartWidth}
                margin={{ left: 60, right: 40, top: 50, bottom: 60 }}
              />
            </Box>
          </Paper>
        </>
      )}

      {!loading && selectedRestaurantId !== '' && !forecastData && (
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>
          No forecast data available for this restaurant.
        </Typography>
      )}
    </Box>
  );
};

const pageStyles = {
  container: { p: 4 },
  header: { mb: 4, fontWeight: 'bold', color: 'primary.main' },
  selectWrapper: { mb: 4, maxWidth: 600 },
};