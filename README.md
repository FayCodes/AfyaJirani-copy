# AfyaJirani

AfyaJirani is a comprehensive, community-driven disease outbreak alert and health management platform. It leverages AI, secure data reporting, and real-time communication to empower communities, healthcare professionals, and administrators to respond rapidly to public health threats.

---

## 🚀 Project Overview
AfyaJirani bridges the gap between communities and healthcare systems by providing:
- **Early detection** of disease outbreaks
- **Secure, role-based reporting** for community members, doctors, and admins
- **Automated alerts** via SMS/WhatsApp
- **Seamless hospital onboarding** with M-Pesa integration
- **AI-powered analytics** for risk and anomaly detection

---

## 🌟 Key Features
- **Community Dashboard:** Report symptoms, receive alerts, and view local health trends
- **Doctor Dashboard:** Review, verify, and escalate community reports
- **Admin Dashboard:** Oversee system activity, manage users, and monitor outbreaks
- **Hospital Registration:** Onboard hospitals with secure M-Pesa payments
- **AI Analytics:** Predict outbreaks, flag anomalies, and provide actionable insights
- **Audit Logging:** Track all sensitive actions for transparency and compliance
- **Production-Ready Security:** API key enforcement, CORS restrictions, and environment variable management

---

## 🏗️ Architecture
- **Frontend:** React (TypeScript), role-based dashboards, responsive UI
- **Backend:** Node.js/Express (or Python/Flask), RESTful API, Supabase for auth and data
- **AI Module:** Python-based analytics and prediction engine
- **Database:** Supabase/PostgreSQL with Row Level Security (RLS)
- **Payments:** M-Pesa Daraja API integration

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v16+)
- Python 3.8+
- Supabase account
- M-Pesa Daraja API credentials

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/AfyaJirani-copy.git
cd AfyaJirani-copy
```

### 2. Environment Variables
- Copy `.env.example` to `.env` in each relevant directory (`ai/`, `backend/`, etc.)
- Fill in all required secrets (Supabase, M-Pesa, Twilio, etc.)

### 3. Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# AI Module
cd ../ai
pip install -r requirements.txt
```

### 4. Run the Application
```bash
# Start backend
cd backend
npm start

# Start frontend
cd ../frontend
npm start

# Start AI module (if separate)
cd ../ai
python app.py
```

---

## 🔒 Security & Best Practices
- All sensitive endpoints require API key authentication
- CORS is restricted to trusted origins
- Secrets are stored in `.env` files (never committed)
- Audit logs are maintained for all critical actions
- Regular security sweeps are recommended

---

## 📝 Usage
- **Community Members:** Register, report symptoms, and receive alerts
- **Doctors:** Log in, review reports, and escalate cases
- **Admins:** Monitor system, manage users, and oversee outbreak response
- **Hospitals:** Register and onboard via M-Pesa

---

## 🛠️ Deployment
- Dockerization supported (see `Dockerfile` if present)
- Environment variables must be set in your deployment platform (Render, Heroku, etc.)
- Ensure all secrets are secure and not exposed

---

## 📞 Contact & Support
For questions, support, or collaboration:
- **Email:** AfyaJirani@gmail.com
- **Phone:** +254 700 000 000 (mock)

---

## 🙏 Acknowledgements
- Community health workers and volunteers
- Open source contributors
- Supabase, M-Pesa, Twilio, and all technology partners

---

## 📄 License
MIT License. See `LICENSE` for details. 
