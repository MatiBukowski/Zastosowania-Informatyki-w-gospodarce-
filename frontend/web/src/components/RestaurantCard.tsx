import { Card, CardActionArea, CardContent, CardMedia, Typography, Chip, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IRestaurant } from '../context/interfaces';

interface Props {
    restaurant: IRestaurant;
}

export const RestaurantCard = ({ restaurant }: Props) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/restaurants/${restaurant.restaurant_id}`);
    };

    return (
        <Card sx={{ mb: 2 }} onClick={handleClick}>
            <CardActionArea>
                {restaurant.photo && (
                    <CardMedia
                        component="img"
                        height="160"
                        image={restaurant.photo}
                        alt={restaurant.name}
                    />
                )}
                <CardContent>
                    <Typography variant="h6">{restaurant.name}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {restaurant.address}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Chip label={restaurant.cuisine} size="small" color="primary" variant="outlined" />
                        {restaurant.has_kiosk && <Chip label="Kiosk available" size="small" color="success" />}
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};