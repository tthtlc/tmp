# OneST Web Portal - System Design & Architecture

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│   React + Vite  │◄──►│   Next.js API    │◄──►│  External APIs  │
│    Frontend     │    │     Backend      │    │  (Weather Data) │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 1.2 Technology Stack

**Frontend (React + Vite)**
- React 18+ with functional components and hooks
- Vite for fast development and optimized builds
- Tailwind CSS for styling
- Axios for HTTP requests
- React Router for navigation

**Backend (Next.js)**
- Next.js 13+ with App Router
- API Routes for RESTful endpoints
- Server-side validation and error handling
- Environment-based configuration

**External Dependencies**
- Singapore Weather APIs
- No database required (stateless services)

## 2. System Architecture

### 2.1 Frontend Architecture

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (Header, Footer, Loading)
│   ├── uen/             # UEN validation components
│   └── weather/         # Weather forecast components
├── pages/               # Application pages
├── services/            # API service layer
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
├── styles/              # Global styles and Tailwind config
└── types/               # TypeScript type definitions
```

**Component Hierarchy:**
```
App
├── Layout
│   ├── Header
│   ├── Navigation
│   └── Footer
├── HomePage
├── UENValidationPage
│   ├── UENForm
│   ├── ValidationResult
│   └── FormatGuide
└── WeatherPage
    ├── LocationSelector
    ├── WeatherDisplay
    └── ForecastChart
```

### 2.2 Backend Architecture

```
backend/
├── pages/api/           # Next.js API routes
│   ├── uen/
│   │   └── validate.js  # UEN validation endpoint
│   └── weather/
│       ├── forecast.js  # Weather forecast endpoint
│       └── locations.js # Available locations endpoint
├── lib/                 # Business logic and utilities
│   ├── uen-validator.js # UEN validation logic
│   ├── weather-client.js# Weather API client
│   └── error-handler.js # Error handling utilities
└── middleware/          # API middleware
    ├── rate-limiter.js  # Rate limiting
    └── validator.js     # Input validation
```

## 3. API Design

### 3.1 UEN Validation API

**Endpoint:** `GET /api/uen/validate`

**Parameters:**
- `uen` (string, required): The UEN to validate

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

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "UEN parameter is required"
  }
}
```

### 3.2 Weather Forecast API

**Endpoint:** `GET /api/weather/forecast`

**Parameters:**
- `location` (string, optional): Singapore location name

**Response:**
```json
{
  "success": true,
  "data": {
    "area_metadata": [
      {
        "name": "Ang Mo Kio",
        "label_location": {
          "latitude": 1.375,
          "longitude": 103.839
        }
      }
    ],
    "items": [
      {
        "update_timestamp": "2025-09-12T14:00:00+08:00",
        "timestamp": "2025-09-12T14:00:00+08:00",
        "valid_period": {
          "start": "2025-09-12T14:00:00+08:00",
          "end": "2025-09-12T16:00:00+08:00"
        },
        "forecasts": [
          {
            "area": "Ang Mo Kio",
            "forecast": "Partly Cloudy"
          }
        ]
      }
    ]
  }
}
```

**Endpoint:** `GET /api/weather/locations`

**Response:**
```json
{
  "success": true,
  "data": [
    "Ang Mo Kio",
    "Bedok",
    "Bishan",
    "Boon Lay",
    "Bukit Batok"
  ]
}
```

## 4. Data Models

### 4.1 UEN Validation Models

```javascript
// UEN Validation Request
interface UENValidationRequest {
  uen: string;
}

// UEN Validation Response
interface UENValidationResponse {
  uen: string;
  isValid: boolean;
  format: 'A' | 'B' | 'C';
  formatDescription: string;
  entityType?: string;
  details: {
    length: number;
    pattern: string;
  };
}

// UEN Format Configuration
interface UENFormat {
  type: 'A' | 'B' | 'C';
  pattern: RegExp;
  description: string;
  length: number;
  example: string;
}
```

### 4.2 Weather Models

```javascript
// Weather Forecast Response
interface WeatherForecastResponse {
  area_metadata: AreaMetadata[];
  items: WeatherItem[];
}

interface AreaMetadata {
  name: string;
  label_location: {
    latitude: number;
    longitude: number;
  };
}

interface WeatherItem {
  update_timestamp: string;
  timestamp: string;
  valid_period: {
    start: string;
    end: string;
  };
  forecasts: Forecast[];
}

interface Forecast {
  area: string;
  forecast: string;
}
```

## 5. Component Design

### 5.1 UEN Validation Components

**UENForm Component:**
```javascript
interface UENFormProps {
  onValidate: (uen: string) => void;
  loading: boolean;
}

// Features:
// - Input field with validation
// - Real-time format checking
// - Submit button with loading state
// - Clear/reset functionality
```

**ValidationResult Component:**
```javascript
interface ValidationResultProps {
  result: UENValidationResponse | null;
  error: string | null;
}

// Features:
// - Success/error state display
// - Format type information
// - Entity type details
// - Format pattern explanation
```

**FormatGuide Component:**
```javascript
// Features:
// - Expandable format reference
// - Examples for each format type
// - Entity type mapping table
// - Help text and tooltips
```

### 5.2 Weather Forecast Components

**LocationSelector Component:**
```javascript
interface LocationSelectorProps {
  locations: string[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

// Features:
// - Dropdown/autocomplete for locations
// - Search functionality
// - Current location detection
```

**WeatherDisplay Component:**
```javascript
interface WeatherDisplayProps {
  forecast: WeatherForecastResponse;
  loading: boolean;
  error: string | null;
}

// Features:
// - Current weather conditions
// - 2-hour forecast display
// - Weather icons/graphics
// - Last updated timestamp
```

## 6. State Management

### 6.1 Frontend State Management

**Using React Hooks:**
- `useState` for component-level state
- `useEffect` for side effects and API calls
- `useContext` for global state (if needed)
- Custom hooks for reusable logic

**State Structure:**
```javascript
// UEN Validation State
const [uenState, setUENState] = useState({
  input: '',
  result: null,
  loading: false,
  error: null
});

// Weather State
const [weatherState, setWeatherState] = useState({
  locations: [],
  selectedLocation: '',
  forecast: null,
  loading: false,
  error: null
});
```

### 6.2 API State Management

**Service Layer Pattern:**
```javascript
// services/api.js
class APIService {
  async validateUEN(uen) {
    // Handle API call, error handling, loading states
  }
  
  async getWeatherForecast(location) {
    // Handle API call, caching, error handling
  }
}
```

## 7. Error Handling Strategy

### 7.1 Frontend Error Handling

**Error Boundaries:**
- Catch and display component errors
- Fallback UI for crashed components
- Error reporting and logging

**API Error Handling:**
- Network error handling
- HTTP status code handling
- User-friendly error messages
- Retry mechanisms

### 7.2 Backend Error Handling

**Validation Errors:**
- Input validation with detailed messages
- Schema validation for API requests
- Sanitization of user inputs

**External API Errors:**
- Timeout handling
- Rate limit handling
- Fallback mechanisms
- Circuit breaker pattern

**Error Response Format:**
```javascript
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'User-friendly error message',
    details: 'Technical details for debugging'
  }
}
```

## 8. Performance Optimization

### 8.1 Frontend Optimization

**Code Splitting:**
- Route-based code splitting
- Component lazy loading
- Dynamic imports for heavy components

**Caching Strategy:**
- API response caching
- Static asset caching
- Service worker implementation

**Bundle Optimization:**
- Tree shaking with Vite
- Minification and compression
- Asset optimization

### 8.2 Backend Optimization

**API Performance:**
- Response compression
- Efficient data serialization
- Caching headers

**External API Management:**
- Request deduplication
- Response caching
- Rate limit compliance

## 9. Security Considerations

### 9.1 Input Validation

**Frontend Validation:**
- Client-side input sanitization
- XSS prevention
- CSRF protection

**Backend Validation:**
- Server-side validation (primary)
- SQL injection prevention
- Input length limits

### 9.2 API Security

**Rate Limiting:**
- Per-IP rate limiting
- API key validation (if required)
- DDoS protection

**Data Protection:**
- No sensitive data logging
- Secure headers
- CORS configuration

## 10. Testing Strategy

### 10.1 Unit Testing

**Frontend Tests:**
- Component testing with React Testing Library
- Hook testing
- Utility function testing

**Backend Tests:**
- API endpoint testing
- Business logic testing
- Error handling testing

### 10.2 Integration Testing

**API Integration:**
- End-to-end API testing
- External API mocking
- Error scenario testing

**Frontend Integration:**
- User workflow testing
- Cross-browser testing
- Responsive design testing

## 11. Deployment Architecture

### 11.1 Development Environment

```
Developer Machine
├── Frontend (Vite Dev Server) :3000
├── Backend (Next.js Dev) :3001
└── Mock APIs (if needed)
```

### 11.2 Production Environment

```
Production Server
├── Static Frontend Build (served by CDN)
├── Next.js API Server
├── Load Balancer
└── Monitoring & Logging
```

## 12. Monitoring and Logging

### 12.1 Application Monitoring

**Performance Metrics:**
- API response times
- Frontend load times
- Error rates
- User engagement metrics

**Health Checks:**
- API endpoint health
- External API availability
- System resource usage

### 12.2 Logging Strategy

**Application Logs:**
- API request/response logging
- Error logging with context
- User action tracking
- Performance logging

**Log Levels:**
- ERROR: Application errors
- WARN: Potential issues
- INFO: General information
- DEBUG: Detailed debugging info

## 13. Scalability Considerations

### 13.1 Horizontal Scaling

**Stateless Design:**
- No server-side sessions
- Stateless API endpoints
- Client-side state management

**Load Distribution:**
- Multiple server instances
- Load balancer configuration
- Database connection pooling (if added later)

### 13.2 Caching Strategy

**Multi-level Caching:**
- Browser caching
- CDN caching
- Server-side caching
- API response caching

This design provides a solid foundation for building a scalable, maintainable, and user-friendly web portal that meets all the specified requirements.