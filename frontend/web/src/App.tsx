import { Button, Container, Typography, Box, ThemeProvider, CssBaseline } from '@mui/material';
import { getProjectInfo } from 'frontend-shared/api/API'; 
import { theme } from './theme';

function App() {
  const info = getProjectInfo();

  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />

        <Container maxWidth="sm">
            <Box sx={{ my: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom color="primary">
                {info.name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                <b>Version:</b> {info.version}
                </Typography>
                <Button variant="contained" onClick={() => alert('The button works!')}>
                Click
                </Button>
            </Box>
        </Container>
    </ThemeProvider>
  );
}

export default App;