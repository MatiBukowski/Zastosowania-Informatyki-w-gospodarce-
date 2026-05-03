import {Button} from '@mui/material';
import {Link} from 'react-router-dom';

type NavBarButtonProps = {
    label: string;
    link?: string;
};

const NavBarButtonStyle = {
    textTransform: 'none',
    color: 'text.primary',
    fontWeight: 600,
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: 'black',
        color: 'white',
    },
};

const NavBarButton = ({label, link}: NavBarButtonProps) => {
    return (
        <Button
            component={link ? Link : 'button'}
            to={link}
            sx={NavBarButtonStyle}
            disableRipple
        >
            {label}
        </Button>
    );
};

export default NavBarButton;