import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useRestaurants } from '../hooks/useRestaurants';
import { RestaurantCard } from '../components/RestaurantCard';

export const HomePage = () => {
  const { restaurants, loading, error } = useRestaurants();

  return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Restaurants
        </Typography>

        {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && restaurants.map((r) => (
            <RestaurantCard key={r.restaurant_id} restaurant={r} />
        ))}

        {!loading && !error && restaurants.length === 0 && (
            <Typography color="text.secondary">No restaurants found.</Typography>
        )}
      </Container>
  );
};