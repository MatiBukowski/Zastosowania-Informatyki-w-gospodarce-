import { createTheme } from '@mui/material/styles';
import { getProjectInfo } from 'frontend-shared/api/API';

const info = getProjectInfo();
const myColors = info.palette;

export const theme = createTheme({
  palette: {
    primary: {
      main: myColors.strawberryRed, 
    },
    secondary: {
      main: myColors.fern, 
    },
    background: {
      default: myColors.seashell, 
      paper: '#ffffff',          
    },
    text: {
      primary: myColors.carbonBlack,
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