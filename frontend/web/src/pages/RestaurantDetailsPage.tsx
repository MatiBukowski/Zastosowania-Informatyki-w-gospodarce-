import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Button, CircularProgress,
    Alert, Chip, Divider, Stack, Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRestaurantDetails } from '../hooks/useRestaurants';

export const RestaurantDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { restaurant, loading, error } = useRestaurantDetails(Number(id));

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !restaurant) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="error">{error ?? 'Restaurant not found.'}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
                    Back to list
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2 }}>
                Back to list
            </Button>

            <Paper elevation={2} sx={{ overflow: 'hidden', borderRadius: 2 }}>
                {restaurant.photo && (
                    <Box
                        component="img"
                        src={restaurant.photo}
                        alt={restaurant.name}
                        sx={{ width: '100%', height: 220, objectFit: 'cover' }}
                    />
                )}

                <Box sx={{ p: 3 }}>
                    <Typography variant="h4" gutterBottom>{restaurant.name}</Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        {restaurant.address}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip label={restaurant.cuisine} color="primary" variant="outlined" />
                        {restaurant.has_kiosk && <Chip label="Kiosk available" color="success" />}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" gutterBottom>Actions</Typography>
                    <Stack spacing={2}>
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={() => navigate(`/restaurants/${restaurant.restaurant_id}/reservation`)}
                        >
                            Reserve a table
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            fullWidth
                            onClick={() => navigate(`/restaurants/${restaurant.restaurant_id}/menu`)}
                        >
                            See menu
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </Container>
    );
};