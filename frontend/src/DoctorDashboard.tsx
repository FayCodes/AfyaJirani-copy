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
import SendIcon from '@mui/icons-material/Send';
import { usePrediction } from './hooks/usePrediction';
import { useRisk } from './hooks/useRisk';
import { useHotspots } from './hooks/useHotspots';
import { usePersonalizedTips } from './hooks/usePersonalizedTips';

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
  address: '123 Main St, Nairobi',
  contact: '+254 712 345678',
  status: 'Approved',
  logo: 'https://via.placeholder.com/80x80?text=Logo',
};

const mockResources = [
  { name: 'Case Reporting Guidelines (PDF)', link: 'https://www.who.int/publications/i/item/9789240011311' },
  { name: 'Outbreak Response SOP', link: 'https://www.cdc.gov/coronavirus/2019-ncov/hcp/clinical-guidance-management-patients.html' },
  { name: 'Downloadable Case Form', link: 'https://www.moh.gov.ke/wp-content/uploads/2020/03/Case-Investigation-Form.pdf' },
  { name: 'Ministry of Health Updates', link: 'https://www.health.go.ke/' },
  { name: 'WHO Disease Outbreak News', link: 'https://www.who.int/emergencies/disease-outbreak-news' },
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
    doctorName: '',
    clinicName: '',
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
  const { loading: predLoading, error: predError, data: predData } = usePrediction({ disease: selectedDisease, predict_range: 7 });
  const { loading: riskLoading, error: riskError, data: riskData } = useRisk({ location: 'Nairobi' });
  const { loading: hotspotsLoading, error: hotspotsError, data: hotspotsData } = useHotspots({});
  const { loading: tipsLoading, error: tipsError, data: tipsData } = usePersonalizedTips({ location: 'Nairobi' });

  // --- Alert/Notification State ---
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [alertMessage, setAlertMessage] = useState('Hi, welcome to AfyaJirani!\nYour health, our priority.\nAfyaJirani connects you to trusted clinics, timely health alerts, and expert care—right in your community.');
  const [alertChannel, setAlertChannel] = useState('whatsapp');
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);

  // Use mock data if tourMode
  const casesToDisplay = tourMode ? MOCK_CASES : cases;
  const trendsToDisplay = tourMode ? MOCK_TRENDS : trends;
  const hospitalToDisplay = (hospital && Object.keys(hospital).length > 0) ? hospital : mockHospital;
  const resourcesToDisplay = (resources && resources.length > 0) ? resources : mockResources;

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
    setSuccess(false);
    try {
      const response = await fetch('http://localhost:8000/report-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disease: form.disease,
          symptoms: form.symptoms,
          location: form.location,
          age_group: form.ageGroup,
          gender: form.gender,
          date: form.date,
          patient_code: form.patientCode || null,
          doctor_name: form.doctorName,
          clinic_name: form.clinicName,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Submission failed.');
      }
      setSuccess(true);
      setForm({ disease: '', symptoms: '', location: '', ageGroup: '', gender: '', date: new Date().toISOString().slice(0, 10), patientCode: '', doctorName: '', clinicName: '' });
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

  // Fetch patients on mount
  useEffect(() => {
    supabase.from('patients').select('*').then(({ data, error }) => {
      if (!error && data) setPatients(data);
    });
  }, []);

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

  // Custom dot for anomaly highlighting
  const AnomalyDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.anomaly) {
      return <circle cx={cx} cy={cy} r={6} fill="#d32f2f" stroke="#fff" strokeWidth={1} />;
    }
    return null;
  };

  return (
    <Box sx={{ mt: 4 }}>
      {tourMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Tour Mode: Viewing as Professional (Read Only)
        </Alert>
      )}
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#1976d2', letterSpacing: 1 }}>Doctor/Hospital Dashboard</Typography>
      <Tabs
        value={tab}
        onChange={handleTab}
        sx={{
          mb: 4,
          background: '#f5f5f5',
          borderRadius: 2,
          boxShadow: 1,
          '.MuiTabs-flexContainer': {
            justifyContent: { xs: 'center', md: 'flex-start' },
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: 1,
          },
        }}
        variant="fullWidth"
        TabIndicatorProps={{ style: { background: '#1976d2', height: 4, borderRadius: 2 } }}
      >
        <Tab label="Report Case" icon={<AssignmentIcon />} iconPosition="start" sx={{ fontWeight: 600, fontSize: 16, minWidth: 120 }} />
        <Tab label="Trends" icon={<TrendingUpIcon />} iconPosition="start" sx={{ fontWeight: 600, fontSize: 16, minWidth: 120 }} />
        <Tab label="My Cases" icon={<DescriptionIcon />} iconPosition="start" sx={{ fontWeight: 600, fontSize: 16, minWidth: 120 }} />
        <Tab label="Send Alert" icon={<SendIcon />} iconPosition="start" sx={{ fontWeight: 600, fontSize: 16, minWidth: 120 }} />
        <Tab label="Hospital Info" icon={<LocalHospitalIcon />} iconPosition="start" sx={{ fontWeight: 600, fontSize: 16, minWidth: 120 }} />
        <Tab label="Resources" icon={<InfoIcon />} iconPosition="start" sx={{ fontWeight: 600, fontSize: 16, minWidth: 120 }} />
      </Tabs>
      {/* Tab content styling improvements */}
      {tab === 0 && (
        <Paper elevation={4} sx={{ maxWidth: 700, mx: 'auto', p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, bgcolor: '#fff' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1976d2' }}>Report New Case</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
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
              <TextField name="doctorName" label="Doctor's Name" value={form.doctorName} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} required />
              <TextField name="clinicName" label="Clinic/Hospital Name" value={form.clinicName} onChange={handleInputChange} fullWidth sx={{ mb: 2 }} required />
              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5, fontWeight: 600 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Report Case'}
                </Button>
              </Box>
            </form>
          )}
        </Paper>
      )}
      {tab === 1 && (
        <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, bgcolor: '#f8fafc' }}>
          {/* AI Prediction Section */}
          <Card sx={{ mb: 2, bgcolor: '#e8f5e9', boxShadow: 1, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#388e3c' }}>AI Prediction (7 days)</Typography>
              {predLoading && <Typography>Loading prediction...</Typography>}
              {predError && <Typography color="error">{predError}</Typography>}
              {predData && predData.trend_explanation && (
                <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 600, mb: 1 }}>{predData.trend_explanation}</Typography>
              )}
            </CardContent>
          </Card>
          {/* --- New Analytics Sections --- */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: '#fffde7', boxShadow: 1, borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#fbc02d' }}>Risk Scores (Nairobi)</Typography>
                  {riskLoading && <Typography>Loading risk scores...</Typography>}
                  {riskError && <Typography color="error">{riskError}</Typography>}
                  {riskData && riskData.risk_scores && Object.entries(riskData.risk_scores).map(([disease, info]: any) => (
                    <Box key={disease} sx={{ mb: 1 }}>
                      <b>{disease}</b>: <b>{info.risk}</b> (Recent: {info.recent_cases}, Avg: {info.avg_daily_cases})
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Card sx={{ bgcolor: '#e3f2fd', boxShadow: 1, borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#1976d2' }}>Hotspots</Typography>
                  {hotspotsLoading && <Typography>Loading hotspots...</Typography>}
                  {hotspotsError && <Typography color="error">{hotspotsError}</Typography>}
                  {/* Add map or list of hotspots here */}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Typography variant="subtitle1" sx={{ mt: 4, mb: 1, fontWeight: 700 }}>Cases by Location</Typography>
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
        </Paper>
      )}
      {tab === 2 && (
        <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, bgcolor: '#fff' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1976d2' }}>My Reported Cases</Typography>
          <Grid container spacing={2}>
            {casesToDisplay.map((c: any) => (
              <Grid item xs={12} sm={6} md={4} key={c.id}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: 2, bgcolor: '#f4f6fa' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{c.disease}</Typography>
                  <Typography variant="body2">Location: {c.location}</Typography>
                  <Typography variant="body2">Date: {c.date}</Typography>
                  <Typography variant="body2">Status: {c.status}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
      {tab === 3 && (
        <Paper elevation={4} sx={{ maxWidth: 650, mx: 'auto', p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, bgcolor: '#fff' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1976d2' }}>Send WhatsApp Alert</Typography>
            {alertError && <Alert severity="error" sx={{ mb: 2 }}>{alertError}</Alert>}
            {alertSuccess && <Alert severity="success" sx={{ mb: 2 }}>{alertSuccess}</Alert>}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>Select Patients:</Typography>
            <List dense sx={{ maxHeight: 180, overflow: 'auto', border: '1px solid #eee', mb: 2, borderRadius: 2 }}>
              {patients.map((p: any) => (
                <ListItem key={p.id} button onClick={() => {
                  setSelectedPatients(selectedPatients.includes(p.id)
                    ? selectedPatients.filter(id => id !== p.id)
                    : [...selectedPatients, p.id]);
                }} selected={selectedPatients.includes(p.id)}>
                  <ListItemIcon>
                    <input type="checkbox" checked={selectedPatients.includes(p.id)} readOnly />
                  </ListItemIcon>
                  <ListItemText primary={p.name || p.phone} secondary={p.phone} />
                </ListItem>
              ))}
            </List>
            <TextField
              label="Message"
              multiline
              minRows={3}
              value={alertMessage}
              onChange={e => setAlertMessage(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Channel</InputLabel>
              <Select value={alertChannel} label="Channel" onChange={e => setAlertChannel(e.target.value)}>
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                disabled={alertLoading || selectedPatients.length === 0 || !alertMessage}
                onClick={async () => {
                  setAlertLoading(true);
                  setAlertError(null);
                  setAlertSuccess(null);
                  try {
                    const res = await fetch('http://localhost:8000/send-alert', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'x-api-key': 'testkey' },
                      body: JSON.stringify({
                        patient_ids: selectedPatients,
                        message: alertMessage,
                        channel: alertChannel,
                      }),
                    });
                    if (!res.ok) throw new Error('Failed to send alert');
                    const data = await res.json();
                    setAlertSuccess('Alert sent successfully!');
                    setSelectedPatients([]);
                  } catch (err: any) {
                    setAlertError(err.message || 'Failed to send alert');
                  } finally {
                    setAlertLoading(false);
                  }
                }}
                sx={{ px: 4, py: 1.5, fontWeight: 600 }}
              >
                {alertLoading ? <CircularProgress size={20} /> : 'Send'}
              </Button>
            </Box>
          </CardContent>
        </Paper>
      )}
      {tab === 4 && (
        <Paper elevation={4} sx={{ maxWidth: 520, mb: 4, p: { xs: 2, md: 4 }, borderRadius: 4, bgcolor: '#fff' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1976d2' }}>Hospital/Clinic Information</Typography>
          <Card sx={{ mb: 2, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{hospitalToDisplay.name}</Typography>
              <Typography variant="body2">Address: {hospitalToDisplay.address}</Typography>
              <Typography variant="body2">Contact: {hospitalToDisplay.contact}</Typography>
              <Typography variant="body2">Status: {hospitalToDisplay.status}</Typography>
              {hospitalToDisplay.logo && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img src={hospitalToDisplay.logo} alt="Hospital Logo" style={{ width: 80, height: 80, borderRadius: 8 }} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Paper>
      )}
      {tab === 5 && (
        <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, bgcolor: '#fff' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1976d2' }}>Professional Resources</Typography>
          <List>
            {resourcesToDisplay.map((r: any, i: number) => (
              <ListItem key={i}>
                <ListItemIcon><DescriptionIcon color="primary" /></ListItemIcon>
                <ListItemText primary={r.name} />
                <Button variant="outlined" href={r.link} target="_blank">View</Button>
              </ListItem>
            ))}
          </List>
        </Paper>
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