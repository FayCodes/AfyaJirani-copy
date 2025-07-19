import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, AppBar, CssBaseline } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import AdminDashboard from './AdminDashboard';
import CommunityDashboard from './CommunityDashboard';
import DoctorDashboard from './DoctorDashboard';

// These are defined in App.tsx, so we import them from there
import type { FC } from 'react';

interface UnifiedDashboardProps {
  initialTab?: string;
}

const drawerWidth = 220;

const UnifiedDashboard: FC<UnifiedDashboardProps> = ({ initialTab }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Determine roles
  const role = user?.user_metadata?.role;
  const isDoctor = role === 'doctor' || role === 'admin';
  const isAdmin = role === 'admin';

  // Sidebar items
  const sections = [
    { key: 'community', label: 'Community', icon: <PeopleIcon />, show: true },
    { key: 'professionals', label: 'For Professionals', icon: <LocalHospitalIcon />, show: isDoctor },
    { key: 'admin', label: 'Admin', icon: <AdminPanelSettingsIcon />, show: isAdmin },
  ];
  const visibleSections = sections.filter(s => s.show);
  const initialSelected = initialTab && visibleSections.some(s => s.key === initialTab)
    ? initialTab
    : visibleSections[0]?.key || 'community';
  const [selected, setSelected] = useState(initialSelected);

  // Render selected section
  let content = null;
  if (selected === 'community') content = <CommunityDashboard />;
  else if (selected === 'professionals') content = <DoctorDashboard />;
  else if (selected === 'admin') content = <AdminDashboard />;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            AfyaJirani Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem button onClick={() => navigate('/')}>
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            {visibleSections.map((section) => (
              <ListItem
                button
                key={section.key}
                selected={selected === section.key}
                onClick={() => setSelected(section.key)}
              >
                <ListItemIcon>{section.icon}</ListItemIcon>
                <ListItemText primary={section.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1 }}>
        {content}
      </Box>
    </Box>
  );
};

export default UnifiedDashboard; 