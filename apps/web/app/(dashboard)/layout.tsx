"use client";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PaymentsIcon from "@mui/icons-material/Payments";
import PetsIcon from "@mui/icons-material/Pets";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { PetFilterToggle } from "@/components/pets/PetFilterToggle";
import { useAuthStore } from "@/stores/useAuthStore";

const SIDEBAR_WIDTH = 200;
const SIDEBAR_COLLAPSED_WIDTH = 64;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const MAIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
  { label: "My Pets", href: "/pets", icon: <PetsIcon /> },
  { label: "Vet Visits", href: "/vet-visits", icon: <LocalHospitalIcon /> },
  { label: "Vaccinations", href: "/vaccinations", icon: <VaccinesIcon /> },
  { label: "Food Stock", href: "/stock", icon: <Inventory2Icon /> },
  { label: "Calendar", href: "/calendar", icon: <CalendarMonthIcon /> },
];

const INSIGHTS_NAV: NavItem[] = [
  { label: "Spending", href: "/spending", icon: <PaymentsIcon /> },
  {
    label: "Weight History",
    href: "/weight-history",
    icon: <MonitorWeightIcon />,
  },
];

const SETTINGS_NAV: NavItem[] = [
  { label: "Household", href: "/household", icon: <HomeIcon /> },
  {
    label: "Notifications",
    href: "/notifications",
    icon: <NotificationsIcon />,
  },
];

const MOBILE_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
  { label: "Pets", href: "/pets", icon: <PetsIcon /> },
  { label: "Vet", href: "/vet-visits", icon: <LocalHospitalIcon /> },
  { label: "Stock", href: "/stock", icon: <Inventory2Icon /> },
  { label: "More", href: "/calendar", icon: <CalendarMonthIcon /> },
];

interface NavSectionProps {
  items: NavItem[];
  currentPath: string;
  collapsed: boolean;
  sectionLabel?: string;
}

function NavSection({
  items,
  currentPath,
  collapsed,
  sectionLabel,
}: NavSectionProps) {
  return (
    <Box>
      {sectionLabel && !collapsed && (
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{
            px: 2,
            py: 0.5,
            display: "block",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          {sectionLabel}
        </Typography>
      )}
      <List disablePadding dense>
        {items.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? currentPath === "/dashboard"
              : currentPath.startsWith(item.href);

          return (
            <ListItem key={item.href} disablePadding sx={{ display: "block" }}>
              <Tooltip title={collapsed ? item.label : ""} placement="right">
                <ListItemButton
                  component={NextLink}
                  href={item.href}
                  selected={isActive}
                  sx={{
                    minHeight: 48,
                    px: collapsed ? "auto" : 2,
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: 1.5,
                    mx: 0.5,
                    mb: 0.25,
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      "& .MuiListItemIcon-root": {
                        color: "primary.contrastText",
                      },
                      "&:hover": { bgcolor: "primary.dark" },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 36,
                      justifyContent: "center",
                      color: isActive ? "inherit" : "text.secondary",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && <ListItemText primary={item.label} />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

function SidebarContent({
  collapsed,
  currentPath,
  onToggle,
}: {
  collapsed: boolean;
  currentPath: string;
  onToggle: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <Box display="flex" flexDirection="column" height="100%" overflow="hidden">
      {/* Logo */}
      <Box
        sx={{
          px: collapsed ? 1 : 2,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          minHeight: 64,
        }}
      >
        {!collapsed && (
          <Box display="flex" alignItems="center" gap={1}>
            <PetsIcon sx={{ color: "primary.main" }} />
            <Typography variant="h6" fontWeight={800} color="primary.main">
              FurLog
            </Typography>
          </Box>
        )}
        <Tooltip
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          placement="right"
        >
          <IconButton onClick={onToggle} size="small">
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider />

      {/* Navigation */}
      <Box flexGrow={1} overflow="auto" py={1}>
        <NavSection
          items={MAIN_NAV}
          currentPath={currentPath}
          collapsed={collapsed}
        />
        <Divider sx={{ my: 1 }} />
        <NavSection
          items={INSIGHTS_NAV}
          currentPath={currentPath}
          collapsed={collapsed}
          sectionLabel="Insights"
        />
        <Divider sx={{ my: 1 }} />
        <NavSection
          items={SETTINGS_NAV}
          currentPath={currentPath}
          collapsed={collapsed}
          sectionLabel="Settings"
        />
      </Box>

      {/* User info at bottom */}
      <Divider />
      <Box
        sx={{
          px: collapsed ? 1 : 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: "primary.main",
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {initials}
        </Avatar>
        {!collapsed && user && (
          <Box minWidth={0}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user.email}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && user.current_household_id === null) {
      router.replace("/onboarding");
    }
  }, [user, router]);

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  // Determine active mobile tab index
  const mobileTabValue = MOBILE_NAV.findIndex((item) =>
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href),
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            "& .MuiDrawer-paper": {
              width: sidebarWidth,
              boxSizing: "border-box",
              overflowX: "hidden",
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              borderRight: `1px solid ${theme.palette.divider}`,
              bgcolor: "background.paper",
            },
          }}
        >
          <SidebarContent
            collapsed={collapsed}
            currentPath={pathname}
            onToggle={() => setCollapsed((c) => !c)}
          />
        </Drawer>
      )}

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          pb: isMobile ? 7 : 0,
        }}
      >
        {/* Top bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "background.paper",
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: "text.primary",
          }}
        >
          <Toolbar sx={{ gap: 2 }}>
            {isMobile && (
              <Box display="flex" alignItems="center" gap={1}>
                <PetsIcon sx={{ color: "primary.main" }} />
                <Typography variant="h6" fontWeight={800} color="primary.main">
                  FurLog
                </Typography>
              </Box>
            )}
            <Box flexGrow={1} />
            <PetFilterToggle />
            <NotificationBell />
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>{children}</Box>
      </Box>

      <NotificationDropdown />

      {/* Mobile bottom navigation */}
      {isMobile && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
          }}
        >
          <BottomNavigation
            value={mobileTabValue === -1 ? false : mobileTabValue}
            showLabels
            sx={{ bgcolor: "background.paper" }}
          >
            {MOBILE_NAV.map((item) => (
              <BottomNavigationAction
                key={item.href}
                label={item.label}
                icon={item.icon}
                component={NextLink}
                href={item.href}
                sx={{ minWidth: 48 }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
