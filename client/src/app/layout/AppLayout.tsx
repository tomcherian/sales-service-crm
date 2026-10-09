import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

const drawerWidth = 240;
const adminLinks = [
  ["/", "Dashboard"],
  ["/team-leads", "Team Leads"],
  ["/salespersons", "Salespersons"],
  ["/maintenance", "Maintenance Staff"],
  ["/customers", "Customers"],
];

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6">Sales CRM</Typography>
      </Toolbar>
      <List>
        {(user?.role === "admin" ? adminLinks : adminLinks.slice(0, 1)).map(
          ([path, label]) => (
            <ListItemButton
              key={path}
              component={NavLink}
              to={path}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemText primary={label} />
            </ListItemButton>
          ),
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Button
            color="inherit"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ display: { sm: "none" }, mr: 2 }}
          >
            Menu
          </Button>
          <Typography sx={{ flexGrow: 1 }}>{user?.name}</Typography>
          <Button
            color="inherit"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Log out
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
