import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/domains/auth";
import { navItems, type NavItem } from "../navigation";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import {
  AppBar,
  Box,
  Button,
  Collapse,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

const drawerWidth = 240;

type DrawerEntry = NavItem | { group: string; items: NavItem[] };

// Folds items that share a `group` into one entry, at the position of the group's first item.
function toDrawerEntries(items: NavItem[]): DrawerEntry[] {
  const entries: DrawerEntry[] = [];
  const groups = new Map<string, NavItem[]>();
  for (const item of items) {
    if (!item.group) {
      entries.push(item);
      continue;
    }
    const existing = groups.get(item.group);
    if (existing) {
      existing.push(item);
    } else {
      const groupItems = [item];
      groups.set(item.group, groupItems);
      entries.push({ group: item.group, items: groupItems });
    }
  }
  return entries;
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  // Only groups the user has toggled; otherwise a group is open while one of its pages is showing.
  const [toggledGroups, setToggledGroups] = useState<Record<string, boolean>>({});
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const renderLink = ({ path, label }: NavItem, nested = false) => (
    <ListItemButton
      key={path}
      component={NavLink}
      to={path}
      end={path === "/"}
      onClick={() => setMobileOpen(false)}
sx={{
  ...(nested ? { pl: 4 } : {}),
  '&[aria-current="page"]': {
    bgcolor: "action.selected",
    "&:hover": { bgcolor: "action.selected" },
  },
}}
    >
      <ListItemText primary={label} />
    </ListItemButton>
  );

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6">Sales CRM</Typography>
      </Toolbar>
      <List>
        {toDrawerEntries(
          navItems.filter((item) => !item.adminOnly || user?.role === "admin"),
        ).map((entry) => {
          if (!("items" in entry)) return renderLink(entry);
          const containsCurrentPage = entry.items.some((item) => item.path === pathname);
          const open = toggledGroups[entry.group] ?? containsCurrentPage;
          return (
            <Box key={entry.group}>
              <ListItemButton
                aria-expanded={open}
                onClick={() =>
                  setToggledGroups((current) => ({ ...current, [entry.group]: !open }))
                }
              >
                <ListItemText primary={entry.group} />
                {open ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={open} unmountOnExit>
                <List disablePadding>{entry.items.map((item) => renderLink(item, true))}</List>
              </Collapse>
            </Box>
          );
        })}
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
