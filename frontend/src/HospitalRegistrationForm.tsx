import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Snackbar, Alert, CircularProgress } from '@mui/material';
import { supabase } from './supabaseClient';
import { Link } from 'react-router-dom';

const initialForm = {
  name: '',
  registration_number: '',
  address: '',
  contact_email: '',
  phone: '', // Add phone to form
};

export default function HospitalRegistrationForm() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const ONBOARDING_FEE = 5000; // KES

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPaymentError(null);
    setPaymentSuccess(null);
    // 1. Initiate payment first
    setPaymentLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const res = await fetch(`${API_URL}/mpesa/stkpush`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, amount: ONBOARDING_FEE }),
      });
      if (!res.ok) throw new Error('Failed to initiate payment.');
      const data = await res.json();
      if (data.ResponseCode !== '0') {
        setPaymentError(data.CustomerMessage || 'Payment initiation failed.');
        setPaymentLoading(false);
        setLoading(false);
        return;
      }
      setPaymentSuccess('STK Push sent! Please check your phone to complete the payment.');
      // Optionally, wait for user to confirm payment before proceeding (for now, proceed to submit)
    } catch (err: any) {
      setPaymentError(err.message || 'Payment initiation failed.');
      setPaymentLoading(false);
      setLoading(false);
      return;
    }
    setPaymentLoading(false);
    // 2. Submit application to Supabase
    try {
      const { error } = await supabase.from('hospital_applications').insert([
        { name: form.name, registration_number: form.registration_number, address: form.address, contact_email: form.contact_email, phone: form.phone }
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
          <Alert severity="info" sx={{ mb: 3 }}>
            <b>Note:</b> Hospital/Clinic onboarding is subject to a <b>Ksh 5000 monthly fee</b> (non-refundable). Payment is required to complete your application.
          </Alert>
          {paymentError && <Alert severity="error" sx={{ mb: 2 }}>{paymentError}</Alert>}
          {paymentSuccess && <Alert severity="success" sx={{ mb: 2 }}>{paymentSuccess}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Application submitted successfully! We will contact you soon.</Alert>}
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
              value={form.contact_email}
              onChange={handleChange}
              fullWidth
              required
              type="email"
              sx={{ mb: 2 }}
            />
            <TextField
              label="Safaricom Phone Number (for payment)"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading || paymentLoading}
              sx={{ py: 1.5, fontWeight: 600 }}
            >
              {loading || paymentLoading ? <CircularProgress size={24} /> : 'Submit Application & Pay'}
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