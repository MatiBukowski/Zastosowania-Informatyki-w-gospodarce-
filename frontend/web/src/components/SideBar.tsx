import { useEffect, useState } from 'react';
import { Box, IconButton, Stack, Typography, Collapse, List } from "@mui/material";
import QrCodeIcon from '@mui/icons-material/QrCode';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { colors } from '../../theme/palette';
import { useAuth } from '../services/AuthProvider';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { usePostHog } from '@posthog/react';
import { getRestaurantsByUser } from '../api/RestaurantAPI';
import BarChartIcon from '@mui/icons-material/BarChart';
import { IRestaurant } from '../context/interfaces';


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
  href?: string;
  icon: React.ReactNode;
  label: string;
  collapsed?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  rightIcon?: React.ReactNode;
  isSubItem?: boolean;
}

const SideBarMenuItem = ({ href, icon, label, collapsed = false, isActive = false, onClick, rightIcon, isSubItem = false }: SideBarMenuItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    if (href) navigate(href);
  };

  return (
    <IconButton 
      onClick={handleClick}
      {...(href ? { component: Link, to: href, viewTransition: true } as any : {})}
      sx={{
        width: '100%',
        color: isActive ? colors.strawberryRed : 'text.primary',
        justifyContent: collapsed ? 'center' : 'flex-start', 
        padding: isSubItem ? '8px 12px 8px 30px' : '12px',
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
      title={label}
    >
      {icon}
      {!collapsed && (
        <Typography
          sx={{
            marginLeft: '8px',
            fontWeight: isSubItem ? 400 : 500,
            fontSize: isSubItem ? '0.9rem' : '1rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexGrow: 1,
            textAlign: 'left'
          }}
        >
          {label}
        </Typography>
      )}
      {!collapsed && rightIcon}
    </IconButton>
  );
};

interface SideBarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  setRestaurantName: (name: string) => void;
}

const SideBar = ({ isCollapsed, setIsCollapsed, setRestaurantName }: SideBarProps) => {
  const { accessToken, role, firstName, surname, logout } = useAuth();
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);

  const [isQrMenuOpen, setIsQrMenuOpen] = useState(false);
  const [isStatsMenuOpen, setIsStatsMenuOpen] = useState(false);

  const location = useLocation();
  const posthog = usePostHog();

  const displayName = firstName && surname ? `${firstName} ${surname}` : "User";
  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Role";
  const isQrActive = location.pathname === '/qr';
  const isStatsActive = location.pathname === '/' || location.pathname.startsWith('/statistics');

  useEffect(() => {
    getRestaurantsByUser().then(setRestaurants).catch(console.error);
  }, []);

  useEffect(() => {
  getRestaurantsByUser()
    .then((data) => {
      setRestaurants(data);
      posthog.capture('sidebar_restaurants_loaded', {
        restaurants_count: data.length
      });
    })
    .catch((err) => {
      console.error(err);
      posthog.capture('failed_sidebar_restaurants_load');
    });
  }, [posthog]);

  useEffect(() => {
    if (isCollapsed) {
      setIsQrMenuOpen(false);
      setIsStatsMenuOpen(false);
    }
  }, [isCollapsed]);

  const handleQrMenuClick = () => {
    posthog.capture('sidebar_nav_clicked', { destination: '/qr' })
    if (isCollapsed) {
      setIsCollapsed(false);
      setIsQrMenuOpen(true);
      setIsStatsMenuOpen(false);
    } else {
      setIsQrMenuOpen(!isQrMenuOpen);
    }
  };

  const handleStatsMenuClick = () => {
    posthog.capture('sidebar_nav_clicked', { destination: '/statistics' })
    if (isCollapsed) {
      setIsCollapsed(false);
      setIsStatsMenuOpen(true);
      setIsQrMenuOpen(false);
    } else {
      setIsStatsMenuOpen(!isStatsMenuOpen);
    }
  };

  const setRestaurantNameWrapper = (path: string, name: string, id: number) => {
    posthog.capture('sidebar_nav_restaurant_clicked', { to: path, restaurant_id: id })
    setRestaurantName(name)
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, height: '100vh', width: isCollapsed ? '80px' : '250px', backgroundColor: '#ece0dd', borderRight: '1px solid', borderColor: 'divider', transition: 'width 0.3s ease', zIndex: 1000 }}>

      <Box sx={{ padding: '15px', borderTop: '1px solid', borderColor: 'divider'}}>
        <Stack direction='row' spacing={1} sx={{ alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
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

      <Box sx={{ padding: '10px', borderTop: '1px solid', borderColor: 'divider', flexGrow: 1, overflowY: 'auto' }}>
        <DividerText label='OVERVIEW' hidden={isCollapsed} />
        <Stack spacing={1}>

          <SideBarMenuItem
            icon={<QrCodeIcon sx={{ fontSize: '28px' }} />}
            label='QR Codes'
            collapsed={isCollapsed}
            isActive={isQrActive && !isQrMenuOpen}
            onClick={handleQrMenuClick}
            rightIcon={!isCollapsed ? (isQrMenuOpen ? <ExpandLess /> : <ExpandMore />) : undefined}
          />
          <Collapse in={isQrMenuOpen && !isCollapsed} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {restaurants.map((r) => {
                const targetHref = `/qr?restaurantId=${r.restaurant_id}`;
                const isItemActive = location.pathname === '/qr' && location.search.includes(`restaurantId=${r.restaurant_id}`);
                return (
                  <SideBarMenuItem
                    key={r.restaurant_id}
                    href={targetHref}
                    icon={<RestaurantIcon sx={{ fontSize: '22px' }} />}
                    label={r.name}
                    collapsed={false}
                    isActive={isItemActive}
                    isSubItem={true}
                    onClick={() => setRestaurantNameWrapper("qr", r.name, r.restaurant_id)}
                  />
                );
              })}
              {restaurants.length === 0 && (
                 <Typography variant="caption" sx={{ pl: 4, pt: 1, color: 'text.secondary' }}>No restaurants found</Typography>
              )}
            </List>
          </Collapse>

          <SideBarMenuItem
            icon={<BarChartIcon sx={{ fontSize: '28px' }} />}
            label='Statistics'
            collapsed={isCollapsed}
            isActive={isStatsActive && !isStatsMenuOpen}
            onClick={handleStatsMenuClick}
            rightIcon={!isCollapsed ? (isStatsMenuOpen ? <ExpandLess /> : <ExpandMore />) : undefined}
          />
          <Collapse in={isStatsMenuOpen && !isCollapsed} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {restaurants.map((r) => {
                const targetHref = `/?restaurantId=${r.restaurant_id}`;
                const isItemActive = (location.pathname === '/' || location.pathname === '/dashboard') && location.search.includes(`restaurantId=${r.restaurant_id}`);

                return (
                  <SideBarMenuItem
                    key={r.restaurant_id}
                    href={targetHref}
                    icon={<ShowChartIcon sx={{ fontSize: '22px' }} />}
                    label={r.name}
                    collapsed={false}
                    isActive={isItemActive}
                    isSubItem={true}
                    onClick={() => setRestaurantNameWrapper("dashboard", r.name, r.restaurant_id)}
                  />
                );
              })}
              {restaurants.length === 0 && (
                 <Typography variant="caption" sx={{ pl: 4, pt: 1, color: 'text.secondary' }}>No restaurants found</Typography>
              )}
            </List>
          </Collapse>

        </Stack>
      </Box>

      {/* Account Box */}
      <Box sx={{ padding: '10px', borderTop: '1px solid', borderColor: 'divider' }}>
        <DividerText label='ACCOUNT' hidden={isCollapsed} />
        <Stack spacing={1}>
          {accessToken ? (
            <SideBarMenuItem
              icon={<LogoutIcon sx={{ fontSize: '28px' }} />}
              label='Log out'
              collapsed={isCollapsed}
              onClick={() => {
                posthog.capture('logout_clicked');
                logout();
              }}
            />
          ) : (
            <SideBarMenuItem
              href='/auth'
              icon={<LoginIcon sx={{ fontSize: '28px' }} />}
              label='Log in'
              collapsed={isCollapsed}
              onClick={() => posthog.capture('sidebar_nav_clicked', { destination: '/auth' })}
            />
          )}
        </Stack>
      </Box>

    </Box>
  );
};

export default SideBar;
