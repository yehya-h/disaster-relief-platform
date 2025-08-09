# Emergency Admin Panel

A React-based administrative dashboard for managing emergency incidents, shelters, and incident types.

## Features

- **Incident Management**: View and manage emergency incidents with fake/verified status toggle
- **Image Gallery**: Display all images from incident forms
- **Load More Functionality**: Pagination support for large datasets
- **Authentication**: Secure admin login with static credentials
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Clean design with orange, navy, and gray color scheme

## Tech Stack

- **Frontend**: React 18, Vite
- **Routing**: React Router DOM
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Lucide React (web-friendly)
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update environment variables in `.env`:
   ```env
   VITE_NODE_API_IP=your-api-host
   VITE_NODE_API_PORT=your-api-port
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # Main layout with sidebar and header
│   └── ProtectedRoute.jsx  # Route protection component
├── context/
│   └── AuthContext.jsx     # Authentication context
├── pages/
│   ├── Login.jsx           # Login page
│   ├── Incidents.jsx       # Incidents management
│   └── PlaceholderPages.jsx # Shelters and Types pages
├── styles/
│   ├── variables.css       # CSS custom properties
│   └── main.css           # Main styles
├── utils/
│   └── api.js             # API configuration and functions
├── App.jsx                # Main app component
└── main.jsx              # Application entry point
```

## API Integration

The application is configured to work with your backend API using axios interceptors:

- Base URL: `http://${NODE_API_IP}:${NODE_API_PORT}/api`
- Authentication: JWT token stored in localStorage
- Auto-retry on token expiration
- Error handling with user feedback

### Expected API Endpoints

- `GET /incidents?chunk=1` - Get paginated incidents with forms
- `PATCH /incidents/:id` - Update incident fake status
- `POST /auth/admin/login` - Admin authentication (if needed)

## Features in Detail

### Incident Management

- Display incidents with active form data
- Show all images from all forms of an incident
- Toggle fake/verified status with switch component
- Pagination with "Load More" functionality
- Responsive card-based layout

### Authentication

- Static admin credentials for demo
- JWT token management with localStorage
- Automatic redirect on authentication failure
- Protected routes with loading states

### Design System

The application uses a comprehensive design system with:

- **Colors**: Orange primary, Navy secondary, Light gray background
- **Typography**: System font stack with proper hierarchy
- **Spacing**: Consistent spacing scale (0.25rem to 5rem)
- **Components**: Reusable button, card, and form components
- **Responsive**: Mobile-first responsive design

## Future Enhancements

- Shelters management (add, edit, delete)
- Incident types management (add, edit, delete)
- Advanced filtering and search
- Real-time updates
- Export functionality
- User management
- Dashboard analytics

## Contributing

1. Follow the existing code style
2. Use the established component patterns
3. Maintain responsive design principles
4. Test on both desktop and mobile devices

## License

This project is part of an emergency response system.