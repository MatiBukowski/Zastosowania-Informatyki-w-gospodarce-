import { Box, Typography } from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link } from 'react-router-dom';

export const LockedPage = () => {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%',
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 2
      }}>
        <LockOutlinedIcon sx={{ fontSize: 80, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          This route is protected
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 400 }}>
          Please{' '}
          <Link to="/auth" style={{ 
            color: '#E54B4B', 
            textDecoration: 'none',
            fontWeight: 600,
            borderBottom: '2px solid #E54B4B'
          }}>
            log in
          </Link>
          {' '}or contact support to unlock it
        </Typography>
      </Box>
    </Box>
  );
};

