import { CssBaseline, ThemeProvider } from '@mui/material';
import { HomePage } from './pages/HomePage';
import { TableQRPage } from './pages/TableQRPage'
import { ForecastPage } from './pages/ForecastPage';
import { RestaurantListPage } from './pages/RestaurantsListPage';
import { RestaurantModifyPage } from './pages/RestaurantModifyPage';
import { Routes, Route } from 'react-router-dom';
import Root from './Root';
import { LoginPage } from './pages/LoginPage';
import { SupportPage } from './pages/SupportPage';
import { AuthProvider } from './services/AuthProvider';
import { theme } from '../theme/theme';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <CssBaseline />
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<LoginPage/>}/>
            <Route path="/support" element={<SupportPage/>}/>
            <Route element={<Root isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>}>
              <Route path="/" element={<HomePage />} />
              <Route path="/qr" element={<ProtectedRoute requiredRoles={["ADMIN", "MANAGER", "OWNER"]}><TableQRPage /></ProtectedRoute>} />
              <Route path="/forecast" element={<ProtectedRoute requiredRoles={["ADMIN", "MANAGER", "OWNER"]}><ForecastPage /></ProtectedRoute>} />
              <Route path="/restaurants" element={<ProtectedRoute requiredRoles={["ADMIN", "MANAGER", "OWNER"]}><RestaurantListPage /></ProtectedRoute>} />
              <Route path="/restaurants/modify/:restaurantId" element={<ProtectedRoute requiredRoles={["ADMIN", "MANAGER", "OWNER"]}><RestaurantModifyPage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;