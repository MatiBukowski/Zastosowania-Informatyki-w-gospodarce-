import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '../theme/theme';
import { HomePage} from './pages/HomePage';
import { TableQRPage } from './pages/TableQRPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/qr" element={<TableQRPage />} />
          </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;