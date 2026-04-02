import { createTheme } from '@mui/material/styles';
import { colors } from './palette';

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.strawberryRed, 
    },
    secondary: {
      main: colors.fern, 
    },
    background: {
      default: colors.seashell, 
      paper: '#ffffff',          
    },
    text: {
      primary: colors.carbonBlack,
    }
  },
  shape: {
    borderRadius: 16, 
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 800,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', 
          fontWeight: 600,
        },
      },
    },
  },
});