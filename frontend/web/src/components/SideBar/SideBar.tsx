import {AppBar, Box, Container, Stack, Toolbar, Button} from "@mui/material";
import NavBarButton from "./SideBarButton";
import { useAuth } from "../../services/AuthProvider";

const SideBar = () => {
  return (
    <Box sx={{ width: '200px', backgroundColor: '#CBB7B2', display: 'flex', flexDirection: 'column', borderRight: '1px solid', borderColor: '#6E5A56' }}>

      <Box sx={{ flexGrow: 1 }}/>
      <Box sx={{ backgroundColor: '#9F8A85', borderTop: '1px solid', borderColor: '#6E5A56', height: '100px' }}/>
    </Box>
  );
};

export default SideBar;