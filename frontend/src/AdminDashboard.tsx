import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Stack, Snackbar, Alert, CircularProgress, Tabs, Tab, Grid, Paper, List, ListItem, ListItemText, ListItemIcon, TextField } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MessageIcon from '@mui/icons-material/Message';
import HistoryIcon from '@mui/icons-material/History';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { supabase } from './supabaseClient';

const mockStats = {
  community: 1200,
  professionals: 45,
  hospitals: 12,
};

const mockPerformance = [
  { metric: 'Uptime', value: '99.98%' },
  { metric: 'Avg. Response Time', value: '320ms' },
  { metric: 'Errors (24h)', value: 2 },
];

const mockUsers = [
  { name: 'Jane Doe', role: 'community', email: 'jane@email.com' },
  { name: 'Dr. John Smith', role: 'doctor', email: 'john@email.com' },
  { name: 'Admin User', role: 'admin', email: 'admin@email.com' },
];

const mockLogs = [
  { action: 'Approved hospital application', user: 'Admin User', date: '2024-06-01' },
  { action: 'Broadcast message sent', user: 'Admin User', date: '2024-06-02' },
  { action: 'User login', user: 'Dr. John Smith', date: '2024-06-03' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hospital_applications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    if (error) setError(error.message);
    else setApplications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (app: any) => {
    setActionLoading(app.id);
    setError(null);
    setSuccess(null);
    const invite_code = Math.random().toString(36).substring(2, 8).toUpperCase(); // Mock code
    try {
      // 1. Insert into hospitals
      const { error: hospError } = await supabase.from('hospitals').insert([
        {
          name: app.name,
          registration_number: app.registration_number,
          address: app.address,
          contact_email: app.contact_email,
          status: 'approved',
          invite_code,
        },
      ]);
      if (hospError) throw hospError;
      // 2. Update application status
      const { error: appError } = await supabase
        .from('hospital_applications')
        .update({ status: 'approved' })
        .eq('id', app.id);
      if (appError) throw appError;
      setSuccess(`Approved! Invite code: ${invite_code}`);
      setInviteCode(invite_code);
      setInviteDialogOpen(true);
      fetchApplications();
    } catch (err: any) {
      setError(err.message || 'Approval failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (app: any) => {
    setActionLoading(app.id);
    setError(null);
    setSuccess(null);
    try {
      const { error: appError } = await supabase
        .from('hospital_applications')
        .update({ status: 'rejected' })
        .eq('id', app.id);
      if (appError) throw appError;
      setSuccess('Application rejected.');
      fetchApplications();
    } catch (err: any) {
      setError(err.message || 'Rejection failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBroadcast = () => {
    setBroadcastSuccess(true);
    setBroadcastMsg('');
    // In real app, send message to all users
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteCode);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Admin Dashboard</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Pending Applications" icon={<LocalHospitalIcon />} iconPosition="start" />
        <Tab label="User Stats" icon={<PeopleIcon />} iconPosition="start" />
        <Tab label="System Performance" icon={<AssessmentIcon />} iconPosition="start" />
        <Tab label="Manage Users" icon={<AdminPanelSettingsIcon />} iconPosition="start" />
        <Tab label="Broadcast" icon={<MessageIcon />} iconPosition="start" />
        <Tab label="Audit Logs" icon={<HistoryIcon />} iconPosition="start" />
      </Tabs>
      {tab === 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Pending Hospital/Clinic Applications</Typography>
          {loading ? <CircularProgress /> : (
            <Stack spacing={3}>
              {applications.map(app => (
                <Card key={app.id}>
                  <CardContent>
                    <Typography variant="h6">{app.name}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>Reg. No: {app.registration_number}</Typography>
                    <Typography variant="body2">Address: {app.address}</Typography>
                    <Typography variant="body2">Email: {app.contact_email}</Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        disabled={!!actionLoading}
                        onClick={() => handleApprove(app)}
                      >
                        {actionLoading === app.id ? <CircularProgress size={20} /> : 'Approve'}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        disabled={!!actionLoading}
                        onClick={() => handleReject(app)}
                      >
                        {actionLoading === app.id ? <CircularProgress size={20} /> : 'Reject'}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      )}
      {tab === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>User Statistics</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                <Typography variant="subtitle1">Community Users</Typography>
                <Typography variant="h5">{mockStats.community}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                <LocalHospitalIcon sx={{ fontSize: 40, color: '#43a047' }} />
                <Typography variant="subtitle1">Professionals</Typography>
                <Typography variant="h5">{mockStats.professionals}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                <AdminPanelSettingsIcon sx={{ fontSize: 40, color: '#ffa726' }} />
                <Typography variant="subtitle1">Hospitals/Clinics</Typography>
                <Typography variant="h5">{mockStats.hospitals}</Typography>
              </Paper>
            </Grid>
          </Grid>
          {/* Suggestion: Add charts or images for stats */}
        </Box>
      )}
      {tab === 2 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>System Performance</Typography>
          <List>
            {mockPerformance.map((p, i) => (
              <ListItem key={i}>
                <ListItemIcon><AssessmentIcon color="primary" /></ListItemIcon>
                <ListItemText primary={p.metric} secondary={p.value} />
              </ListItem>
            ))}
          </List>
          {/* Suggestion: Add performance charts or error logs here */}
        </Box>
      )}
      {tab === 3 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Manage Users</Typography>
          <List>
            {mockUsers.map((u, i) => (
              <ListItem key={i}>
                <ListItemIcon><PeopleIcon color="primary" /></ListItemIcon>
                <ListItemText primary={u.name} secondary={`${u.role} - ${u.email}`} />
                <Button variant="outlined" color="error">Deactivate</Button>
              </ListItem>
            ))}
          </List>
          {/* Suggestion: Add search, filter, or export options */}
        </Box>
      )}
      {tab === 4 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Broadcast Message</Typography>
          <TextField
            label="Message"
            multiline
            rows={3}
            value={broadcastMsg}
            onChange={e => setBroadcastMsg(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleBroadcast} disabled={!broadcastMsg}>
            Send to All Users
          </Button>
          <Snackbar open={broadcastSuccess} autoHideDuration={3000} onClose={() => setBroadcastSuccess(false)}>
            <Alert severity="success" sx={{ width: '100%' }}>
              Broadcast sent!
            </Alert>
          </Snackbar>
        </Box>
      )}
      {tab === 5 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Audit Logs</Typography>
          <List>
            {mockLogs.map((l, i) => (
              <ListItem key={i}>
                <ListItemIcon><HistoryIcon color="primary" /></ListItemIcon>
                <ListItemText primary={l.action} secondary={`${l.user} - ${l.date}`} />
              </ListItem>
            ))}
          </List>
          {/* Suggestion: Add export or filter options for logs */}
        </Box>
      )}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)}>
        <DialogTitle>Hospital Invite Code</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Share this invite code with the hospital admin so their professionals can register:</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mr: 2 }}>{inviteCode}</Typography>
            <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopyInvite}>Copy</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!success} autoHideDuration={5000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
} 