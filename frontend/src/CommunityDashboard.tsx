import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, List, ListItem, ListItemText, ListItemIcon, Tabs, Tab, Button, Grid, Paper, TextField, InputAdornment, Alert, Divider } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import PlaceIcon from '@mui/icons-material/Place';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';
import PhoneIcon from '@mui/icons-material/Phone';
// Add imports for map/heatmap
import { MapContainer, TileLayer } from 'react-leaflet';
// import HeatmapLayer from 'react-leaflet-heatmap-layer'; // Uncomment if installed
// To use the heatmap, run: npm install react-leaflet-heatmap-layer
import { CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from './supabaseClient';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Chip from '@mui/material/Chip';
import { usePrediction } from './hooks/usePrediction';
import {
  LineChart as ReLineChart,
  Line as ReLine,
  XAxis as ReXAxis,
  YAxis as ReYAxis,
  CartesianGrid as ReCartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer as ReResponsiveContainer
} from 'recharts';
import { useRisk } from './hooks/useRisk';
import { useHotspots } from './hooks/useHotspots';
import { usePersonalizedTips } from './hooks/usePersonalizedTips';

function LoadingSpinner() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
      <span>Loading...</span>
    </Box>
  );
}

interface CommunityDashboardProps {
  tourMode?: boolean;
}

const CommunityDashboard: React.FC<CommunityDashboardProps> = ({ tourMode }) => {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  // State for each section
  const [outbreaks, setOutbreaks] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [helplines, setHelplines] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Search/filter state
  const [outbreakSearch, setOutbreakSearch] = useState('');
  const [outbreakDiseaseFilter, setOutbreakDiseaseFilter] = useState('');
  const [clinicSearch, setClinicSearch] = useState('');

  // Unique disease types for filter dropdown
  const diseaseTypes = Array.from(new Set(outbreaks.map(o => o.disease))).filter(Boolean);

  // Filtered outbreaks
  const filteredOutbreaks = outbreaks.filter(o => {
    const matchesSearch =
      o.disease?.toLowerCase().includes(outbreakSearch.toLowerCase()) ||
      o.location?.toLowerCase().includes(outbreakSearch.toLowerCase()) ||
      (o.date && o.date.includes(outbreakSearch));
    const matchesDisease = outbreakDiseaseFilter ? o.disease === outbreakDiseaseFilter : true;
    return matchesSearch && matchesDisease;
  });

  // Filtered clinics
  const filteredClinics = clinics.filter(c => {
    const search = clinicSearch.toLowerCase();
    return (
      c.name?.toLowerCase().includes(search) ||
      c.address?.toLowerCase().includes(search) ||
      c.location?.toLowerCase().includes(search)
    );
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Fetch all data in parallel
    Promise.all([
      supabase.from('cases').select('*').order('date', { ascending: false }),
      supabase.from('tips').select('*').order('created_at', { ascending: false }),
      supabase.from('clinics').select('*').order('created_at', { ascending: false }),
      supabase.from('helplines').select('*').order('created_at', { ascending: false }),
      supabase.from('faq').select('*').order('created_at', { ascending: false }),
    ])
      .then(([outbreakRes, tipsRes, clinicsRes, helplinesRes, faqRes]) => {
        if (outbreakRes.error || tipsRes.error || clinicsRes.error || helplinesRes.error || faqRes.error) {
          setError('Failed to load some data.');
        } else {
          setOutbreaks(outbreakRes.data || []);
          setTips(tipsRes.data || []);
          setClinics(clinicsRes.data || []);
          setHelplines(helplinesRes.data || []);
          setFaqs(faqRes.data || []);
        }
      })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  }, []);

  // Use mock data if tourMode
  const outbreaksToDisplay = tourMode ? MOCK_OUTBREAKS : filteredOutbreaks;
  const tipsToDisplay = tourMode ? MOCK_TIPS : tips;
  const clinicsToDisplay = tourMode ? MOCK_CLINICS : filteredClinics;
  const helplinesToDisplay = tourMode ? MOCK_HELPLINES : helplines;
  const faqsToDisplay = tourMode ? MOCK_FAQ : faqs;

  // AI Prediction for Community
  const communityDisease = 'Malaria';
  const { loading: aiLoading, error: aiError, data: aiData } = usePrediction({ disease: communityDisease, predict_range: 7 });

  // New AI/Analytics hooks
  const { loading: riskLoading, error: riskError, data: riskData } = useRisk({ location: 'Nairobi' });
  const { loading: hotspotsLoading, error: hotspotsError, data: hotspotsData } = useHotspots({});
  const { loading: tipsLoading, error: tipsError, data: tipsData } = usePersonalizedTips({ location: 'Nairobi' });

  // Custom dot for anomaly highlighting
  const AnomalyDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.anomaly) {
      return <circle cx={cx} cy={cy} r={5} fill="#d32f2f" stroke="#fff" strokeWidth={1} />;
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f4f6fa', px: 0, py: 0 }}>
      {/* Banner and Title - full width */}
      <Box sx={{ width: '100%', bgcolor: 'white', py: 1, px: 0, mb: 0 }}>
        <Alert
          severity="info"
          icon={false}
          sx={{
            mb: 0,
            fontSize: { xs: '1rem', md: '1.1rem' },
            fontWeight: 500,
            background: 'none',
            color: '#1976d2',
            border: 'none',
            borderRadius: 0,
            py: 0,
            px: 0,
            textAlign: 'left',
            boxShadow: 'none',
            letterSpacing: 0.2,
          }}
        >
          Welcome to the Community Dashboard! Stay informed, stay safe, and help your neighborhood.
        </Alert>
        <Typography variant="h3" sx={{ mt: 1, mb: 0, fontWeight: 800, color: '#1976d2', textAlign: { xs: 'center', md: 'left' }, letterSpacing: 1, fontSize: { xs: '2rem', md: '2.3rem' } }}>
          <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '2.2rem' }} /> Community Dashboard
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            mb: 2,
            mt: 1,
            pl: 0,
            width: '100%',
            bgcolor: 'white',
            boxShadow: 1,
            borderRadius: 0,
            '.MuiTabs-flexContainer': {
              justifyContent: { xs: 'center', md: 'flex-start' },
              flexWrap: { xs: 'wrap', md: 'nowrap' },
            },
          }}
          variant="scrollable"
          scrollButtons={false}
        >
          <Tab label="Outbreaks" icon={<MapIcon />} iconPosition="start" />
          <Tab label="Tips & Facts" icon={<InfoIcon />} iconPosition="start" />
          <Tab label="Clinics Nearby" icon={<LocalHospitalIcon />} iconPosition="start" />
          <Tab label="Helplines" icon={<PhoneIcon />} iconPosition="start" />
          <Tab label="FAQ" icon={<HelpIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      {/* Main Content - no horizontal padding, flush with sidebar */}
      <Box sx={{ width: '100%', px: 0, py: 0, mt: 2 }}>
        {loading ? <LoadingSpinner /> : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : (
          <Box>
            {/* Outbreaks Tab Content */}
            {tab === 0 && (
              <Box sx={{ mb: 2 }}>
                {/* AI Prediction Summary and Outbreaks Section */}
                <Box sx={{ mb: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 2, boxShadow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <InfoIcon color="success" sx={{ fontSize: 32 }} />
                  <Box sx={{ flex: 1 }}>
                    {aiLoading && <Typography>Loading AI prediction...</Typography>}
                    {aiError && <Typography color="error">{aiError}</Typography>}
                    {aiData && aiData.trend_explanation && (
                      <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 600, mb: 1 }}>
                        {aiData.trend_explanation}
                      </Typography>
                    )}
                    {aiData && aiData.predictions && (
                      <>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#388e3c' }}>
                          AI predicts {Math.round(aiData.predictions.reduce((sum: number, p: { predicted_cases: number }) => sum + p.predicted_cases, 0))} {communityDisease} cases in the next 7 days
                        </Typography>
                        <Box sx={{ width: 180, height: 80 }}>
                          <ReResponsiveContainer width="100%" height="100%">
                            <ReLineChart data={aiData.predictions} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                              <ReXAxis dataKey="days_from_now" hide />
                              <ReYAxis hide />
                              <ReLine type="monotone" dataKey="predicted_cases" stroke="#388e3c" dot={false} strokeWidth={2} />
                              {/* Highlight anomalies with red dots */}
                              <ReLine
                                dataKey="predicted_cases"
                                stroke="none"
                                dot={<AnomalyDot />}
                                legendType="none"
                                activeDot={false}
                              />
                            </ReLineChart>
                          </ReResponsiveContainer>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
                {/* --- New Analytics Sections --- */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: '#fffde7', boxShadow: 1 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>Risk Scores (Nairobi)</Typography>
                        {riskLoading && <Typography>Loading risk scores...</Typography>}
                        {riskError && <Typography color="error">{riskError}</Typography>}
                        {riskData && riskData.risk_scores && Object.entries(riskData.risk_scores).map(([disease, info]: any) => (
                          <Box key={disease} sx={{ mb: 1 }}>
                            <Chip label={disease} sx={{ mr: 1 }} />
                            <b>{info.risk}</b> (Recent: {info.recent_cases}, Avg: {info.avg_daily_cases})
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: '#e3f2fd', boxShadow: 1 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>Hotspots (7 days)</Typography>
                        {hotspotsLoading && <Typography>Loading hotspots...</Typography>}
                        {hotspotsError && <Typography color="error">{hotspotsError}</Typography>}
                        {hotspotsData && hotspotsData.hotspots && hotspotsData.hotspots.length === 0 && <Typography>No hotspots detected.</Typography>}
                        {hotspotsData && hotspotsData.hotspots && hotspotsData.hotspots.map((h: any, i: number) => (
                          <Box key={i} sx={{ mb: 1 }}>
                            <Chip label={h.disease} sx={{ mr: 1 }} />
                            <b>{h.location}</b>: {h.cases} cases (<b>{h.risk}</b>)
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: '#f3e5f5', boxShadow: 1 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>Personalized Tips (Nairobi)</Typography>
                        {tipsLoading && <Typography>Loading tips...</Typography>}
                        {tipsError && <Typography color="error">{tipsError}</Typography>}
                        {tipsData && tipsData.tips && tipsData.tips.map((tip: string, i: number) => (
                          <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>• {tip}</Typography>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                {/* Outbreaks Section continues... */}
                <Box sx={{ mb: 2, bgcolor: '#fcfdff', borderRadius: 2, p: 1, boxShadow: 1, border: '1px solid #e3e8ee', width: '100%' }}>
                  <Typography variant="h4" sx={{ mb: 2, color: '#1976d2', fontWeight: 800, textAlign: { xs: 'center', md: 'left' }, fontSize: { xs: '1.2rem', md: '1.4rem' } }}>
                    <MapIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '1.3rem' }} /> Outbreak Map & Recent Reports
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1, mb: 2, alignItems: { md: 'center' }, width: '100%' }}>
                    <TextField
                      label="Search outbreaks"
                      value={outbreakSearch}
                      onChange={e => setOutbreakSearch(e.target.value)}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ minWidth: 140, flex: 2, bgcolor: '#fff', borderRadius: 2, fontSize: { md: '0.95rem' }, width: { xs: '100%', md: 'auto' } }}
                    />
                    <TextField
                      select
                      label="Filter by disease"
                      value={outbreakDiseaseFilter}
                      onChange={e => setOutbreakDiseaseFilter(e.target.value)}
                      size="small"
                      sx={{ minWidth: 100, flex: 1, bgcolor: '#fff', borderRadius: 2, fontSize: { md: '0.95rem' }, width: { xs: '100%', md: 'auto' } }}
                    >
                      <MenuItem value="">All</MenuItem>
                      {diseaseTypes.map(d => (
                        <MenuItem key={d} value={d}>{d}</MenuItem>
                      ))}
                    </TextField>
                  </Box>
                  <Box sx={{ width: '100%', height: { xs: 140, md: 180 }, mb: 2, borderRadius: 2, overflow: 'hidden', boxShadow: 0 }}>
                    <MapContainer center={[-1.286389, 36.817223]} zoom={6} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {/* Show outbreak locations as circle markers */}
                      {outbreaksToDisplay.filter(o => o.latitude && o.longitude).map((o, i) => (
                        <CircleMarker
                          key={o.id || i}
                          center={[o.latitude, o.longitude]}
                          radius={8}
                          pathOptions={{ color: '#e53935', fillColor: '#e57373', fillOpacity: 0.7 }}
                        >
                          <Tooltip>
                            <div>
                              <strong>{o.disease}</strong><br />
                              Location: {o.location}<br />
                              Cases: {o.cases || o.symptoms || '-'}<br />
                              Date: {o.date}
                            </div>
                          </Tooltip>
                        </CircleMarker>
                      ))}
                    </MapContainer>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h5" sx={{ mb: 2, color: '#1976d2', fontWeight: 800, textAlign: { xs: 'center', md: 'left' }, fontSize: { xs: '1.05rem', md: '1.15rem' } }}>Recent Outbreaks</Typography>
                  <Grid container spacing={1}>
                    {outbreaksToDisplay.map((o, i) => (
                      <Grid item xs={12} sm={6} md={4} key={o.id || i}>
                        <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 2, height: '100%', boxShadow: 1, border: '1px solid #e3e8ee', width: '100%', position: 'relative' }}>
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Doctor Verified"
                            color="success"
                            size="small"
                            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.1rem' } }}>{o.disease}</Typography>
                          <Typography variant="body2">Location: {o.location}</Typography>
                          <Typography variant="body2">Cases: {o.cases || o.symptoms || '-'}</Typography>
                          <Typography variant="body2">Date: {o.date}</Typography>
                        </Box>
                      </Grid>
                    ))}
                    {outbreaksToDisplay.length === 0 && (
                      <Grid item xs={12}><Typography>No outbreaks found.</Typography></Grid>
                    )}
                  </Grid>
                </Box>
              </Box>
            )}
            {/* Tips & Facts Tab Content */}
            {tab === 1 && (
              <Box sx={{ mb: 2, p: 1, borderRadius: 2, bgcolor: '#fcfdff', boxShadow: 1, border: '1px solid #e3e8ee', width: '100%' }}>
                <Typography variant="h4" sx={{ mb: 2, color: '#1976d2', fontWeight: 800, textAlign: { xs: 'center', md: 'left' }, fontSize: { xs: '1.2rem', md: '1.4rem' } }}>
                  <InfoIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '1.3rem' }} /> Prevention Tips & Health Facts
                </Typography>
                <List sx={{ bgcolor: 'transparent', width: '100%' }}>
                  {tipsToDisplay.map((tip, i) => (
                    <ListItem key={tip.id || i} sx={{ py: 0.5 }}>
                      <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                      <ListItemText primary={tip.title} secondary={tip.content} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            {/* Clinics Nearby Tab Content */}
            {tab === 2 && (
              <Box sx={{ mb: 2, p: 1, borderRadius: 2, bgcolor: '#fcfdff', boxShadow: 1, border: '1px solid #e3e8ee', width: '100%' }}>
                <Typography variant="h4" sx={{ mb: 2, color: '#1976d2', fontWeight: 800, textAlign: { xs: 'center', md: 'left' }, fontSize: { xs: '1.2rem', md: '1.4rem' } }}>
                  <LocalHospitalIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '1.3rem' }} /> Clinics & Hospitals Near You
                </Typography>
                <Box sx={{ mb: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, width: '100%' }}>
                  <TextField
                    label="Search clinics/hospitals"
                    value={clinicSearch}
                    onChange={e => setClinicSearch(e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ minWidth: 140, maxWidth: 220, bgcolor: '#fff', borderRadius: 2, fontSize: { md: '0.95rem' }, width: { xs: '100%', sm: 'auto' } }}
                  />
                </Box>
                <Grid container spacing={1}>
                  {clinicsToDisplay.map((c, i) => (
                    <Grid item xs={12} sm={6} md={4} key={c.id || i}>
                      <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 2, height: '100%', boxShadow: 1, border: '1px solid #e3e8ee', width: '100%' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.1rem' } }}>{c.name}</Typography>
                        <Typography variant="body2">{c.address}</Typography>
                        {c.contact && <Button variant="outlined" size="small" startIcon={<PhoneIcon />} href={`tel:${c.contact}`}>{c.contact}</Button>}
                      </Box>
                    </Grid>
                  ))}
                  {clinicsToDisplay.length === 0 && (
                    <Grid item xs={12}><Typography>No clinics found.</Typography></Grid>
                  )}
                </Grid>
              </Box>
            )}
            {/* Helplines Tab Content */}
            {tab === 3 && (
              <Box sx={{ mb: 2, p: 1, borderRadius: 2, bgcolor: '#fcfdff', boxShadow: 1, border: '1px solid #e3e8ee', width: '100%' }}>
                <Typography variant="h4" sx={{ mb: 2, color: '#1976d2', fontWeight: 800, textAlign: { xs: 'center', md: 'left' }, fontSize: { xs: '1.2rem', md: '1.4rem' } }}>
                  <PhoneIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '1.3rem' }} /> Health Helplines
                </Typography>
                <List sx={{ bgcolor: 'transparent', width: '100%' }}>
                  {helplinesToDisplay.map((h, i) => {
                    let email = h.email;
                    if (!email) {
                      if (h.name?.toLowerCase().includes('malaria')) email = 'malaria-support@gmail.com';
                      else if (h.name?.toLowerCase().includes('covid')) email = 'covid19-support@gmail.com';
                      else if (h.name?.toLowerCase().includes('general')) email = 'general-health@gmail.com';
                    }
                    return (
                      <ListItem key={h.id || i} alignItems="flex-start" sx={{ mb: 1, border: '1px solid #e0e0e0', borderRadius: 2, boxShadow: 1, py: 0.5, bgcolor: '#fff', width: '100%' }}>
                        <Box sx={{ width: '100%' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', fontSize: { xs: '1rem', md: '1.1rem' } }}>{h.name}</Typography>
                          {h.description && <Typography variant="body2" sx={{ mb: 1 }}>{h.description}</Typography>}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <PhoneIcon sx={{ mr: 1, color: '#43a047' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{h.phone || '-'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon sx={{ mr: 1, color: '#1976d2' }} />
                            {email ? (
                              <a href={`mailto:${email}`} style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}>{email}</a>
                            ) : <Typography variant="body2" sx={{ fontWeight: 500 }}>-</Typography>}
                          </Box>
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}
            {/* FAQ Tab Content */}
            {tab === 4 && (
              <Box sx={{ mb: 2, p: 1, borderRadius: 2, bgcolor: '#fcfdff', boxShadow: 1, border: '1px solid #e3e8ee', width: '100%' }}>
                <Typography variant="h4" sx={{ mb: 2, color: '#1976d2', fontWeight: 800, textAlign: { xs: 'center', md: 'left' }, fontSize: { xs: '1.2rem', md: '1.4rem' } }}>
                  <HelpIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '1.3rem' }} /> Frequently Asked Questions
                </Typography>
                <List sx={{ bgcolor: 'transparent', width: '100%' }}>
                  {faqsToDisplay.map((f, i) => (
                    <ListItem key={f.id || i} alignItems="flex-start" sx={{ py: 0.5 }}>
                      <ListItemIcon><HelpIcon color="primary" /></ListItemIcon>
                      <ListItemText primary={f.question} secondary={f.answer} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CommunityDashboard;

// Add mock data at the bottom
const MOCK_OUTBREAKS = [
  { id: 1, disease: 'Cholera', location: 'Kibera', date: '2024-06-01', cases: 12 },
  { id: 2, disease: 'Malaria', location: 'Mathare', date: '2024-06-02', cases: 8 },
];
const MOCK_TIPS = [
  { id: 1, title: 'Wash your hands regularly.', content: 'Regular hand washing is one of the most effective ways to prevent the spread of many diseases.' },
  { id: 2, title: 'Boil drinking water.', content: 'Boiling water kills bacteria and other harmful microorganisms. It\'s especially important in areas with poor sanitation.' },
];
const MOCK_CLINICS = [
  { id: 1, name: 'Kibera Health Center', address: 'Kibera', contact: '0712345678' },
];
const MOCK_HELPLINES = [
  { id: 1, name: 'Red Cross', phone: '1199', email: 'info@redcross.or.ke' },
];
const MOCK_FAQ = [
  { id: 1, question: 'What is an outbreak?', answer: 'A sudden increase in cases of a disease.' },
]; 