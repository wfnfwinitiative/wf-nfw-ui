# No Food Waste - UI Dashboard

A modern web application for managing food waste pickup and delivery operations. Built with React, Vite, and Tailwind CSS.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Building for Production](#building-for-production)
- [Linting](#linting)
- [Project Structure](#project-structure)
- [Demo Accounts](#demo-accounts)
- [Features](#features)
- [Technologies](#technologies)
- [Contributing](#contributing)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 16.x or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js (version 8.x or higher)
- **Git**: For version control ([Download](https://git-scm.com/))

To verify your installations, run:
```bash
node --version
npm --version
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/no-food-waste-ui.git
cd no-food-waste-ui
cd no-food-waste-ui
```

### 2. Install Dependencies

```bash
npm install
```

This will install all project dependencies including:
- **React** (19.2.0) - UI library
- **React Router** (7.13.0) - Client-side routing
- **Tailwind CSS** (4.1.18) - Utility-first CSS framework
- **Lucide React** - Icon library
- **Vite** - Modern build tool
- **ESLint** - Code quality tool

## Running the Project

### Development Mode

To run the project in development mode with hot module reload (HMR):

```bash
npm run dev
```

The application will start and automatically open at `http://localhost:5173`

**Features in dev mode:**
- Hot Module Reload (HMR) - changes reflect instantly
- Source maps for easy debugging
- Detailed error messages

### Production Build

To create an optimized production build:

```bash
npm run build
```

This generates a `dist/` folder with optimized and minified files ready for deployment.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Linting

To check code quality and style:

```bash
npm run lint
```

This runs ESLint to identify and report on code issues. For automatic fixes:

```bash
npm run lint -- --fix
```

## Project Structure

```
wf-nfw-ui/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, logos, PDFs
│   ├── components/        # Reusable React components
│   │   ├── auth/         # Authentication components
│   │   ├── common/       # Common UI components (Button, Input, etc.)
│   │   ├── dashboard/    # Dashboard-specific components
│   │   ├── driver/       # Driver features components
│   │   └── layout/       # Layout components (Header, Sidebar)
│   ├── contexts/         # React Context for state management
│   │   └── AuthContext.jsx
│   ├── pages/            # Page components
│   │   ├── LoginPage.jsx
│   │   └── DashboardPage.jsx
│   ├── services/         # API and utility services
│   │   └── mockData.js
│   ├── App.jsx           # Main App component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── eslint.config.js      # ESLint configuration
└── README.md             # This file
```

## Demo Accounts

The application comes with demo accounts for testing different user roles:

| Role | Email | Password |
|------|-------|----------|
| Driver | driver@nofoodwaste.org | driver123 |

To use demo accounts:
1. Go to the login page
2. Click on the demo account button to auto-fill email and password
3. Click "Sign In"

## Features

### 🔐 Authentication
- Secure login system
- Role-based access control (Admin, Coordinator, Driver)
- Session management

### 📦 Dashboard
- Quick statistics overview
- Recent activity feed
- Quick action cards

### 🚚 Driver Features
- View assigned pickups
- Real-time pickup tracking
- Voice input support for form filling
- Image upload for pickup verification
- Timeline view of delivery status

### 🎨 User Interface
- Responsive design (mobile, tablet, desktop)
- Intuitive navigation
- Dark/Light mode compatible
- Tailwind CSS styling

## Technologies

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 7.3.1
- **Styling**: Tailwind CSS 4.1.18
- **Routing**: React Router DOM 7.13.0
- **Icons**: Lucide React 0.574.0
- **Linting**: ESLint 9.39.1

## Environment Setup

### Development Environment Variables

Create a `.env.local` file in the project root (if needed):

```
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=NoFoodWaste
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port 5173 Already in Use

If port 5173 is in use, Vite will automatically use the next available port.

### Clear Cache and Reinstall

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Clear Browser Cache

Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac) to open browser cache clearing options.

## Contributing

To contribute to this project:

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -m 'Add your feature'`
3. Push to the branch: `git push origin feature/your-feature-name`
4. Open a Pull Request

## Support

For issues or questions:
- Visit: [No Food Waste Chennai](https://nofoodwastechennai.ngo)
- Email: support@nofoodwaste.org

## License
No Food Waste

