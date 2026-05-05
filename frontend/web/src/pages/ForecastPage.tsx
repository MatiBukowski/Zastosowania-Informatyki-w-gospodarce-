import { useEffect, useState, useMemo } from 'react';
import { getRestaurants } from '../api/RestaurantAPI';
import { getForecast, IForecastData } from '../api/ForecastAPI';
import { IRestaurant } from '../context/interfaces';
import { Select, MenuItem, FormControl, InputLabel, Box, Typography, CircularProgress, Paper, Stack, Divider } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { usePostHog } from '@posthog/react';

export const ForecastPage = () => {
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | ''>('');
  const [forecastData, setForecastData] = useState<IForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const posthog = usePostHog();

  useEffect(() => {
    getRestaurants().then(setRestaurants).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedRestaurantId !== '') {
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
          posthog.capture('failed_restaurant_forecast_view', { restaurant_id: selectedRestaurantId });
        })
        .finally(() => setLoading(false));
    }
  }, [selectedRestaurantId, posthog]);

  const chartData = useMemo(() => {
    if (!forecastData) return { xAxis: [], series: [] };

    // Historical data: last 30 points for better visibility
    const historicalPoints = forecastData.historical.slice(-30);
    const historicalX = historicalPoints.map(p => new Date(p[0]));
    const historicalY = historicalPoints.map(p => p[1]);

    // Forecast data
    const forecastY = forecastData.forecast[0];
    
    // Combine X axis
    // Forecast starts after the last historical point. We assume daily intervals as per historical data.
    const lastDate = historicalX[historicalX.length - 1];
    const forecastX = forecastY.map((_, i) => {
      const d = new Date(lastDate);
      d.setDate(d.getDate() + i + 1);
      return d;
    });

    const combinedX = [...historicalX, ...forecastX];

    // Prepare series
    // Historical series: values for historical dates, null for forecast dates
    const historicalSeries = [...historicalY, ...forecastX.map(() => null)];
    
    // Forecast series: last historical value then forecast values
    // To make it continuous, we start from the last historical point
    const forecastSeries = [
        ...historicalY.map((_, i) => i === historicalY.length - 1 ? historicalY[i] : null),
        ...forecastY
    ];

    return {
      xAxis: combinedX,
      series: [
        {
          data: historicalSeries,
          label: 'Historical',
          color: '#1976d2',
          showMark: true,
        },
        {
          data: forecastSeries,
          label: 'Forecast',
          color: '#2e7d32',
          showMark: true,
        }
      ]
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
            <MenuItem key={r.restaurant_id} value={r.restaurant_id}>{r.name}</MenuItem>
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
          </Stack>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ width: '100%', height: 400 }}>
              <LineChart
                xAxis={[{ 
                  data: chartData.xAxis, 
                  scaleType: 'time',
                  valueFormatter: (value) => value.toLocaleDateString(),
                }]}
                series={chartData.series}
                height={400}
                margin={{ left: 50, right: 50, top: 50, bottom: 50 }}
              />
            </Box>
          </Paper>
        </>
      )}

      {!loading && selectedRestaurantId !== '' && !forecastData && (
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>No forecast data available for this restaurant.</Typography>
      )}
    </Box>
  );
};

const pageStyles = {
  container: { p: 4 },
  header: { mb: 4, fontWeight: 'bold', color: 'primary.main' },
  selectWrapper: { mb: 4, maxWidth: 600 },
};
