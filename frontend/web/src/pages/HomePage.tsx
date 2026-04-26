import { Container, Typography, Box, Button } from '@mui/material';
import { getProjectInfo } from '../context/constants';
import { getRestaurants } from '../api/RestaurantAPI';
import { useEffect } from 'react';
import { usePostHog } from '@posthog/react';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  const info = getProjectInfo(); // name and version
  const posthog = usePostHog();
  

  // console testing API connection 
  useEffect(() => {
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
  }, []);

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
        <Button variant="contained" component={Link} to="/qr" size="large"
            sx={{
                mt: 2,
                fontWeight: 'bold',
                px: 4
              }}
            >
            Manage QR Code
        </Button>
      </Box>
    </Container>
  );
};