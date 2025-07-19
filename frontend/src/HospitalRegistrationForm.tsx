import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Snackbar, Alert, CircularProgress } from '@mui/material';
import { supabase } from './supabaseClient';
import { Link } from 'react-router-dom';

const initialForm = {
  name: '',
  registration_number: '',
  address: '',
  contact_email: '',
};

export default function HospitalRegistrationForm() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('hospital_applications').insert([
        { ...form }
      ]);
      if (error) throw error;
      setSuccess(true);
      setForm(initialForm);
    } catch (err: any) {
      setError(err.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 6, maxWidth: 500, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>Hospital/Clinic Registration</Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Please fill out the form below to apply for access. Our team will review your application and contact you soon.
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Hospital/Clinic Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Registration Number"
              name="registration_number"
              value={form.registration_number}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Contact Email"
              name="contact_email"
              type="email"
              value={form.contact_email}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Submit Application'}
            </Button>
          </form>
        </CardContent>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button component={Link} to="/check-application-status" variant="outlined" color="info">
            Check Application Status
          </Button>
        </Box>
      </Card>
      <Snackbar open={success} autoHideDuration={4000} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Application received! We’ll review and contact you soon.
        </Alert>
      </Snackbar>
    </Box>
  );
} 