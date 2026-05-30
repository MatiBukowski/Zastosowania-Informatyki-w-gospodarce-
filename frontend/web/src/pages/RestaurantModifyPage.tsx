import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthProvider';
import { ISingleRestaurant, IRestaurantSchedule, CuisineType, DayOfWeek } from '../context/interfaces';
import { getSingleRestaurantById } from '../api/RestaurantAPI'; 
import { 
  Box, Typography, TextField, Button, Grid, Paper, 
  FormControlLabel, Switch, Divider, CircularProgress, Alert
} from '@mui/material';
import { usePostHog } from '@posthog/react';

export const RestaurantModifyPage = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const { isAxiosReady } = useAuth();
  const posthog = usePostHog();

  // Stany komponentu
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Stan formularza z domyślnymi, pustymi wartościami, aby uniknąć błędów Reacta
  const [formData, setFormData] = useState<ISingleRestaurant>({
    name: '',
    city: '',
    street: '',
    building_number: '',
    postal_code: '',
    phone_number: '',
    has_kiosk: false,
    photo: '',
    cuisine: CuisineType.OTHER,
    schedules: [],
    description: ''
  });

  // 1. Pobieranie danych restauracji przy starcie
  useEffect(() => {
    if (!isAxiosReady || !restaurantId) return;

    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);
        const data = await getSingleRestaurantById(Number(restaurantId));
        console.log("Fetched restaurant details:", data);
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
          schedules: data.schedules || [],
          description: data.description || ''
        });
        
        posthog.capture('restaurant_modify_viewed', { restaurant_id: restaurantId });
      } catch (err) {
        console.error("Error while fetching restaurant details:", err);
        setError("Error while loading restaurant details. Please try again.");
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
      // Usuń wszystko co nie jest cyfrą
      const digits = value.replace(/\D/g, '');
      // Dodaj myślnik po drugich znaku (format XX-XXX)
      if (digits.length > 2) {
        newValue = `${digits.slice(0, 2)}-${digits.slice(2, 5)}`;
      } else {
        newValue = digits;
      }
    } else if (name === 'phone_number') {
      newValue = value.replace(/[^\d+ ]/g, '');
      if (newValue.length > 15) return;
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

  // 5. Zapisywanie danych do bazy
  const handleSave = async () => {
    if (!restaurantId) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

    //   await updateRestaurant(Number(restaurantId), formData);
      
      setSuccess(true);
      posthog.capture('restaurant_modified_success', { restaurant_id: restaurantId });
      
      // Opcjonalnie: Powrót do listy po 2 sekundach
      setTimeout(() => navigate('/restaurants'), 2000);
      
    } catch (err) {
      console.error("Error saving changes:", err);
      setError("Error while saving changes. Please try again.");
      posthog.capture('restaurant_modified_error', { restaurant_id: restaurantId });
    } finally {
      setSaving(false);
    }
  };

  const handleAddDefaultSchedules = () => {
    // Generujemy 7 pustych dni. Dopasuj wartości day_of_week do swojego enuma DayOfWeek
    const defaultSchedules: IRestaurantSchedule[] = [
      { day_of_week: "MONDAY" as DayOfWeek, open_time: '', close_time: '' },
      { day_of_week: "TUESDAY" as DayOfWeek, open_time: '', close_time: '' },
      { day_of_week: "WEDNESDAY" as DayOfWeek, open_time: '', close_time: '' },
      { day_of_week: "THURSDAY" as DayOfWeek, open_time: '', close_time: '' },
      { day_of_week: "FRIDAY" as DayOfWeek, open_time: '', close_time: '' },
      { day_of_week: "SATURDAY" as DayOfWeek, open_time: '', close_time: '' },
      { day_of_week: "SUNDAY" as DayOfWeek, open_time: '', close_time: '' },
    ];
    
    setFormData(prev => ({ ...prev, schedules: defaultSchedules }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Edycja Restauracji
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/restaurants')}>
          Wróć
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>Zmiany zostały zapisane pomyślnie!</Alert>}

      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {/* Informacje Główne */}
          <Grid size={12}>
            <Typography variant="h6" color="text.secondary">Informacje Podstawowe</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Nazwa Restauracji" name="name" value={formData.name} onChange={handleInputChange} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Rodzaj Kuchni (Cuisine)" name="cuisine" value={formData.cuisine} onChange={handleInputChange} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Numer Telefonu" name="phone_number" value={formData.phone_number} onChange={handleInputChange} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControlLabel 
              control={<Switch checked={formData.has_kiosk} onChange={handleSwitchChange} name="has_kiosk" color="primary" />} 
              label="Posiada Kiosk Ofertowy" 
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid size={12}>
            <TextField 
              fullWidth 
              multiline 
              rows={4} 
              label="Opis Restauracji" 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
            />
          </Grid>

          {/* Adres */}
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography variant="h6" color="text.secondary">Adres</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Miasto" name="city" value={formData.city} onChange={handleInputChange} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Kod Pocztowy" name="postal_code" value={formData.postal_code} onChange={handleInputChange} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField fullWidth label="Ulica" name="street" value={formData.street} onChange={handleInputChange} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="Numer Budynku" name="building_number" value={formData.building_number} onChange={handleInputChange} />
          </Grid>

          {/* Godziny Otwarcia (Schedules) */}
          <Grid size={12} sx={{ mt: 2 }}>
            <Typography variant="h6" color="text.secondary">Godziny Otwarcia</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {formData.schedules.length === 0 ? (
            <Grid size={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Brak zdefiniowanych godzin otwarcia dla tego lokalu.
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleAddDefaultSchedules}
              >
                Ustaw godziny otwarcia
              </Button>
            </Grid>
          ) : (
            formData.schedules.map((schedule, index) => (
              <Grid size={12} key={index}>
                <Grid container spacing={2}>
                    <Grid size={4}>
                        <Typography sx={{ fontWeight: 'bold' }}>{schedule.day_of_week}</Typography>
                    </Grid>
                    <Grid size={4}>
                        <TextField 
                            fullWidth 
                            type="time" 
                            label="Otwarcie" 
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
                            label="Zamknięcie" 
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
            ))
          )}

          {/* Przycisk Zapisz */}
          <Grid size={12} sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="success" 
              size="large" 
              onClick={handleSave} 
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} color="inherit" /> : 'Zapisz Zmiany'}
            </Button>
          </Grid>
          
        </Grid>
      </Paper>
    </Box>
  );
};