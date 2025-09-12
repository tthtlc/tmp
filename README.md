# OneST - Singapore Services Portal

OneST is a modern web portal that provides multiple services to the public, specifically designed for Singapore. The platform offers UEN (Unique Entity Number) validation and real-time weather forecast services through a clean, responsive interface.

## 🌟 Features

### UEN Validation Service
- ✅ Validates all three official UEN formats (A, B, C)
- 🏢 Entity type identification and mapping
- 📋 Comprehensive format examples and help
- ⚡ Real-time client-side and server-side validation
- 📱 Mobile-responsive interface

### Weather Forecast Service
- 🌤️ Real-time 2-hour weather forecasts
- 📍 Location-specific forecasts for all Singapore areas
- 🔄 Auto-refresh with caching
- 🗺️ Geographic coordinates for forecast areas
- 📊 Data from official Singapore Government APIs

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   React + Vite  │◄──►│   Next.js API    │◄──►│  External APIs  │
│    Frontend     │    │     Backend      │    │  (Weather Data) │
│   (Port 3000)   │    │   (Port 3001)    │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend:**
- React 18+ with functional components and hooks
- Vite for fast development and optimized builds
- Tailwind CSS for modern, responsive styling
- Axios for HTTP requests
- React Router for navigation
- Lucide React for icons

**Backend:**
- Next.js 13+ with App Router
- RESTful API design
- Built-in rate limiting and security headers
- Comprehensive error handling
- External API integration with fallback mechanisms

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** (version 8.0 or higher)
- **Git** (for cloning the repository)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd onest-portal
```

### 2. Install Dependencies

Install dependencies for both frontend and backend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

**Backend Configuration:**
```bash
cd backend
cp .env.local.example .env.local
# Edit .env.local if needed (default values work for development)
```

**Frontend Configuration:**
No additional environment configuration needed for development.

### 4. Start the Development Servers

**Terminal 1 - Start Backend (Next.js API):**
```bash
cd backend
npm run dev
```
The backend API will be available at `http://localhost:3001`

**Terminal 2 - Start Frontend (React + Vite):**
```bash
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:3000`

### 5. Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api/health

## 📁 Project Structure

```
onest-portal/
├── backend/                 # Next.js Backend API
│   ├── lib/                # Business logic and utilities
│   │   ├── uen-validator.js    # UEN validation logic
│   │   ├── weather-client.js   # Weather API client
│   │   └── error-handler.js    # Error handling utilities
│   ├── pages/api/          # API routes
│   │   ├── uen/
│   │   │   ├── validate.js     # UEN validation endpoint
│   │   │   └── formats.js      # UEN format information
│   │   ├── weather/
│   │   │   ├── forecast.js     # Weather forecast endpoint
│   │   │   └── locations.js    # Available locations
│   │   └── health.js           # Health check endpoint
│   ├── middleware.js       # Rate limiting and CORS
│   ├── package.json
│   └── next.config.js
├── frontend/               # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── UENValidationPage.jsx
│   │   │   ├── WeatherPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/       # API service layer
│   │   │   └── api.js
│   │   ├── App.jsx         # Main App component
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
├── docs/                   # Documentation
│   ├── REQUIREMENTS.md     # Detailed requirements
│   ├── DESIGN.md          # System design and architecture
│   └── TESTING.md         # Testing documentation
└── README.md              # This file
```

## 🔌 API Endpoints

### UEN Validation

#### Validate UEN
```http
GET /api/uen/validate?uen={uen}
```

**Example:**
```bash
curl "http://localhost:3001/api/uen/validate?uen=12345678A"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uen": "12345678A",
    "isValid": true,
    "format": "A",
    "formatDescription": "Businesses registered with ACRA",
    "entityType": null,
    "details": {
      "length": 9,
      "pattern": "nnnnnnnX"
    }
  }
}
```

#### Get UEN Formats
```http
GET /api/uen/formats
```

### Weather Forecast

#### Get Weather Forecast
```http
GET /api/weather/forecast?location={location}
```

**Examples:**
```bash
# All Singapore
curl "http://localhost:3001/api/weather/forecast"

# Specific location
curl "http://localhost:3001/api/weather/forecast?location=Ang%20Mo%20Kio"
```

#### Get Available Locations
```http
GET /api/weather/locations
```

### System Health

#### Health Check
```http
GET /api/health
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

### Frontend Tests

```bash
cd frontend
npm test                 # Run all tests
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run tests with coverage report
```

### Manual Testing

1. **UEN Validation:**
   - Test Format A: `12345678A`
   - Test Format B: `200912345A`
   - Test Format C: `T09LL0001B`
   - Test invalid formats: `invalid`, `123`, `ABCDEFGHI`

2. **Weather Forecast:**
   - Test all Singapore forecast
   - Test specific locations (Ang Mo Kio, Bedok, etc.)
   - Test invalid locations
   - Test refresh functionality

## 🚢 Production Deployment

### Build for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview  # Preview production build locally
```

### Environment Variables (Production)

**Backend (.env.local):**
```env
NODE_ENV=production
API_PORT=3001
WEATHER_API_TIMEOUT=10000
WEATHER_CACHE_DURATION=300000
CORS_ORIGIN=https://your-frontend-domain.com
```

### Deployment Options

1. **Vercel (Recommended for Next.js)**
   - Deploy backend to Vercel
   - Configure environment variables
   - Set up custom domains

2. **Netlify (For Frontend)**
   - Build and deploy frontend static files
   - Configure redirects for SPA routing

3. **Docker**
   - Create Dockerfiles for both services
   - Use docker-compose for local development
   - Deploy to container platforms

4. **Traditional Hosting**
   - Use PM2 for process management
   - Set up reverse proxy with Nginx
   - Configure SSL certificates

## 🔧 Configuration

### Backend Configuration

The backend can be configured through environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `API_PORT` | `3001` | Backend server port |
| `WEATHER_API_TIMEOUT` | `10000` | Weather API timeout (ms) |
| `WEATHER_CACHE_DURATION` | `300000` | Cache duration (ms) |
| `CORS_ORIGIN` | `*` | CORS allowed origin |

### Frontend Configuration

The frontend is configured through `vite.config.js`:

- **Proxy:** API requests are proxied to backend during development
- **Build:** Optimized production builds with source maps
- **Testing:** Vitest configuration for unit tests

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process using port 3000 or 3001
   npx kill-port 3000
   npx kill-port 3001
   ```

2. **API Connection Issues**
   - Ensure backend is running on port 3001
   - Check firewall settings
   - Verify proxy configuration in `vite.config.js`

3. **Weather API Failures**
   - Weather APIs may be temporarily unavailable
   - Check network connectivity
   - Review error messages in browser console

4. **Build Issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Debug Mode

Enable detailed logging:

**Backend:**
```bash
NODE_ENV=development npm run dev
```

**Frontend:**
```bash
npm run dev
```

Check browser developer tools for detailed error messages and network requests.

## 📚 Additional Documentation

- **[Requirements Specification](REQUIREMENTS.md)** - Detailed functional and non-functional requirements
- **[System Design](DESIGN.md)** - Architecture, component design, and technical specifications
- **[Testing Documentation](TESTING.md)** - Testing strategy, test cases, and coverage requirements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the additional documentation
3. Check existing GitHub issues
4. Create a new issue with detailed information

## 🎯 Future Enhancements

- [ ] User authentication and personalization
- [ ] Additional Singapore government services
- [ ] Mobile app development
- [ ] Advanced weather visualization
- [ ] API rate limiting dashboard
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Progressive Web App (PWA) features

---

**Built with ❤️ for Singapore** 🇸🇬