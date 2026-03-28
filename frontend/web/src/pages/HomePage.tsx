import { Container, Typography, Box, Button } from '@mui/material';
import { getProjectInfo } from 'frontend-shared/context/constants';
import { getRestaurants } from 'frontend-shared/api/API'; 
import { useEffect } from 'react';

export const HomePage = () => {
  const info = getProjectInfo(); // name and version
  

  // console testing API connection 
  useEffect(() => {
    console.log("Connecting to API...");
    getRestaurants()
      .then(data => {
        console.log("API data:", data);
      })
      .catch(err => {
        console.error("Error connecting to API.", err);
      });
  }, []);

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        my: 4, 
        textAlign: 'center', 
        border: '1px solid', 
        borderColor: 'divider', 
        p: 3, 
        borderRadius: 2 
      }}>
        <Typography variant="h4" color="primary" gutterBottom>
          {info.name}
        </Typography>
        <Typography variant="body1">
          <b>Version:</b> {info.version}
        </Typography>
        <Button variant="contained" sx={{ mt: 2 }}>
          Button
        </Button>
      </Box>
    </Container>
  );
};