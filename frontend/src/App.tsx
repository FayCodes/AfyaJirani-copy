import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import InsightsIcon from '@mui/icons-material/Insights';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useEffect } from 'react';
import type { SelectChangeEvent } from '@mui/material/Select';
import MapIcon from '@mui/icons-material/Map';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PlaceIcon from '@mui/icons-material/Place';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import HospitalRegistrationForm from './HospitalRegistrationForm';
import AdminDashboard from './AdminDashboard';
import UnifiedDashboard from './UnifiedDashboard';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import Drawer from '@mui/material/Drawer';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CommunityDashboard from './CommunityDashboard';
import DoctorDashboard from './DoctorDashboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

// Mock API service
const mockApi = {
  submitCase: (data: any) =>
    new Promise<{ success: boolean }>((resolve, reject) => {
      setTimeout(() => {
        // Simulate random error
        if (Math.random() < 0.9) resolve({ success: true });
        else reject(new Error('Network error. Please try again.'));
      }, 1200);
    }),
  fetchTrends: () =>
    new Promise<{ cholera: number; malaria: number; covid: number }>((resolve) => {
      setTimeout(() => resolve({ cholera: 5, malaria: 12, covid: 2 }), 800);
    }),
};

const AlertSnackbar = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Loading spinner component
function LoadingSpinner() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
      <CircularProgress color="primary" />
    </Box>
  );
}

// Error alert component
function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>
  );
}

// Placeholder components for each page
function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Remove the dashboard icon from the hero banner
  return (
    <Box>
      {/* Hero Banner Section - Banner with Content Below */}
      <Box
        sx={{
          width: '100%',
          height: { xs: 180, sm: 250, md: 320 },
          mb: 3,
        }}
      >
        <Box
          component="img"
          src="/hero.jpg"
          alt="Community and hospital connection in Kenya"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        {/* Removed dashboard icon here */}
      </Box>
      {/* Tagline and Buttons Below Banner */}
      <Box
        sx={{
          color: '#222',
          textAlign: 'center',
          px: 2,
          mb: 5,
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1.5rem', sm: '2.2rem', md: '2.8rem' } }}>
          AfyaJirani
        </Typography>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 400, fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' } }}>
          Connecting Communities and Hospitals for Early Disease Alerts
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, maxWidth: 600, mx: 'auto', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
          Empowering communities and healthcare providers in Kenya with timely, localized alerts and actionable advice during disease outbreaks—using AI, real-time data, and accessible technology.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button variant="contained" color="primary" component={Link} to="/professionals" size="large">
            For Professionals
          </Button>
          <Button variant="outlined" color="primary" component={Link} to="/community" size="large">
            For Community
          </Button>
          <Button variant="outlined" color="secondary" component={Link} to="/register-hospital" size="large">
            Hospitals: Apply for Access
          </Button>
          <Button variant="contained" color="info" component={Link} to="/about" size="large">
            Learn More
          </Button>
        </Stack>
      </Box>

      {/* Features Section */}
      <Typography variant="h4" align="center" sx={{ mb: 4, color: '#1976d2', fontWeight: 600 }}>
        Key Features
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <NotificationsActiveIcon sx={{ fontSize: 50, color: '#43a047', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Real-time Outbreak Alerts</Typography>
            <Typography variant="body2" sx={{ color: '#555' }}>Get instant notifications about local disease outbreaks and health risks.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <LocalHospitalIcon sx={{ fontSize: 50, color: '#1976d2', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Doctor/Hospital Portal</Typography>
            <Typography variant="body2" sx={{ color: '#555' }}>Healthcare professionals can report cases and view outbreak dashboards.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <InsightsIcon sx={{ fontSize: 50, color: '#ffa726', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>AI-Powered Predictions</Typography>
            <Typography variant="body2" sx={{ color: '#555' }}>Forecasts disease risk using historical and environmental data.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <HealthAndSafetyIcon sx={{ fontSize: 50, color: '#e53935', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Prevention & Tips</Typography>
            <Typography variant="body2" sx={{ color: '#555' }}>Access practical prevention tips and symptom checklists for your community.</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
function Professionals() {
  return <Typography variant="h4">Doctor/Hospital Portal</Typography>;
}
function Community() {
  return <Typography variant="h4">Community Dashboard</Typography>;
}
function About() {
  return (
    <Box sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, background: 'linear-gradient(90deg, #f7fafc 60%, #e3f2fd 100%)' }}>
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src="/about.jpg"
              alt="About AfyaJirani"
              sx={{
                width: '100%',
                maxHeight: 360,
                objectFit: 'cover',
                borderRadius: 3,
                boxShadow: 3,
                mb: { xs: 2, md: 0 },
                display: 'block',
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h3" sx={{ mb: 2, color: '#1976d2', fontWeight: 700 }}>
              About AfyaJirani
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, fontSize: '1.15rem' }}>
              <b style={{ color: '#43a047' }}>Empowering communities and healthcare providers</b> with timely, localized alerts and actionable advice during disease outbreaks—using AI, real-time data, and accessible technology.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <b>Our mission:</b> Save lives, inform the public, and support healthcare professionals with the tools they need to respond quickly and effectively.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <Box sx={{ my: 5 }}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, background: '#f7fafc', borderRadius: 3 }}>
          <Typography variant="h4" sx={{ mb: 3, color: '#43a047', fontWeight: 700, textAlign: 'center' }}>Why AfyaJirani?</Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h5" sx={{ mb: 2, color: '#1976d2', fontWeight: 700 }}>
                  <PeopleAltIcon sx={{ fontSize: 36, verticalAlign: 'middle', mr: 1 }} /> For Community Members
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><NotificationsActiveIcon sx={{ color: '#43a047' }} /></ListItemIcon>
                    <ListItemText primary="Timely Outbreak Alerts" secondary="Get instant notifications about local disease outbreaks and health risks." />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><HealthAndSafetyIcon sx={{ color: '#1976d2' }} /></ListItemIcon>
                    <ListItemText primary="Stay Ahead of Diseases" secondary="Access prevention tips and health facts to protect yourself and your family." />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><VolunteerActivismIcon sx={{ color: '#ffa726' }} /></ListItemIcon>
                    <ListItemText primary="Community Support" secondary="Find clinics, helplines, and resources nearby. Connect with local health professionals." />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><PeopleAltIcon sx={{ color: '#ab47bc' }} /></ListItemIcon>
                    <ListItemText primary="Empower Your Community" secondary="Report outbreaks and help keep your neighborhood safe and informed." />
                  </ListItem>
                </List>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h5" sx={{ mb: 2, color: '#43a047', fontWeight: 700 }}>
                  <LocalHospitalIcon sx={{ fontSize: 36, verticalAlign: 'middle', mr: 1 }} /> For Health Professionals
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><LocalHospitalIcon sx={{ color: '#1976d2' }} /></ListItemIcon>
                    <ListItemText primary="Take Action Faster" secondary="Get real-time outbreak data to respond quickly and save lives." />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><ThumbUpIcon sx={{ color: '#43a047' }} /></ListItemIcon>
                    <ListItemText primary="Build Community Trust" secondary="Be a trusted source of information and support for your patients and community." />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><FavoriteIcon sx={{ color: '#e53935' }} /></ListItemIcon>
                    <ListItemText primary="Save More Lives" secondary="Access resources and tools to improve patient outcomes and public health." />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><EmojiEventsIcon sx={{ color: '#ffa726' }} /></ListItemIcon>
                    <ListItemText primary="Professional Recognition" secondary="Contribute to public health and be recognized for your impact." />
                  </ListItem>
                </List>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      <Box sx={{ my: 5 }}>
        <Typography variant="h5" sx={{ mb: 2, color: '#1976d2', fontWeight: 700 }}>How It Works</Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Healthcare professionals securely report cases. The system analyzes trends and predicts risks using AI and environmental data. When risk is high, the platform sends alerts and prevention tips to community members—always protecting privacy and confidentiality.
        </Typography>
      </Box>
      <Box sx={{ my: 5 }}>
        <Typography variant="h5" sx={{ mb: 2, color: '#43a047', fontWeight: 700 }}>Frequently Asked Questions</Typography>
        <List>
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>How is my data protected?</Typography>}
              secondary="We never store or share personal identifiers. All data is anonymized and used only for public health purposes."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Who can report cases?</Typography>}
              secondary="Only verified healthcare professionals and clinics can report cases through the secure portal."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>How do I receive alerts?</Typography>}
              secondary="Community members can sign up to receive alerts via email, SMS, or in-app notifications."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>What if I see a duplicate case?</Typography>}
              secondary="The system uses privacy-preserving codes to help avoid duplicates, but no personal data is ever shared between clinics."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>How can I get help?</Typography>}
              secondary="Visit the Community Dashboard for tips, or contact your nearest clinic listed there."
            />
          </ListItem>
        </List>
      </Box>
    </Box>
  );
}
function Login() {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message || 'Login failed');
    } else {
      navigate('/'); // Redirect to home page after login
    }
    setSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSubmitting(true);
    setForgotError(null);
    setForgotSuccess(false);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) {
      setForgotError(error.message || 'Failed to send reset email');
    } else {
      setForgotSuccess(true);
    }
    setForgotSubmitting(false);
  };

  return (
    <Box sx={{ mt: 8, maxWidth: 400, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>Login</Typography>
          {error && <ErrorAlert message={error} />}
          <form onSubmit={handleSubmit}>
            <TextField label="Email" type="email" fullWidth sx={{ mb: 2 }} required value={email} onChange={e => setEmail(e.target.value)} />
            <TextField label="Password" type={showPassword ? 'text' : 'password'} fullWidth sx={{ mb: 2 }} required value={password} onChange={e => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                      size="large"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mb: 2 }} disabled={submitting || loading}>
              {submitting ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Button size="small" onClick={() => setForgotOpen(true)}>Forgot Password?</Button>
            <Typography variant="body2">
              Don&apos;t have an account? <Button component={Link} to="/signup" size="small">Sign up</Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
      <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <form onSubmit={handleForgotPassword}>
            <TextField
              label="Enter your email"
              type="email"
              fullWidth
              sx={{ mt: 1, mb: 2 }}
              required
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
            />
            {forgotError && <ErrorAlert message={forgotError} />}
            {forgotSuccess && <AlertSnackbar severity="success">Reset email sent! Check your inbox.</AlertSnackbar>}
            <DialogActions>
              <Button onClick={() => setForgotOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={forgotSubmitting}>{forgotSubmitting ? <CircularProgress size={20} /> : 'Send Email'}</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

function Signup() {
  const { signUp, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    let hospital_id = undefined;
    if (role === 'doctor') {
      // Validate invite code
      const { data, error: codeError } = await supabase
        .from('hospitals')
        .select('id')
        .eq('invite_code', inviteCode.trim())
        .single();
      if (codeError || !data) {
        setError('Invalid hospital invite code. Please check with your hospital admin.');
        setSubmitting(false);
        return;
      }
      hospital_id = data.id;
    }
    // Pass hospital_id in user metadata if doctor
    const { error } = await signUp(email, password, role, hospital_id);
    if (error) {
      setError(error.message || 'Signup failed');
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    }
    setSubmitting(false);
  };

  return (
    <Box sx={{ mt: 8, maxWidth: 400, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>Sign Up</Typography>
          {error && <ErrorAlert message={error} />}
          <form onSubmit={handleSubmit}>
            <TextField label="Email" type="email" fullWidth sx={{ mb: 2 }} required value={email} onChange={e => setEmail(e.target.value)} />
            <TextField label="Password" type={showPassword ? 'text' : 'password'} fullWidth sx={{ mb: 2 }} required value={password} onChange={e => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                      size="large"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth sx={{ mb: 2 }} required>
              <InputLabel>Role</InputLabel>
              <Select value={role} label="Role" onChange={e => setRole(e.target.value)} required>
                <MenuItem value="doctor">Doctor/Hospital</MenuItem>
                <MenuItem value="community">Community Member</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            {role === 'doctor' && (
              <TextField
                label="Hospital Invite Code"
                fullWidth
                sx={{ mb: 2 }}
                required
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                helperText="Ask your hospital admin for the invite code."
              />
            )}
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mb: 2 }} disabled={submitting || loading}>
              {submitting ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
          </form>
          <Snackbar open={success} autoHideDuration={2000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <AlertSnackbar onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
              Signup successful! Redirecting to login…
            </AlertSnackbar>
          </Snackbar>
          <Typography variant="body2" align="center">
            Already have an account? <Button component={Link} to="/login" size="small">Login</Button>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

function CheckApplicationStatus() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    // Try to find by email or registration number
    const { data, error: appError } = await supabase
      .from('hospital_applications')
      .select('*')
      .or(`contact_email.eq.${input},registration_number.eq.${input}`)
      .order('created_at', { ascending: false })
      .limit(1);
    if (appError || !data || !data.length) {
      setError('No application found for that email or registration number.');
      setLoading(false);
      return;
    }
    const app = data[0];
    if (app.status === 'approved') {
      // Find invite code from hospitals table
      const { data: hospData, error: hospError } = await supabase
        .from('hospitals')
        .select('invite_code')
        .eq('contact_email', app.contact_email)
        .single();
      setResult({ ...app, invite_code: hospData?.invite_code });
    } else {
      setResult(app);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ mt: 8, maxWidth: 500, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>Check Application Status</Typography>
          <form onSubmit={handleCheck}>
            <TextField
              label="Contact Email or Registration Number"
              value={input}
              onChange={e => setInput(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Check Status'}
            </Button>
          </form>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {result && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1">Status: <b style={{ color: result.status === 'approved' ? '#43a047' : result.status === 'pending' ? '#ffa726' : '#e53935' }}>{result.status}</b></Typography>
              {result.status === 'approved' && result.invite_code && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>Your hospital has been approved!</Typography>
                  <Typography variant="body2">Invite Code:</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2', mb: 1 }}>{result.invite_code}</Typography>
                  <Alert severity="info">Share this code with your professionals so they can register.</Alert>
                </Box>
              )}
              {result.status === 'pending' && <Alert severity="warning" sx={{ mt: 2 }}>Your application is still pending review.</Alert>}
              {result.status === 'rejected' && <Alert severity="error" sx={{ mt: 2 }}>Your application was rejected. Please contact support for more information.</Alert>}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

// ResetPassword page
function ResetPassword() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    if (password !== confirm) {
      setError('Passwords do not match');
      setSubmitting(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message || 'Failed to reset password');
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    }
    setSubmitting(false);
  };

  return (
    <Box sx={{ mt: 8, maxWidth: 400, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>Set New Password</Typography>
          {error && <ErrorAlert message={error} />}
          <form onSubmit={handleSubmit}>
            <TextField label="New Password" type={showPassword ? 'text' : 'password'} fullWidth sx={{ mb: 2 }} required value={password} onChange={e => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                      size="large"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField label="Confirm Password" type={showConfirm ? 'text' : 'password'} fullWidth sx={{ mb: 2 }} required value={confirm} onChange={e => setConfirm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      onClick={() => setShowConfirm((show) => !show)}
                      edge="end"
                      size="large"
                    >
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={submitting}>
              {submitting ? <CircularProgress size={24} /> : 'Set Password'}
            </Button>
          </form>
          <Snackbar open={success} autoHideDuration={2000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <AlertSnackbar severity="success">Password reset! Redirecting to login…</AlertSnackbar>
          </Snackbar>
        </CardContent>
      </Card>
    </Box>
  );
}

// PrivateRoute component for protecting routes
function PrivateRoute({ children, requiredRole, requireHospital }: { children: React.ReactElement, requiredRole?: string, requireHospital?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  // Allow admin to access doctor routes
  if (requiredRole && ![requiredRole, 'admin'].includes(user.user_metadata?.role)) {
    return (
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Card sx={{ maxWidth: 400, mx: 'auto' }}>
          <CardContent>
            <Typography variant="h6" color="error" sx={{ mb: 2 }}>
              Access Restricted
            </Typography>
            <Typography variant="body1">
              This section is only accessible to verified healthcare professionals.<br/>
              Please contact your hospital admin or support for access.
            </Typography>
            <Button variant="contained" sx={{ mt: 3 }} component={Link} to="/">Back to Home</Button>
          </CardContent>
        </Card>
      </Box>
    );
  }
  if (requireHospital && !user.user_metadata?.hospital_id) {
    return (
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Card sx={{ maxWidth: 400, mx: 'auto' }}>
          <CardContent>
            <Typography variant="h6" color="error" sx={{ mb: 2 }}>
              Access Restricted
            </Typography>
            <Typography variant="body1">
              You must be linked to a registered hospital or clinic to access this section.<br/>
              Please contact your hospital admin or support for access.
            </Typography>
            <Button variant="contained" sx={{ mt: 3 }} component={Link} to="/">Back to Home</Button>
          </CardContent>
        </Card>
      </Box>
    );
  }
  return children;
}

function App() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [logoutSnackbar, setLogoutSnackbar] = useState(false);
  // Add a global error snackbar state and handler
  const [globalError, setGlobalError] = useState<string | null>(null);
  // Remove tourMode state and Take a Tour button logic

  // Auto-logout on session expiration
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (!session && user)) {
        setLogoutSnackbar(true);
        navigate('/login');
      }
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, [navigate, user]);

  const handleLogout = async () => {
    await signOut();
    setLogoutSnackbar(true);
    navigate('/login');
  };
  // Helper: is doctor
  const isDoctor = user && user.user_metadata?.role === 'doctor';
  const isAdmin = user && user.user_metadata?.role === 'admin';

  // Dashboard drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);
  const handleDrawerNav = (path: string) => {
    navigate(path);
    handleDrawerClose();
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Dashboard Icon/Button - right before AfyaJirani, only when logged in */}
              {user && (
                <IconButton
                  color="inherit"
                  aria-label="dashboard menu"
                  onClick={handleDrawerOpen}
                  sx={{ ml: 0, mr: 1 }}
                  size="large"
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Button color="inherit" component={Link} to="/" sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 20 }}>
                AfyaJirani
              </Button>
            </Typography>
            {/* Dashboard Drawer (sidebar) */}
            {user && (
              <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerClose}>
                <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerClose} onKeyDown={handleDrawerClose}>
                  <List>
                    <ListItem button onClick={() => handleDrawerNav('/')}> <ListItemIcon><HomeIcon /></ListItemIcon> <ListItemText primary="Home" /> </ListItem>
                    <ListItem button onClick={() => handleDrawerNav('/community')}> <ListItemIcon><PeopleIcon /></ListItemIcon> <ListItemText primary="Community" /> </ListItem>
                    {isDoctor && <ListItem button onClick={() => handleDrawerNav('/professionals')}> <ListItemIcon><LocalHospitalIcon /></ListItemIcon> <ListItemText primary="Professionals" /> </ListItem>}
                    {isAdmin && <ListItem button onClick={() => handleDrawerNav('/dashboard')}> <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon> <ListItemText primary="Admin" /> </ListItem>}
                  </List>
                </Box>
              </Drawer>
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
        {/* Home page content */}
        <Routes>
          <Route path="/" element={
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h3" gutterBottom>Welcome to AfyaJirani</Typography>
              <Typography variant="h6" gutterBottom>Community Disease Outbreak Alerts & Health Resources</Typography>
              {/* Removed Take a Tour button */}
              <Home />
            </Box>
          } />
          <Route path="/register-hospital" element={<HospitalRegistrationForm />} />
          <Route path="/dashboard" element={<PrivateRoute><UnifiedDashboard /></PrivateRoute>} />
          <Route path="/professionals" element={<PrivateRoute requiredRole="doctor" requireHospital><UnifiedDashboard initialTab="professionals" /></PrivateRoute>} />
          <Route path="/community" element={
            <PrivateRoute><UnifiedDashboard initialTab="community" /></PrivateRoute>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/check-application-status" element={<CheckApplicationStatus />} />
        </Routes>
      </Container>
      <Snackbar open={logoutSnackbar} autoHideDuration={3000} onClose={() => setLogoutSnackbar(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <AlertSnackbar onClose={() => setLogoutSnackbar(false)} severity="info" sx={{ width: '100%' }}>
          You have been logged out.
        </AlertSnackbar>
      </Snackbar>
      {/* Footer */}
      <Box component="footer" sx={{
        width: '100vw',
        bgcolor: '#1976d2',
        color: '#fff',
        py: { xs: 3, md: 4 },
        px: 2,
        borderTop: '1px solid #e0e0e0',
        textAlign: 'center',
        position: 'fixed',
        bottom: 0,
        left: 0,
        zIndex: 1200,
        boxShadow: '0 -2px 8px rgba(25, 118, 210, 0.08)',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 1, sm: 0 } }}>
          <EmailIcon sx={{ mr: 0.5, fontSize: 20 }} />
          <Typography variant="body2" component="span">
            <a href="mailto:AfyaJirani@gmail.com" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 500 }}>AfyaJirani@gmail.com</a>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: { sm: 3 } }}>
          <PhoneIcon sx={{ mr: 0.5, fontSize: 20 }} />
          <Typography variant="body2" component="span">
            <a href="tel:+254700000000" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 500 }}>+254 700 000000</a>
          </Typography>
        </Box>
        <Typography variant="caption" color="#e3f2fd" sx={{ mt: { xs: 1, sm: 0 }, ml: { sm: 3 }, display: 'block', fontWeight: 400 }}>
          &copy; {new Date().getFullYear()} AfyaJirani. All rights reserved.
        </Typography>
      </Box>
    </>
  );
}

export default App;
