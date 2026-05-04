import { Box, IconButton, Stack, Typography } from "@mui/material";
import QrCodeIcon from '@mui/icons-material/QrCode';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { colors } from '../../../theme/palette';
import { useAuth } from '../../services/AuthProvider';

const dividerTextStyle = {
  textAlign: 'left',
  padding: '5px',
  fontFamily: 'Roboto',
  fontWeight: 600,
  fontStyle: 'thin',
  fontSize: '13px',
  color: 'Gray',
};

const DividerText = ({ label }: { label: string }) => {
  return (
    <Typography variant='body2' sx={dividerTextStyle}>
      {label}
    </Typography>
  );
};

interface SideBarMenuItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const SideBarMenuItem = ({ href, icon, label }: SideBarMenuItemProps) => {
  return (
    <IconButton 
      href={href} 
      sx={{ 
        color: 'text.primary', 
        justifyContent: 'flex-start', 
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: 'transparent',
        transition: 'background-color 0.2s ease, color 0.2s ease',
        '& svg': {
          color: 'gray',
          transition: 'color 0.2s ease'
        },
        '&:hover': { 
          backgroundColor: `rgba(229, 75, 75, 0.08)`,
          color: colors.strawberryRed,
          '& svg': {
            color: colors.strawberryRed
          }
        }
      }}
    >
      {icon}
      <Typography sx={{ marginLeft: '8px', fontWeight: 500}}>{label}</Typography>
    </IconButton>
  );
};

const SideBar = () => {
  const { accessToken } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '250px', backgroundColor: '#ece0dd', borderRight: '1px solid', borderColor: 'divider' }}>

      <Typography> Test </Typography>

      {/* Button box */}
      <Box sx={{ padding: '10px', borderTop: '1px solid', borderColor: 'divider', flexGrow: 1 }}>
        <DividerText label='OVERVIEW'/>
        <Stack spacing={1}>
          <SideBarMenuItem href='/qr' icon={<QrCodeIcon sx={{ fontSize: '28px' }} />} label='QR Codes' />
        </Stack>
      </Box>

      {/* Account Box */}
      <Box sx={{ padding: '10px', borderTop: '1px solid', borderColor: 'divider' }}>
        <DividerText label='ACCOUNT'/>
        <Stack spacing={1}>
          {accessToken ? (
            <SideBarMenuItem href='/auth' icon={<LogoutIcon sx={{ fontSize: '28px' }} />} label='Log out' />
          ) : (
            <SideBarMenuItem href='/auth' icon={<LoginIcon sx={{ fontSize: '28px' }} />} label='Log in' />
          )}
        </Stack>
      </Box>

    </Box>
  );
};

export default SideBar;