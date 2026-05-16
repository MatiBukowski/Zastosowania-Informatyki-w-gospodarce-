import { Container, Typography, Box } from '@mui/material';
import { getProjectInfo } from '../context/constants';

export const HomePage = () => {
  const info = getProjectInfo(); // name and version

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
      </Box>
    </Container>
  );
};