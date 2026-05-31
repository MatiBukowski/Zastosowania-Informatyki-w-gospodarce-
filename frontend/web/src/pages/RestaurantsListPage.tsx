import { useEffect, useState } from 'react';
import { useAuth } from '../services/AuthProvider';
import { getRestaurants, getRestaurantsByUser } from '../api/RestaurantAPI';
import { fetchAll } from '../api/PaginationHelper';
import { IRestaurant } from '../context/interfaces';
import {
  Box, Typography, Select,
  MenuItem, FormControl, InputLabel
} from '@mui/material';
import { usePostHog } from '@posthog/react';
import RestaurantModifyPanel from '../components/RestaurantModifyPanel';

export const RestaurantListPage = () => {
  const { role, isAxiosReady } = useAuth();
  const posthog = usePostHog();
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | "">("");

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

  const handleClosePanel = () => {
    setSelectedRestaurantId("");
  };

  return (
    <Box sx={pageStyles.container}>
      <Typography variant="h4" sx={pageStyles.header}>
        Restaurant Management
      </Typography>

      {isAdmin && (
            <>
              <FormControl fullWidth sx={pageStyles.selectWrapper}>
                <InputLabel id="restaurant-select-label">Select Restaurant to modify</InputLabel>
                <Select
                    labelId="restaurant-select-label"
                    value={selectedRestaurantId}
                    label="Select Restaurant to modify"
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
          <RestaurantModifyPanel 
            restaurantId={selectedRestaurantId as number} 
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