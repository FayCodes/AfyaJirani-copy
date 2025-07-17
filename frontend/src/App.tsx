import React from 'react';
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
import { useState } from 'react';
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
          <Button variant="text" color="primary" component={Link} to="/about" size="large">
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
    <Box sx={{ mt: 4, maxWidth: 700, mx: 'auto', px: 2 }}>
      <Typography variant="h4" sx={{ mb: 2, color: '#1976d2' }}>About AfyaJirani</Typography>
      <Box
        component="img"
        src="/about.jpg"
        alt="About AfyaJirani"
        sx={{
          width: '100%',
          maxHeight: 320,
          objectFit: 'cover',
          borderRadius: 3,
          boxShadow: 3,
          mb: 3,
          display: 'block',
        }}
      />
      <Typography variant="body1" sx={{ mb: 3 }}>
        AfyaJirani empowers communities and healthcare providers with timely, localized alerts and actionable advice during disease outbreaks—using AI, real-time data, and accessible technology. Our mission is to save lives, inform the public, and support healthcare professionals with the tools they need to respond quickly and effectively.
      </Typography>
      <Typography variant="h5" sx={{ mb: 2, color: '#43a047' }}>How It Works</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Healthcare professionals securely report cases. The system analyzes trends and predicts risks using AI and environmental data. When risk is high, the platform sends alerts and prevention tips to community members—always protecting privacy and confidentiality.
      </Typography>
      <Typography variant="h5" sx={{ mb: 2, color: '#1976d2' }}>Frequently Asked Questions</Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>How is my data protected?</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>We never store or share personal identifiers. All data is anonymized and used only for public health purposes.</Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Who can report cases?</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>Only verified healthcare professionals and clinics can report cases through the secure portal.</Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>How do I receive alerts?</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>Community members can sign up to receive alerts via email, SMS, or in-app notifications.</Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>What if I see a duplicate case?</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>The system uses privacy-preserving codes to help avoid duplicates, but no personal data is ever shared between clinics.</Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>How can I get help?</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>Visit the Community Dashboard for tips, or contact your nearest clinic listed there.</Typography>
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
      navigate('/'); // Redirect to home or dashboard
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    const { error } = await signUp(email, password, role);
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

function DoctorDashboard() {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    disease: '',
    symptoms: '',
    location: '',
    ageGroup: '',
    gender: '',
    date: new Date().toISOString().slice(0, 10),
    patientCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [trends, setTrends] = useState<{ cholera: number; malaria: number; covid: number } | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState<string | null>(null);
  const handleTab = (_: any, newValue: number) => setTab(newValue);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase.from('cases').insert([
        {
          disease: form.disease,
          symptoms: form.symptoms,
          location: form.location,
          age_group: form.ageGroup,
          gender: form.gender,
          date: form.date,
          patient_code: form.patientCode || null,
        },
      ]);
      if (supabaseError) throw supabaseError;
      setSuccess(true);
      setForm({ disease: '', symptoms: '', location: '', ageGroup: '', gender: '', date: new Date().toISOString().slice(0, 10), patientCode: '' });
    } catch (err: any) {
      setError(err.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };
  const fetchTrendsFromSupabase = async () => {
    // Fetch counts for each disease
    const diseases = ['Cholera', 'Malaria', 'COVID-19'];
    const results: Record<string, number> = {};
    for (const disease of diseases) {
      const { count, error } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('disease', disease);
      if (error) {
        throw error;
      }
      results[disease.toLowerCase()] = count || 0;
    }
    return results;
  };
  // Fetch trends when tab is selected
  React.useEffect(() => {
    if (tab === 1 && !trends && !trendsLoading) {
      setTrendsLoading(true);
      setTrendsError(null);
      fetchTrendsFromSupabase()
        .then((data) => setTrends(data as any))
        .catch(() => setTrendsError('Failed to load trends.'))
        .finally(() => setTrendsLoading(false));
    }
  }, [tab, trends, trendsLoading]);
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Doctor/Hospital Dashboard</Typography>
      <Tabs value={tab} onChange={handleTab} sx={{ mb: 3 }} variant="scrollable" scrollButtons="auto">
        <Tab label="Report Case" />
        <Tab label="Trends" />
        <Tab label="AI Risk" />
      </Tabs>
      {tab === 0 && (
        <Card sx={{ maxWidth: 600, mx: 'auto' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Report New Case</Typography>
            {error && <ErrorAlert message={error} />}
            {loading ? <LoadingSpinner /> : (
              <form onSubmit={handleSubmit}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Disease</InputLabel>
                  <Select name="disease" value={form.disease} label="Disease" onChange={handleSelectChange} required>
                    <MenuItem value="Cholera">Cholera</MenuItem>
                    <MenuItem value="Malaria">Malaria</MenuItem>
                    <MenuItem value="COVID-19">COVID-19</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                <TextField name="symptoms" label="Symptoms" value={form.symptoms} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} required />
                <TextField name="location" label="Location" value={form.location} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} required />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Age Group</InputLabel>
                  <Select name="ageGroup" value={form.ageGroup} label="Age Group" onChange={handleSelectChange} required>
                    <MenuItem value="Child">Child</MenuItem>
                    <MenuItem value="Adult">Adult</MenuItem>
                    <MenuItem value="Senior">Senior</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Gender</InputLabel>
                  <Select name="gender" value={form.gender} label="Gender" onChange={handleSelectChange} required>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                    <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                  </Select>
                </FormControl>
                <TextField name="date" label="Date" type="date" value={form.date} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} required />
                <TextField name="patientCode" label="Patient Code (optional, for deduplication)" value={form.patientCode} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} helperText="Do not use name or ID. Use a privacy-preserving code if available." />
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>Submit Case</Button>
              </form>
            )}
            <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
              <AlertSnackbar onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
                Case reported successfully!
              </AlertSnackbar>
            </Snackbar>
          </CardContent>
        </Card>
      )}
      {tab === 1 && (
        <Card sx={{ maxWidth: 600, mx: 'auto' }}>
          <CardContent>
            <Typography variant="h6">Outbreak Trends (Mock Data)</Typography>
            {trendsLoading ? <LoadingSpinner /> : trendsError ? <ErrorAlert message={trendsError} /> : trends && (
              <>
                <Typography sx={{ mt: 2 }}>Cholera: {trends.cholera} cases this week</Typography>
                <Typography>Malaria: {trends.malaria} cases this week</Typography>
                <Typography>COVID-19: {trends.covid} cases this week</Typography>
              </>
            )}
          </CardContent>
        </Card>
      )}
      {tab === 2 && (
        <Card sx={{ maxWidth: 600, mx: 'auto' }}>
          <CardContent>
            <Typography variant="h6">AI Risk Prediction (Mock)</Typography>
            <Typography sx={{ mt: 2 }}>Current risk level: <b>Moderate</b></Typography>
            <Typography>Reason: Recent rainfall and increased malaria cases.</Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

function CommunityDashboard() {
  const [loading, setLoading] = useState(false);
  // Simulate loading for demonstration
  React.useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Community Dashboard</Typography>
      {loading ? <LoadingSpinner /> : <>
        {/* Outbreak Map Placeholder */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <MapIcon sx={{ fontSize: 60, color: '#1976d2', mb: 1 }} />
            <Typography variant="h6">Outbreak Map (Coming Soon)</Typography>
            <Typography variant="body2" sx={{ color: '#555' }}>
              View current outbreak zones and affected areas in your community.
            </Typography>
          </CardContent>
        </Card>
        {/* Prevention Tips */}
        <Typography variant="h6" sx={{ mb: 1, color: '#43a047' }}>Prevention Tips</Typography>
        <List sx={{ mb: 4 }}>
          <ListItem><ListItemText primary="Wash hands regularly with soap and water." /></ListItem>
          <ListItem><ListItemText primary="Drink clean, safe water." /></ListItem>
          <ListItem><ListItemText primary="Use mosquito nets to prevent malaria." /></ListItem>
          <ListItem><ListItemText primary="Seek medical help if you have symptoms." /></ListItem>
        </List>
        {/* Nearby Clinics */}
        <Typography variant="h6" sx={{ mb: 1, color: '#1976d2' }}>Nearby Clinics</Typography>
        <List>
          <ListItem>
            <ListItemIcon><PlaceIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Jirani Health Center" secondary="123 Main St, YourTown" />
          </ListItem>
          <ListItem>
            <ListItemIcon><PlaceIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Community Clinic" secondary="456 Side Rd, YourTown" />
          </ListItem>
          <ListItem>
            <ListItemIcon><PlaceIcon color="primary" /></ListItemIcon>
            <ListItemText primary="Hope Medical Facility" secondary="789 Hope Ave, YourTown" />
          </ListItem>
        </List>
      </>}
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
function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Button color="inherit" component={Link} to="/" sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 20 }}>
                AfyaJirani
              </Button>
            </Typography>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/professionals">For Professionals</Button>
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
          <Route path="/" element={<Home />} />
          <Route path="/professionals" element={<PrivateRoute><DoctorDashboard /></PrivateRoute>} />
          <Route path="/community" element={<PrivateRoute><CommunityDashboard /></PrivateRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
