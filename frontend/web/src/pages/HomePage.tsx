import { Container, Typography, Box, Button } from '@mui/material';
import { getProjectInfo } from '../context/constants';
import { getRestaurants } from '../api/RestaurantAPI';
import { useAuth } from '../services/AuthProvider';
import { useEffect } from 'react';
import { usePostHog } from '@posthog/react';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  const { isAxiosReady } = useAuth();
  const info = getProjectInfo(); // name and version
  const posthog = usePostHog();
  

  // console testing API connection 
  useEffect(() => {
    if (isAxiosReady) {
      console.log("Connecting to API...");
      getRestaurants()
        .then(data => {
          console.log("API data:", data);
          posthog.capture('restaurants_fetched', { count: data.length });
        })
        .catch(err => {
          console.error("Error connecting to API.", err);
          posthog.capture('restaurants_fetch_failed', { error: err.message });
        });
    }
  }, [isAxiosReady, posthog]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        my: 4, 
        textAlign: 'center', 
        border: '1px solid', 
        borderColor: 'divider', 
        p: 3, 
        borderRadius: 2 
      }}>
        <Typography variant="h4" color="primary" gutterBottom>
          {info.name}
        </Typography>
        <Typography variant="body1">
          <b>Version:</b> {info.version}
        </Typography>
      </Box>
    </Container>
  );
};