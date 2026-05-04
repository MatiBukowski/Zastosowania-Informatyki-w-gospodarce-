import {Outlet} from "react-router-dom";
import {Box} from "@mui/material";
import SideBar from "./components/SideBar";

function Root() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', minHeight: '100vh' }}>
      <SideBar/>
      <Box sx={{ width: '100%', flex: 1, display: 'flex', backgroundColor: 'background.default' }}>
        <Outlet/>
      </Box>
    </Box>
  )
}

export default Root;