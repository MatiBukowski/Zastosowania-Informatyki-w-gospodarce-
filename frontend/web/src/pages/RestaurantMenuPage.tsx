import { useEffect, useState } from 'react';
import { useAuth } from '../services/AuthProvider';
import { getRestaurants } from '../api/RestaurantAPI';
import { fetchAll } from '../api/PaginationHelper';
import { IRestaurant } from '../context/interfaces';
import {
  Box, Typography, Select,
  MenuItem, FormControl, InputLabel
} from '@mui/material';
import { usePostHog } from '@posthog/react';
import RestaurantMenuModifyPanel from '../components/RestaurantMenuModifyPanel';
import { useSearchParams } from 'react-router-dom';

export const RestaurantMenuPage = () => {
  const { role, isAxiosReady } = useAuth();
  const posthog = usePostHog();
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | "">("");

  const [searchParams] = useSearchParams();
  const urlRestaurantId = searchParams.get('restaurantId');

  const isAdmin = role === "ADMIN";

  useEffect(() => {
    if (!role || isAdmin || !isAxiosReady) return;

    if (urlRestaurantId) {
      const id = parseInt(urlRestaurantId, 10);
      if (!isNaN(id)) {
        setSelectedRestaurantId(id);
      }
    }
  }, [role, isAdmin, urlRestaurantId, isAxiosReady]);

  useEffect(() => {
    if (!isAdmin || !isAxiosReady) return;

    fetchAll((page, size) => getRestaurants(page, size))
      .then((res) => {
        setRestaurants(res);
        posthog.capture('menu_list_viewed', { is_admin: true, count: res.length });
      })
      .catch((err) => {
        console.error(err);
        posthog.capture('failed_menu_list_view');
      });
  }, [isAdmin, isAxiosReady, posthog]);

  const handleClosePanel = () => {
    setSelectedRestaurantId("");
  };

  return (
    <Box sx={pageStyles.container}>
      <Typography variant="h4" sx={pageStyles.header}>
        Menu Management
      </Typography>

      {isAdmin && (
            <>
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
            </>
        )}

        {selectedRestaurantId !== "" && (
          <RestaurantMenuModifyPanel 
            restaurantId={selectedRestaurantId as number}
            restaurantName={restaurants.find(r => r.restaurant_id === selectedRestaurantId)?.name || "Unknown"} 
            onClose={handleClosePanel} 
          />
      )}
    </Box>
  );
};

const pageStyles = {
  container: { p: 4 },
  header: { mb: 4, fontWeight: 'bold', color: 'primary.main' },
  noDataText: { mt: 2, color: 'text.secondary' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: 3 },
  selectWrapper: { mb: 4, maxWidth: 600 }
};