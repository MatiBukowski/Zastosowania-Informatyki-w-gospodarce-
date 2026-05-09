import {Outlet} from "react-router-dom";
import { useState } from 'react';
import {Box} from "@mui/material";
import SideBar from "./components/SideBar";

interface RootProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

function Root({ isCollapsed, setIsCollapsed }: RootProps) {
  const sidebarWidth = isCollapsed ? 80 : 250;
  const [restaurantName, setRestaurantName] = useState("");

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', minHeight: '100vh' }}>
      <SideBar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} setRestaurantName={setRestaurantName} />
      <Box sx={{ flex: 1, display: 'flex', backgroundColor: 'background.default', overflow: 'hidden', transition: 'margin-left 0.3s ease', marginLeft: `${sidebarWidth}px` }}>
        <Outlet context={{ restaurantName }}/>
      </Box>
    </Box>
  )
}

export default Root;