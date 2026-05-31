import { useEffect, useState } from 'react';
import { useAuth } from '../services/AuthProvider';
import { ISingleRestaurant, IRestaurantSchedule, CuisineType, DayOfWeek } from '../context/interfaces';
import { getSingleRestaurantById, updateRestaurant } from '../api/RestaurantAPI'; 
import {
  Button, Box, Typography, Divider,
  MenuItem, Grid, Paper,
  FormControlLabel, Switch, CircularProgress, Alert
} from '@mui/material';
import TextField from '@mui/material/TextField';
import { usePostHog } from '@posthog/react';

const ALL_DAYS: DayOfWeek[] = [
  "MONDAY" as DayOfWeek, "TUESDAY" as DayOfWeek, "WEDNESDAY" as DayOfWeek, 
  "THURSDAY" as DayOfWeek, "FRIDAY" as DayOfWeek, "SATURDAY" as DayOfWeek, "SUNDAY" as DayOfWeek
];

interface ModifyPanelProps {
  restaurantId: number;
  onClose: () => void;
}

const RestaurantModifyPanel = ({ restaurantId, onClose }: ModifyPanelProps) => {
  const { isAxiosReady } = useAuth();
  const posthog = usePostHog();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [formData, setFormData] = useState<ISingleRestaurant>({
    name: '', city: '', street: '', building_number: '', postal_code: '',
    phone_number: '', has_kiosk: false, photo: '', cuisine: CuisineType.OTHER,
    schedules: [], description: ''
  });

  useEffect(() => {
    if (!isAxiosReady || !restaurantId) return;

    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);
        const data = await getSingleRestaurantById(restaurantId);

        const fetchedSchedules = data.schedules || [];
        const completeSchedules = ALL_DAYS.map(day => {
          const existingDay = fetchedSchedules.find(s => s.day_of_week === day);
          return existingDay || { day_of_week: day, open_time: '', close_time: '' };
        });

        setFormData({
          name: data.name || '',
          city: data.city || '',
          street: data.street || '',
          building_number: data.building_number || '',
          postal_code: data.postal_code || '',
          phone_number: data.phone_number || '',
          has_kiosk: data.has_kiosk || false,
          cuisine: data.cuisine || CuisineType.OTHER,
          photo: data.photo || '',
          schedules: completeSchedules,
          description: data.description || ''
        });

        posthog.capture('restaurant_modify_viewed', { restaurant_id: restaurantId });
      } catch (err) {
        console.error("Error while fetching restaurant details:", err);
        setError("Błąd podczas ładowania danych restauracji.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [restaurantId, isAxiosReady, posthog]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'postal_code') {
      const digits = value.replace(/\D/g, '');
      if (digits.length > 2) {
        newValue = `${digits.slice(0, 2)}-${digits.slice(2, 5)}`;
      } else {
        newValue = digits;
      }
    } else if (name === 'phone_number') {
      newValue = value.replace(/[^\d+]/g, '').slice(0, 12);
      if (newValue.length > 12) return;
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleScheduleChange = (index: number, field: keyof IRestaurantSchedule, value: string) => {
    const updatedSchedules = [...formData.schedules];
    updatedSchedules[index] = { ...updatedSchedules[index], [field]: value };
    setFormData(prev => ({ ...prev, schedules: updatedSchedules }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const payload = {
        ...formData,
        schedules: formData.schedules.filter(
          (schedule) => schedule.open_time !== '' && schedule.close_time !== ''
        )
      };

      await updateRestaurant(restaurantId, payload);
      
      setSuccess(true);
      posthog.capture('restaurant_modified_success', { restaurant_id: restaurantId });
      
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setSuccess(false);
      }, 2000);

    } catch (err) {
      console.error("Error saving changes:", err);
      setError("Nie udało się zapisać zmian. Spróbuj ponownie.");
      posthog.capture('restaurant_modified_error', { restaurant_id: restaurantId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            <Box component="span" sx={{ color: 'primary.main' }}>
                You are editing:{" "}
            </Box>
            <Box component="span" sx={{ color: 'text.primary' }}>
                {formData.name}
            </Box>
        </Typography>
        <Button variant="outlined" color="error" onClick={onClose}>
            Close modification panel
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>Changes saved successfully!</Alert>}

      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {/* Informacje Główne */}
          <Grid size={12}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>Basic Information</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Restaurant Name" name="name" value={formData.name} onChange={handleInputChange} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField 
              select
              fullWidth 
              label="Cuisine Type" 
              name="cuisine" 
              value={formData.cuisine} 
              onChange={handleInputChange}
            >
              {Object.values(CuisineType).map((cuisineOption) => (
                <MenuItem key={cuisineOption} value={cuisineOption}>
                    {cuisineOption}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleInputChange} placeholder="+48123456789"/>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControlLabel 
              control={<Switch checked={formData.has_kiosk} onChange={handleSwitchChange} name="has_kiosk" color="primary" />} 
              label="Has Offer Kiosk" 
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid size={12}>
            <TextField 
              fullWidth 
              multiline 
              rows={4} 
              label="Description" 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
            />
          </Grid>

          {/* Adres */}
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>Address</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleInputChange} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Postal Code" name="postal_code" value={formData.postal_code} onChange={handleInputChange} placeholder="00-000"/>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField fullWidth label="Street" name="street" value={formData.street} onChange={handleInputChange} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Building Number" name="building_number" value={formData.building_number} onChange={handleInputChange} />
          </Grid>

          {/* Godziny Otwarcia*/}
          <Grid size={12} sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>Opening hours</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {formData.schedules.map((schedule, index) => (
            <Grid size={12} key={index}>
              <Grid container spacing={2} sx = {{ alignItems: "center" }}>
                <Grid size={4}>
                  <Typography sx={{ fontWeight: 'bold' }}>{schedule.day_of_week}</Typography>
                </Grid>
                <Grid size={4}>
                  <TextField 
                    fullWidth 
                    type="time" 
                    label="Opening" 
                    slotProps={{
                        inputLabel: { shrink: true },
                        htmlInput: { step: 300 }
                    }}
                    value={schedule.open_time || ''} 
                    onChange={(e) => handleScheduleChange(index, 'open_time', e.target.value)} 
                  />
                </Grid>
                <Grid size={4}>
                  <TextField 
                    fullWidth 
                    type="time" 
                    label="Closing" 
                    slotProps={{
                        inputLabel: { shrink: true },
                        htmlInput: { step: 300 }
                    }}
                    value={schedule.close_time || ''} 
                    onChange={(e) => handleScheduleChange(index, 'close_time', e.target.value)} 
                  />
                </Grid>
              </Grid>
            </Grid>
          ))}

          {/* Przycisk Zapisz */}
          <Grid size={12} sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="success" 
              size="large" 
              onClick={handleSave} 
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} color="inherit" /> : 'Save'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default RestaurantModifyPanel;