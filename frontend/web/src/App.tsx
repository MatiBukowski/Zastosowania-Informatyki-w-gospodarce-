import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { theme } from '../theme/theme';
import { HomePage } from './pages/HomePage';
import { RestaurantDetailsPage } from './pages/RestaurantDetailsPage';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
                    {/* Placeholder routes */}
                    <Route path="/restaurants/:id/reservation" element={<div>Reservation — coming soon</div>} />
                    <Route path="/restaurants/:id/menu" element={<div>Menu — coming soon</div>} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;