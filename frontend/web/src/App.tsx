import { CssBaseline, ThemeProvider } from '@mui/material';
import { HomePage } from './pages/HomePage';
import { TableQRPage } from './pages/TableQRPage'
import { ForecastPage } from './pages/ForecastPage';
import { Routes, Route } from 'react-router-dom';
import Root from './Root';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider } from './services/AuthProvider';
import { theme } from '../theme/theme';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useState } from 'react';

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<LoginPage/>}/>
          <Route element={<Root isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/qr" element={<ProtectedRoute requiredRoles={["ADMIN", "MANAGER", "OWNER"]}><TableQRPage /></ProtectedRoute>} />
<<<<<<< HEAD
            <Route path="/forecast" element={<ProtectedRoute requiredRoles={["ADMIN", "MANAGER", "OWNER"]}><ForecastPage /></ProtectedRoute>} />
=======
>>>>>>> e512ad5 (Fix 'access denied' issue)
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;