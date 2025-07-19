import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Container, Button, Typography, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  // Helper: is doctor
  const isDoctor = user && user.user_metadata?.role === 'doctor';
  const isAdmin = user && user.user_metadata?.role === 'admin';

  // Dashboard menu state
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleDashboardMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleDashboardMenuClose = () => {
    setAnchorEl(null);
  };
  const handleDashboardNav = (path: string) => {
    navigate(path);
    handleDashboardMenuClose();
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Dashboard Icon/Button - right before AfyaJirani, only when logged in */}
              {user && (
                <>
                  <IconButton
                    color="inherit"
                    aria-label="dashboard menu"
                    onClick={handleDashboardMenuOpen}
                    sx={{ ml: 0, mr: 1 }}
                    size="large"
                  >
                    <MenuIcon />
                  </IconButton>
                </>
              )}
              <Button color="inherit" component={Link} to="/" sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 20 }}>
                AfyaJirani
              </Button>
            </Typography>
            {/* Dashboard Dropdown Menu (absolute, not inside Typography) */}
            {user && (
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleDashboardMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                <MenuItem onClick={() => handleDashboardNav('/dashboard')}>Unified Dashboard</MenuItem>
                <MenuItem onClick={() => handleDashboardNav('/community')}>Community Dashboard</MenuItem>
                {isDoctor && <MenuItem onClick={() => handleDashboardNav('/professionals')}>Professional Dashboard</MenuItem>}
                {isAdmin && <MenuItem onClick={() => handleDashboardNav('/dashboard')}>Admin Dashboard</MenuItem>}
              </Menu>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Button color="inherit" component={Link} to="/">Home</Button>
            {isDoctor && <Button color="inherit" component={Link} to="/professionals">For Professionals</Button>}
            <Button color="inherit" component={Link} to="/community">For Community</Button>
            <Button color="inherit" component={Link} to="/about">About</Button>
            {!user && <Button color="inherit" component={Link} to="/login">Login</Button>}
            {!user && <Button color="inherit" component={Link} to="/signup">Signup</Button>}
            {user && <Button color="inherit" onClick={handleLogout}>Logout</Button>}
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<h1>Welcome to AfyaJirani</h1>} />
          <Route path="/login" element={<h1>Login Page</h1>} />
          <Route path="/signup" element={<h1>Signup Page</h1>} />
          <Route path="/dashboard" element={<h1>Unified Dashboard</h1>} />
          <Route path="/community" element={<h1>Community Dashboard</h1>} />
          <Route path="/professionals" element={<h1>Professional Dashboard</h1>} />
          <Route path="/about" element={<h1>About AfyaJirani</h1>} />
        </Routes>
      </Container>
    </>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper; 