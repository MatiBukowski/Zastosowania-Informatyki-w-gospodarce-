import { Box, Typography } from "@mui/material";
import BlockIcon from '@mui/icons-material/Block';

export const UnauthorizedPage = () => {
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
        <BlockIcon sx={{ fontSize: 80, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 400 }}>
          You don't have the required permissions to access this page. Please contact an administrator if you believe this is an error.
        </Typography>
      </Box>
    </Box>
  );
};
