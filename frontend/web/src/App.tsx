import { CssBaseline, ThemeProvider } from '@mui/material';
import { HomePage } from './pages/HomePage';
import { TableQRPage } from './pages/TableQRPage'
import { Routes, Route } from 'react-router-dom';
import Root from './Root';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider } from './services/AuthProvider';
import { theme } from '../theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<LoginPage/>}/>
          <Route element={<Root/>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/qr" element={<TableQRPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;