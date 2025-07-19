import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, FormControl, InputLabel, Select, MenuItem, TextField, CircularProgress, Button, List, ListItem, ListItemText, ListItemIcon, Grid, Paper, Alert } from '@mui/material';
import {
  BarChart, Bar, XAxis as ReXAxis, YAxis as ReYAxis, CartesianGrid as ReCartesianGrid, Tooltip as ReTooltip, Legend, ResponsiveContainer as ReResponsiveContainer, PieChart, Pie, Cell,
  LineChart as ReLineChart, Line as ReLine
} from 'recharts';
import { supabase } from './supabaseClient';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoIcon from '@mui/icons-material/Info';
import { usePrediction } from './hooks/usePrediction';

function LoadingSpinner() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
      <CircularProgress color="primary" />
    </Box>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <Box sx={{ my: 2 }}>
      <Card sx={{ backgroundColor: '#ffeaea' }}>
        <CardContent>
          <Typography color="error">{message}</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

const mockCases = [
  { id: 1, disease: 'Cholera', date: '2024-06-01', location: 'Nairobi', status: 'Submitted' },
  { id: 2, disease: 'Malaria', date: '2024-06-02', location: 'Mombasa', status: 'Submitted' },
  { id: 3, disease: 'COVID-19', date: '2024-06-03', location: 'Kisumu', status: 'Submitted' },
];

const mockHospital = {
  name: 'Jirani Health Center',
  address: '123 Main St, YourTown',
  contact: '0712345678',
  status: 'Approved',
  // Add logo or image here
};

const mockResources = [
  { name: 'Case Reporting Guidelines', link: '#' },
  { name: 'Outbreak Response SOP', link: '#' },
  { name: 'Downloadable Case Form', link: '#' },
];

interface DoctorDashboardProps {
  tourMode?: boolean;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ tourMode }) => {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    disease: '',
    symptoms: '',
    location: '',
    ageGroup: '',
    gender: '',
    date: new Date().toISOString().slice(0, 10),
    patientCode: '',
    latitude: '',
    longitude: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [diseaseDist, setDiseaseDist] = useState<{ cholera: number; malaria: number; covid: number }>({ cholera: 0, malaria: 0, covid: 0 });
  const [casesOverTime, setCasesOverTime] = useState<any[]>([]);
  const [casesByLocation, setCasesByLocation] = useState<any[]>([]);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState<string | null>(null);
  // Add real data state
  const [cases, setCases] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [hospital, setHospital] = useState<any>({});
  const [resources, setResources] = useState<any[]>([]);
  const [selectedDisease, setSelectedDisease] = useState('Cholera');
  const { loading: predLoading, error: predError, data: predData } = usePrediction({ disease: selectedDisease, range: 7 });

  // Use mock data if tourMode
  const casesToDisplay = tourMode ? MOCK_CASES : cases;
  const trendsToDisplay = tourMode ? MOCK_TRENDS : trends;
  const hospitalToDisplay = tourMode ? MOCK_HOSPITAL : hospital;
  const resourcesToDisplay = tourMode ? MOCK_RESOURCES : resources;

  const handleTab = (_: any, newValue: number) => setTab(newValue);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSelectChange = (e: any) => {
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
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
        },
      ]);
      if (supabaseError) throw supabaseError;
      setSuccess(true);
      setForm({ disease: '', symptoms: '', location: '', ageGroup: '', gender: '', date: new Date().toISOString().slice(0, 10), patientCode: '', latitude: '', longitude: '' });
    } catch (err: any) {
      setError(err.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all trends data from Supabase
  const fetchTrendsFromSupabase = async () => {
    const diseases = ['Cholera', 'Malaria', 'COVID-19'];
    const diseaseCounts: Record<string, number> = { cholera: 0, malaria: 0, covid: 0 };
    for (const disease of diseases) {
      const { count, error } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('disease', disease);
      if (error) throw error;
      diseaseCounts[disease.toLowerCase().replace('-', '').replace(' ', '')] = count || 0;
    }
    setDiseaseDist({
      cholera: diseaseCounts.cholera,
      malaria: diseaseCounts.malaria,
      covid: diseaseCounts.covid19 || diseaseCounts.covid,
    });
    // Cases Over Time (last 7 days)
    const today = new Date();
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });
    const { data: timeData, error: timeError } = await supabase
      .from('cases')
      .select('date,disease')
      .gte('date', last7[0])
      .lte('date', last7[6]);
    if (timeError) throw timeError;
    const timeAgg: Record<string, any> = {};
    for (const d of last7) {
      timeAgg[d] = { date: d, Cholera: 0, Malaria: 0, COVID: 0 };
    }
    (timeData || []).forEach((row: any) => {
      const day = row.date;
      const disease = row.disease;
      if (timeAgg[day]) {
        if (disease === 'Cholera') timeAgg[day].Cholera++;
        if (disease === 'Malaria') timeAgg[day].Malaria++;
        if (disease === 'COVID-19' || disease === 'COVID') timeAgg[day].COVID++;
      }
    });
    setCasesOverTime(Object.values(timeAgg));
    // Cases by Location
    const { data: locData, error: locError } = await supabase
      .from('cases')
      .select('location,disease');
    if (locError) throw locError;
    const locAgg: Record<string, any> = {};
    (locData || []).forEach((row: any) => {
      const loc = row.location || 'Unknown';
      if (!locAgg[loc]) locAgg[loc] = { location: loc, Cholera: 0, Malaria: 0, COVID: 0 };
      if (row.disease === 'Cholera') locAgg[loc].Cholera++;
      if (row.disease === 'Malaria') locAgg[loc].Malaria++;
      if (row.disease === 'COVID-19' || row.disease === 'COVID') locAgg[loc].COVID++;
    });
    setCasesByLocation(Object.values(locAgg));
  };

  useEffect(() => {
    if (tab === 1 && !trendsLoading) {
      setTrendsLoading(true);
      setTrendsError(null);
      fetchTrendsFromSupabase()
        .catch(() => setTrendsError('Failed to load trends.'))
        .finally(() => setTrendsLoading(false));
    }
    // eslint-disable-next-line
  }, [tab]);

  return (
    <Box sx={{ mt: 4 }}>
      {tourMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Tour Mode: Viewing as Professional (Read Only)
        </Alert>
      )}
      <Typography variant="h4" sx={{ mb: 2 }}>Doctor/Hospital Dashboard</Typography>
      <Tabs value={tab} onChange={handleTab} sx={{ mb: 3 }} variant="scrollable" scrollButtons="auto">
        <Tab label="Report Case" icon={<AssignmentIcon />} iconPosition="start" />
        <Tab label="Trends" icon={<TrendingUpIcon />} iconPosition="start" />
        <Tab label="My Cases" icon={<DescriptionIcon />} iconPosition="start" />
        <Tab label="Hospital Info" icon={<LocalHospitalIcon />} iconPosition="start" />
        <Tab label="Resources" icon={<InfoIcon />} iconPosition="start" />
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
                <TextField name="gender" label="Gender" value={form.gender} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} required />
                <TextField name="date" label="Date" type="date" value={form.date} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} required />
                <TextField name="patientCode" label="Patient Code (optional)" value={form.patientCode} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} />
                <TextField name="latitude" label="Latitude (optional)" value={form.latitude} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} helperText="If known, enter the latitude coordinate." />
                <TextField name="longitude" label="Longitude (optional)" value={form.longitude} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} helperText="If known, enter the longitude coordinate." />
                <Box sx={{ textAlign: 'right' }}>
                  <Button type="submit" variant="contained" disabled={loading || tourMode}>
                    Submit
                  </Button>
                </Box>
              </form>
            )}
            {success && <Typography color="success.main" sx={{ mt: 2 }}>Case reported successfully!</Typography>}
          </CardContent>
        </Card>
      )}
      {tab === 1 && (
        <Box>
          {/* Prediction Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>AI Prediction (Next 7 Days)</Typography>
            <FormControl sx={{ minWidth: 180, mb: 2 }}>
              <InputLabel>Disease</InputLabel>
              <Select value={selectedDisease} label="Disease" onChange={e => setSelectedDisease(e.target.value)}>
                <MenuItem value="Cholera">Cholera</MenuItem>
                <MenuItem value="Malaria">Malaria</MenuItem>
                <MenuItem value="COVID-19">COVID-19</MenuItem>
                {/* Add more diseases as needed */}
              </Select>
            </FormControl>
            {predLoading && <Typography>Loading prediction...</Typography>}
            {predError && <Alert severity="error">{predError}</Alert>}
            {predData && predData.predictions && (
              <ReResponsiveContainer width="100%" height={220}>
                <ReLineChart data={predData.predictions} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <ReCartesianGrid strokeDasharray="3 3" />
                  <ReXAxis dataKey="days_from_now" tickFormatter={d => `+${d}d`} />
                  <ReYAxis allowDecimals={false} />
                  <ReTooltip />
                  <ReLine type="monotone" dataKey="predicted_cases" stroke="#1976d2" name="Predicted Cases" />
                </ReLineChart>
              </ReResponsiveContainer>
            )}
          </Box>
          <Card sx={{ maxWidth: 800, mx: 'auto' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Outbreak Trends</Typography>
              {trendsLoading ? <LoadingSpinner /> : trendsError ? <ErrorAlert message={trendsError} /> : (
                <Box>
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Cases Over Time</Typography>
                  <ReResponsiveContainer width="100%" height={220}>
                    <BarChart data={casesOverTime.length ? casesOverTime : [
                      { date: 'Mon', Cholera: 1, Malaria: 2, COVID: 0 },
                      { date: 'Tue', Cholera: 0, Malaria: 3, COVID: 1 },
                      { date: 'Wed', Cholera: 2, Malaria: 1, COVID: 0 },
                      { date: 'Thu', Cholera: 1, Malaria: 2, COVID: 1 },
                      { date: 'Fri', Cholera: 0, Malaria: 2, COVID: 0 },
                      { date: 'Sat', Cholera: 1, Malaria: 1, COVID: 0 },
                      { date: 'Sun', Cholera: 0, Malaria: 1, COVID: 0 },
                    ]} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <ReCartesianGrid strokeDasharray="3 3" />
                      <ReXAxis dataKey="date" />
                      <ReYAxis allowDecimals={false} />
                      <ReTooltip />
                      <Legend />
                      <Bar dataKey="Cholera" fill="#43a047" />
                      <Bar dataKey="Malaria" fill="#1976d2" />
                      <Bar dataKey="COVID" fill="#e53935" />
                    </BarChart>
                  </ReResponsiveContainer>
                  <Typography variant="subtitle1" sx={{ mt: 4, mb: 1 }}>Disease Distribution</Typography>
                  <ReResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Cholera', value: diseaseDist.cholera },
                          { name: 'Malaria', value: diseaseDist.malaria },
                          { name: 'COVID-19', value: diseaseDist.covid },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        <Cell key="Cholera" fill="#43a047" />
                        <Cell key="Malaria" fill="#1976d2" />
                        <Cell key="COVID-19" fill="#e53935" />
                      </Pie>
                      <ReTooltip />
                      <Legend />
                    </PieChart>
                  </ReResponsiveContainer>
                  <Typography variant="subtitle1" sx={{ mt: 4, mb: 1 }}>Cases by Location</Typography>
                  <ReResponsiveContainer width="100%" height={220}>
                    <BarChart data={casesByLocation.length ? casesByLocation : [
                      { location: 'Nairobi', Cholera: 2, Malaria: 4, COVID: 1 },
                      { location: 'Mombasa', Cholera: 1, Malaria: 2, COVID: 0 },
                      { location: 'Kisumu', Cholera: 0, Malaria: 3, COVID: 1 },
                    ]} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <ReCartesianGrid strokeDasharray="3 3" />
                      <ReXAxis dataKey="location" />
                      <ReYAxis allowDecimals={false} />
                      <ReTooltip />
                      <Legend />
                      <Bar dataKey="Cholera" fill="#43a047" />
                      <Bar dataKey="Malaria" fill="#1976d2" />
                      <Bar dataKey="COVID" fill="#e53935" />
                    </BarChart>
                  </ReResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
      {tab === 2 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>My Reported Cases</Typography>
          <Grid container spacing={2}>
            {casesToDisplay.map((c: any) => (
              <Grid item xs={12} sm={6} md={4} key={c.id}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{c.disease}</Typography>
                  <Typography variant="body2">Location: {c.location}</Typography>
                  <Typography variant="body2">Date: {c.date}</Typography>
                  <Typography variant="body2">Status: {c.status}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          {/* Suggestion: Add a table or export option for real data */}
        </Box>
      )}
      {tab === 3 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Hospital/Clinic Information</Typography>
          <Card sx={{ maxWidth: 500, mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{hospitalToDisplay.name}</Typography>
              <Typography variant="body2">Address: {hospitalToDisplay.address}</Typography>
              <Typography variant="body2">Contact: {hospitalToDisplay.contact}</Typography>
              <Typography variant="body2">Status: {hospitalToDisplay.status}</Typography>
              {/* Add hospital logo or image here */}
            </CardContent>
          </Card>
        </Box>
      )}
      {tab === 4 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Professional Resources</Typography>
          <List>
            {resourcesToDisplay.map((r: any, i: number) => (
              <ListItem key={i}>
                <ListItemIcon><DescriptionIcon color="primary" /></ListItemIcon>
                <ListItemText primary={r.name} />
                <Button variant="outlined" href={r.link} target="_blank">View</Button>
              </ListItem>
            ))}
          </List>
          {/* Suggestion: Add downloadable files, links, or images here */}
        </Box>
      )}
    </Box>
  );
};

export default DoctorDashboard;

// Add mock data at the bottom
const MOCK_CASES = [
  { id: 1, disease: 'Typhoid', patient: 'Jane Doe', date: '2024-06-01', status: 'Reported' },
];
const MOCK_TRENDS = [
  { date: '2024-06-01', cases: 5 },
  { date: '2024-06-02', cases: 7 },
];
const MOCK_HOSPITAL = { name: 'Nairobi Hospital', address: 'Nairobi', contact: '0712345678', status: 'Approved' };
const MOCK_RESOURCES = [
  { id: 1, name: 'Malaria Guidelines', link: '#' },
]; 