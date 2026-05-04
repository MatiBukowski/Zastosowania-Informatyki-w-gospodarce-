import { Box, IconButton, Stack, Typography } from "@mui/material";
import QrCodeIcon from '@mui/icons-material/QrCode';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { colors } from '../../theme/palette';
import { useAuth } from '../services/AuthProvider';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import BarChartIcon from '@mui/icons-material/BarChart';

const dividerTextStyle = {
  textAlign: 'left',
  padding: '5px',
  fontFamily: 'Roboto',
  fontWeight: 600,
  fontStyle: 'thin',
  fontSize: '13px',
  color: 'Gray',
};

const DividerText = ({ label, hidden = false }: { label: string; hidden?: boolean }) => {
  return (
    <Typography variant='body2' sx={{...dividerTextStyle, visibility: hidden ? 'hidden' : 'visible', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
      {label}
    </Typography>
  );
};

interface SideBarMenuItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed?: boolean;
  isActive?: boolean;
}

const SideBarMenuItem = ({ href, icon, label, collapsed = false, isActive = false }: SideBarMenuItemProps) => {
  return (
    <IconButton 
      href={href} 
      sx={{ 
        color: isActive ? colors.strawberryRed : 'text.primary', 
        justifyContent: collapsed ? 'center' : 'flex-start', 
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: isActive ? `rgba(229, 75, 75, 0.08)` : 'transparent',
        transition: 'background-color 0.2s ease, color 0.2s ease',
        '& svg': {
          color: isActive ? colors.strawberryRed : 'gray',
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
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && <Typography sx={{ marginLeft: '8px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</Typography>}
    </IconButton>
  );
};

const SideBar = () => {
  const { accessToken, role, firstName, surname } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const displayName = firstName && surname ? `${firstName} ${surname}` : "User";
  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Role";
  const isQrActive = location.pathname === '/qr';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: isCollapsed ? '80px' : '250px', backgroundColor: '#ece0dd', borderRight: '1px solid', borderColor: 'divider', transition: 'width 0.3s ease' }}>

      <Box sx={{ padding: '15px', borderTop: '1px solid', borderColor: 'divider'}}>
        <Stack direction='row' alignItems='center' spacing={1} sx={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          {!isCollapsed && (
            <Stack direction='row' sx={{ flexGrow: 1 }}>
              <Box sx={{ border: '1px solid', borderRadius: '12px', width: '48px', height: '48px', borderColor: colors.strawberryRed }} />
              <Stack direction='column' sx={{ marginLeft: '10px', overflow: 'hidden' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</Typography>
                <Typography variant='body2' sx={{ color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayRole}</Typography>
              </Stack>
            </Stack>
          )}
          <IconButton sx={{ height: '48px', width: '48px', borderRadius: '8px', backgroundColor: 'transparent', transition: 'background-color 0.2s ease, color 0.2s ease', '&:hover': { backgroundColor: `rgba(229, 75, 75, 0.08)`, color: colors.strawberryRed } }} onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <KeyboardArrowRightIcon/> : <KeyboardArrowLeftIcon/>}
          </IconButton>
        </Stack>
      </Box>

      {/* Button box */}
      <Box sx={{ padding: '10px', borderTop: '1px solid', borderColor: 'divider', flexGrow: 1 }}>
        <DividerText label='OVERVIEW' hidden={isCollapsed} />
        <Stack spacing={1}>
          <SideBarMenuItem href='/qr' icon={<QrCodeIcon sx={{ fontSize: '28px' }} />} label='QR Codes' collapsed={isCollapsed} isActive={isQrActive} />
          <SideBarMenuItem href='/' icon={<BarChartIcon sx={{ fontSize: '28px' }} />} label='Statistics' collapsed={isCollapsed} isActive={location.pathname === '/dashboard'} />
        </Stack>
      </Box>

      {/* Account Box */}
      <Box sx={{ padding: '10px', borderTop: '1px solid', borderColor: 'divider' }}>
        <DividerText label='ACCOUNT' hidden={isCollapsed} />
        <Stack spacing={1}>
          {accessToken ? (
            <SideBarMenuItem href='/auth' icon={<LogoutIcon sx={{ fontSize: '28px' }} />} label='Log out' collapsed={isCollapsed} />
          ) : (
            <SideBarMenuItem href='/auth' icon={<LoginIcon sx={{ fontSize: '28px' }} />} label='Log in' collapsed={isCollapsed} />
          )}
        </Stack>
      </Box>

    </Box>
  );
};

export default SideBar;