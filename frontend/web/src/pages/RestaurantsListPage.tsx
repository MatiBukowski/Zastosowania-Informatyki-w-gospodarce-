import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthProvider';
import { getRestaurants, getRestaurantsByUser } from '../api/RestaurantAPI';
import { fetchAll } from '../api/PaginationHelper';
import { IRestaurant } from '../context/interfaces';
import { Button, Box, Typography, Divider } from '@mui/material';
import { usePostHog } from '@posthog/react';

export const RestaurantListPage = () => {
  const { role, isAxiosReady } = useAuth();
  const navigate = useNavigate();
  const posthog = usePostHog();
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);

  const isAdmin = role === "ADMIN";

  useEffect(() => {
    if (!isAxiosReady) return;

    const fetchRestaurantsData = async () => {
      try {
        let data;
        if (isAdmin) {
          data = await fetchAll((page, size) => getRestaurants(page, size));
        } else {
          data = await fetchAll((page, size) => getRestaurantsByUser(page, size));
        }
        setRestaurants(data);
        
        posthog.capture('restaurant_list_viewed', {
          is_admin: isAdmin,
          count: data.length
        });
      } catch (err) {
        console.error(err);
        posthog.capture('failed_restaurant_list_view');
      }
    };

    fetchRestaurantsData();
  }, [isAdmin, isAxiosReady, posthog]);

  const handleModifyClick = (restaurantId: number) => {
    posthog.capture('restaurant_modify_clicked', { restaurant_id: restaurantId });
    navigate(`/restaurants/modify/${restaurantId}`);
  };

  return (
    <Box sx={pageStyles.container}>
      <Typography variant="h4" sx={pageStyles.header}>
        Zarządzanie Restauracjami
      </Typography>

      {restaurants.length === 0 ? (
        <Typography sx={pageStyles.noDataText}>Brak restauracji do wyświetlenia</Typography>
      ) : (
        <>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
            Lista restauracji ({restaurants.length})
          </Typography>
          <Divider sx={{ mb: 4 }} />

          <Box sx={pageStyles.grid}>
            {restaurants.map((restaurant) => (
              <Box key={restaurant.restaurant_id} sx={pageStyles.restaurantCard}>     
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, zIndex: 1, width: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 0.5 }}>
                    {restaurant.name}
                  </Typography>
                </Box>

                <Box sx={{ mt: 'auto', zIndex: 1, width: '100%' }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    onClick={() => handleModifyClick(restaurant.restaurant_id)}
                  >
                    Modyfikuj
                  </Button>
                </Box>
                
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

const pageStyles = {
  container: { p: 4 },
  header: { mb: 4, fontWeight: 'bold', color: 'primary.main' },
  noDataText: { mt: 2, color: 'text.secondary' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: 3 },
  restaurantCard: {
    p: 3,
    border: '1px solid #e0e0e0',
    borderRadius: 2,
    bgcolor: 'background.paper',
    width: 320,
    minHeight: 280, // Zwiększono, aby pomieścić zdjęcie
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Pomaga w wyrównaniu elementów
    position: 'relative',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    '&:hover': {
      boxShadow: 3,
      borderColor: 'primary.light',
    }
  },
  restaurantImage: {
    width: '100%',
    height: 140,
    objectFit: 'cover',
    borderRadius: 1,
    mb: 2,
  },
  placeholderImage: {
    width: '100%',
    height: 140,
    bgcolor: 'grey.100',
    borderRadius: 1,
    mb: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'text.secondary',
  },
  backgroundNumber: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    fontWeight: 900,
    color: 'text.primary',
    opacity: 0.05,
    lineHeight: 1,
    pointerEvents: 'none',
    zIndex: 0,
  }
};