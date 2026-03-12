# NoFoodWaste Operations Platform

Internal logistics platform for NGO food rescue operations.

## Features

- **RBAC Authentication** (Admin, Coordinator, Driver)
- **Pickup Scheduling** with driver assignment
- **Proof Submission** with photos, GPS, and voice notes
- **Verification Module** for coordinators/admins
- **Analytics Dashboard** with charts and CSV export
- **Mock API Layer** (no backend required)

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- React Router v6
- Context API (Auth + RBAC)
- Recharts (Analytics)
- LocalStorage (Mock Backend)

## Quick Start

### Requirements

- Node.js 20.19.0 or newer

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Demo Credentials

### Admin
- Phone: `9876543210`
- Password: `admin123`

### Coordinator
- Phone: `9876543211`
- Password: `coord123`

### Driver
- Phone: `9876543212`
- Password: `driver123`

## Project Structure

```
src/
├── auth/              # AuthContext, RoleGuard
├── layouts/           # DashboardLayout
├── components/        # Reusable components
├── pages/
│   ├── auth/         # Login, Register, ForgotPassword
│   ├── admin/        # Admin pages
│   ├── coordinator/  # Coordinator pages
│   ├── driver/       # Driver pages
│   ├── verification/ # Verification module
│   └── analytics/    # Analytics dashboard
├── services/         # mockApi.js
└── App.jsx           # Routes
```

## Branding

The UI follows NoFoodWaste.org branding:
- Primary: Orange (#FF6B35)
- Accent: Green (#4CAF50)
- Typography: Poppins
- Clean NGO aesthetic with soft shadows

## Deployment

Ready for Vercel deployment:

```bash
# Deploy to Vercel
vercel --prod
```

## License

Internal use only - NoFoodWaste Organization
