# OneST Web Portal - Testing Documentation

## 1. Testing Strategy Overview

### 1.1 Testing Pyramid

```
                    /\
                   /  \
                  /E2E \     <- End-to-End Tests (Few)
                 /______\
                /        \
               /Integration\ <- Integration Tests (Some)
              /____________\
             /              \
            /   Unit Tests   \ <- Unit Tests (Many)
           /________________\
```

### 1.2 Testing Objectives

- **Functionality:** Ensure all features work as specified
- **Reliability:** Verify error handling and edge cases
- **Performance:** Validate response times and load handling
- **Usability:** Confirm user experience meets requirements
- **Security:** Test input validation and security measures
- **Compatibility:** Ensure cross-browser and device compatibility

## 2. Test Categories

### 2.1 Unit Tests
- **Scope:** Individual functions, components, and modules
- **Tools:** Jest, React Testing Library, Vitest
- **Coverage Target:** 80% minimum
- **Execution:** Automated on every commit

### 2.2 Integration Tests
- **Scope:** API endpoints, component interactions, external API integration
- **Tools:** Jest, Supertest, MSW (Mock Service Worker)
- **Coverage:** All API endpoints and critical user flows
- **Execution:** Automated in CI/CD pipeline

### 2.3 End-to-End Tests
- **Scope:** Complete user workflows
- **Tools:** Playwright or Cypress
- **Coverage:** Critical user journeys
- **Execution:** Automated on releases

### 2.4 Performance Tests
- **Scope:** API response times, frontend load times
- **Tools:** Lighthouse, WebPageTest, Artillery
- **Coverage:** Key performance metrics
- **Execution:** Automated on releases

## 3. Unit Testing

### 3.1 Frontend Unit Tests

#### 3.1.1 Component Tests

**UEN Form Component Tests:**
```javascript
// tests/components/uen/UENForm.test.jsx
describe('UENForm Component', () => {
  test('renders input field and submit button', () => {
    // Test component rendering
  });
  
  test('validates UEN input format', () => {
    // Test client-side validation
  });
  
  test('calls onValidate with correct UEN', () => {
    // Test callback function
  });
  
  test('shows loading state during validation', () => {
    // Test loading state
  });
  
  test('clears form when reset button clicked', () => {
    // Test form reset functionality
  });
});
```

**Weather Display Component Tests:**
```javascript
// tests/components/weather/WeatherDisplay.test.jsx
describe('WeatherDisplay Component', () => {
  test('renders weather data correctly', () => {
    // Test data display
  });
  
  test('shows loading state', () => {
    // Test loading state
  });
  
  test('displays error message on failure', () => {
    // Test error handling
  });
  
  test('formats timestamp correctly', () => {
    // Test date formatting
  });
});
```

#### 3.1.2 Utility Function Tests

**UEN Validation Utilities:**
```javascript
// tests/utils/uen-validator.test.js
describe('UEN Validator Utilities', () => {
  describe('validateUENFormat', () => {
    test('validates Format A UEN correctly', () => {
      expect(validateUENFormat('12345678A')).toEqual({
        isValid: true,
        format: 'A',
        length: 9
      });
    });
    
    test('validates Format B UEN correctly', () => {
      expect(validateUENFormat('200912345A')).toEqual({
        isValid: true,
        format: 'B',
        length: 10
      });
    });
    
    test('validates Format C UEN correctly', () => {
      expect(validateUENFormat('T09LL0001B')).toEqual({
        isValid: true,
        format: 'C',
        length: 10
      });
    });
    
    test('rejects invalid UEN formats', () => {
      expect(validateUENFormat('invalid')).toEqual({
        isValid: false,
        format: null,
        error: 'Invalid UEN format'
      });
    });
    
    test('handles empty input', () => {
      expect(validateUENFormat('')).toEqual({
        isValid: false,
        format: null,
        error: 'UEN is required'
      });
    });
  });
  
  describe('getEntityType', () => {
    test('returns correct entity type for known codes', () => {
      expect(getEntityType('LP')).toBe('Limited Partnership');
      expect(getEntityType('RF')).toBe('Representative Office');
    });
    
    test('returns null for unknown codes', () => {
      expect(getEntityType('XX')).toBe(null);
    });
  });
});
```

**Weather Utilities:**
```javascript
// tests/utils/weather-utils.test.js
describe('Weather Utilities', () => {
  describe('formatWeatherData', () => {
    test('formats API response correctly', () => {
      const apiResponse = {
        // Mock API response
      };
      const formatted = formatWeatherData(apiResponse);
      expect(formatted).toHaveProperty('areas');
      expect(formatted).toHaveProperty('forecasts');
    });
  });
  
  describe('getLocationCoordinates', () => {
    test('returns coordinates for valid location', () => {
      const coords = getLocationCoordinates('Ang Mo Kio');
      expect(coords).toEqual({
        latitude: expect.any(Number),
        longitude: expect.any(Number)
      });
    });
  });
});
```

### 3.2 Backend Unit Tests

#### 3.2.1 API Route Tests

**UEN Validation API Tests:**
```javascript
// tests/api/uen/validate.test.js
describe('/api/uen/validate', () => {
  test('validates correct UEN Format A', async () => {
    const response = await request(app)
      .get('/api/uen/validate?uen=12345678A')
      .expect(200);
    
    expect(response.body).toEqual({
      success: true,
      data: {
        uen: '12345678A',
        isValid: true,
        format: 'A',
        formatDescription: 'Businesses registered with ACRA'
      }
    });
  });
  
  test('validates correct UEN Format B', async () => {
    const response = await request(app)
      .get('/api/uen/validate?uen=200912345A')
      .expect(200);
    
    expect(response.body.data.format).toBe('B');
  });
  
  test('validates correct UEN Format C', async () => {
    const response = await request(app)
      .get('/api/uen/validate?uen=T09LL0001B')
      .expect(200);
    
    expect(response.body.data.format).toBe('C');
  });
  
  test('rejects invalid UEN format', async () => {
    const response = await request(app)
      .get('/api/uen/validate?uen=invalid')
      .expect(200);
    
    expect(response.body.data.isValid).toBe(false);
  });
  
  test('returns error for missing UEN parameter', async () => {
    const response = await request(app)
      .get('/api/uen/validate')
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('MISSING_PARAMETER');
  });
});
```

**Weather API Tests:**
```javascript
// tests/api/weather/forecast.test.js
describe('/api/weather/forecast', () => {
  beforeEach(() => {
    // Mock external API calls
    jest.mock('../../lib/weather-client');
  });
  
  test('returns weather forecast for default location', async () => {
    const mockWeatherData = {
      // Mock weather response
    };
    weatherClient.getForecast.mockResolvedValue(mockWeatherData);
    
    const response = await request(app)
      .get('/api/weather/forecast')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('items');
  });
  
  test('returns weather forecast for specific location', async () => {
    const response = await request(app)
      .get('/api/weather/forecast?location=Ang Mo Kio')
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });
  
  test('handles external API failure gracefully', async () => {
    weatherClient.getForecast.mockRejectedValue(new Error('API Error'));
    
    const response = await request(app)
      .get('/api/weather/forecast')
      .expect(500);
    
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('EXTERNAL_API_ERROR');
  });
});
```

#### 3.2.2 Business Logic Tests

**UEN Validator Tests:**
```javascript
// tests/lib/uen-validator.test.js
describe('UEN Validator', () => {
  describe('Format A Validation', () => {
    test('validates correct format', () => {
      expect(UENValidator.validateFormatA('12345678A')).toBe(true);
      expect(UENValidator.validateFormatA('98765432Z')).toBe(true);
    });
    
    test('rejects incorrect format', () => {
      expect(UENValidator.validateFormatA('1234567A')).toBe(false); // Too short
      expect(UENValidator.validateFormatA('123456789')).toBe(false); // No letter
      expect(UENValidator.validateFormatA('12345678AA')).toBe(false); // Too long
    });
  });
  
  describe('Format B Validation', () => {
    test('validates correct format', () => {
      expect(UENValidator.validateFormatB('200912345A')).toBe(true);
      expect(UENValidator.validateFormatB('202199999Z')).toBe(true);
    });
    
    test('rejects incorrect year format', () => {
      expect(UENValidator.validateFormatB('99912345A')).toBe(false);
      expect(UENValidator.validateFormatB('300012345A')).toBe(false);
    });
  });
  
  describe('Format C Validation', () => {
    test('validates correct format', () => {
      expect(UENValidator.validateFormatC('T09LL0001B')).toBe(true);
      expect(UENValidator.validateFormatC('S21AB1234C')).toBe(true);
    });
    
    test('validates entity type indicators', () => {
      expect(UENValidator.validateFormatC('X09LL0001B')).toBe(false); // Invalid entity type
    });
  });
});
```

## 4. Integration Testing

### 4.1 API Integration Tests

**Full API Workflow Tests:**
```javascript
// tests/integration/api.test.js
describe('API Integration Tests', () => {
  describe('UEN Validation Workflow', () => {
    test('complete UEN validation flow', async () => {
      // Test the complete flow from request to response
      const testCases = [
        { uen: '12345678A', expectedFormat: 'A' },
        { uen: '200912345A', expectedFormat: 'B' },
        { uen: 'T09LL0001B', expectedFormat: 'C' },
        { uen: 'invalid', expectedValid: false }
      ];
      
      for (const testCase of testCases) {
        const response = await request(app)
          .get(`/api/uen/validate?uen=${testCase.uen}`);
        
        if (testCase.expectedValid !== false) {
          expect(response.body.data.format).toBe(testCase.expectedFormat);
        } else {
          expect(response.body.data.isValid).toBe(false);
        }
      }
    });
  });
  
  describe('Weather API Integration', () => {
    test('weather forecast with external API', async () => {
      // Test actual external API integration (with mocking in CI)
      const response = await request(app)
        .get('/api/weather/forecast');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
    });
  });
});
```

### 4.2 Frontend-Backend Integration Tests

**Component-API Integration:**
```javascript
// tests/integration/components.test.jsx
describe('Component-API Integration', () => {
  beforeEach(() => {
    // Setup MSW (Mock Service Worker) for API mocking
    server.listen();
  });
  
  afterEach(() => {
    server.resetHandlers();
  });
  
  afterAll(() => {
    server.close();
  });
  
  test('UEN form submits and displays results', async () => {
    render(<UENValidationPage />);
    
    const input = screen.getByLabelText(/uen/i);
    const button = screen.getByRole('button', { name: /validate/i });
    
    fireEvent.change(input, { target: { value: '12345678A' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/valid/i)).toBeInTheDocument();
      expect(screen.getByText(/format a/i)).toBeInTheDocument();
    });
  });
  
  test('Weather component loads and displays forecast', async () => {
    render(<WeatherPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/weather forecast/i)).toBeInTheDocument();
      expect(screen.getByText(/partly cloudy/i)).toBeInTheDocument();
    });
  });
});
```

## 5. End-to-End Testing

### 5.1 User Journey Tests

**UEN Validation Journey:**
```javascript
// tests/e2e/uen-validation.spec.js
test('User can validate UEN successfully', async ({ page }) => {
  await page.goto('/uen-validation');
  
  // Test valid UEN
  await page.fill('[data-testid="uen-input"]', '12345678A');
  await page.click('[data-testid="validate-button"]');
  
  await expect(page.locator('[data-testid="validation-result"]')).toContainText('Valid');
  await expect(page.locator('[data-testid="format-type"]')).toContainText('Format A');
  
  // Test invalid UEN
  await page.fill('[data-testid="uen-input"]', 'invalid');
  await page.click('[data-testid="validate-button"]');
  
  await expect(page.locator('[data-testid="validation-result"]')).toContainText('Invalid');
});
```

**Weather Forecast Journey:**
```javascript
// tests/e2e/weather-forecast.spec.js
test('User can view weather forecast', async ({ page }) => {
  await page.goto('/weather');
  
  // Check default weather display
  await expect(page.locator('[data-testid="weather-display"]')).toBeVisible();
  
  // Select different location
  await page.selectOption('[data-testid="location-selector"]', 'Ang Mo Kio');
  
  await expect(page.locator('[data-testid="forecast-area"]')).toContainText('Ang Mo Kio');
});
```

### 5.2 Cross-Browser Testing

**Browser Compatibility Matrix:**
- Chrome (latest, previous)
- Firefox (latest, previous)
- Safari (latest, previous)
- Edge (latest, previous)

**Mobile Testing:**
- iOS Safari
- Android Chrome
- Responsive design testing

## 6. Performance Testing

### 6.1 Frontend Performance Tests

**Lighthouse Audits:**
```javascript
// tests/performance/lighthouse.test.js
describe('Lighthouse Performance Audits', () => {
  test('Home page performance', async () => {
    const result = await lighthouse('http://localhost:3000', {
      port: 9222,
      onlyCategories: ['performance'],
    });
    
    expect(result.score).toBeGreaterThan(90);
  });
  
  test('UEN validation page performance', async () => {
    const result = await lighthouse('http://localhost:3000/uen-validation');
    expect(result.score).toBeGreaterThan(90);
  });
});
```

### 6.2 API Performance Tests

**Load Testing:**
```javascript
// tests/performance/api-load.test.js
describe('API Load Tests', () => {
  test('UEN validation API under load', async () => {
    const results = await loadTest({
      url: 'http://localhost:3001/api/uen/validate?uen=12345678A',
      connections: 100,
      duration: '30s'
    });
    
    expect(results.averageResponseTime).toBeLessThan(200);
    expect(results.errorRate).toBeLessThan(0.01);
  });
  
  test('Weather API under load', async () => {
    const results = await loadTest({
      url: 'http://localhost:3001/api/weather/forecast',
      connections: 50,
      duration: '30s'
    });
    
    expect(results.averageResponseTime).toBeLessThan(500);
  });
});
```

## 7. Security Testing

### 7.1 Input Validation Tests

**XSS Prevention Tests:**
```javascript
describe('XSS Prevention', () => {
  test('UEN input sanitization', async () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const response = await request(app)
      .get(`/api/uen/validate?uen=${encodeURIComponent(maliciousInput)}`);
    
    expect(response.body.data.uen).not.toContain('<script>');
  });
});
```

**SQL Injection Tests:**
```javascript
describe('SQL Injection Prevention', () => {
  test('handles SQL injection attempts', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const response = await request(app)
      .get(`/api/uen/validate?uen=${encodeURIComponent(maliciousInput)}`);
    
    expect(response.status).toBe(400);
  });
});
```

### 7.2 Rate Limiting Tests

```javascript
describe('Rate Limiting', () => {
  test('enforces rate limits', async () => {
    const requests = Array(101).fill().map(() => 
      request(app).get('/api/uen/validate?uen=12345678A')
    );
    
    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});
```

## 8. Test Data Management

### 8.1 Test Data Sets

**UEN Test Cases:**
```javascript
export const UEN_TEST_CASES = {
  valid: {
    formatA: ['12345678A', '98765432Z', '11111111B'],
    formatB: ['200912345A', '202199999Z', '199812345C'],
    formatC: ['T09LL0001B', 'S21AB1234C', 'R20CD5678D']
  },
  invalid: {
    tooShort: ['1234567A', '20091234A'],
    tooLong: ['123456789A', '20091234567A'],
    wrongPattern: ['12345678', 'ABCDEFGHI', '200ABCDEFG'],
    invalidChars: ['1234567!A', '2009@2345A']
  }
};
```

**Weather Test Data:**
```javascript
export const WEATHER_TEST_DATA = {
  mockResponse: {
    area_metadata: [
      {
        name: 'Ang Mo Kio',
        label_location: { latitude: 1.375, longitude: 103.839 }
      }
    ],
    items: [{
      update_timestamp: '2025-09-12T14:00:00+08:00',
      forecasts: [{ area: 'Ang Mo Kio', forecast: 'Partly Cloudy' }]
    }]
  }
};
```

### 8.2 Mock Services

**MSW Handlers:**
```javascript
// tests/mocks/handlers.js
export const handlers = [
  rest.get('/api/uen/validate', (req, res, ctx) => {
    const uen = req.url.searchParams.get('uen');
    return res(ctx.json({
      success: true,
      data: { uen, isValid: true, format: 'A' }
    }));
  }),
  
  rest.get('/api/weather/forecast', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      data: WEATHER_TEST_DATA.mockResponse
    }));
  })
];
```

## 9. Test Execution Strategy

### 9.1 Local Development

**Pre-commit Hooks:**
```bash
# .husky/pre-commit
#!/bin/sh
npm run test:unit
npm run lint
npm run type-check
```

**Development Workflow:**
1. Unit tests run on file changes (watch mode)
2. Integration tests run on demand
3. E2E tests run before commits

### 9.2 CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:unit:coverage
      
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Run integration tests
        run: npm run test:integration
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Run E2E tests
        run: npm run test:e2e
```

## 10. Test Reporting and Metrics

### 10.1 Coverage Reports

**Coverage Thresholds:**
```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### 10.2 Test Metrics

**Key Metrics to Track:**
- Code coverage percentage
- Test execution time
- Test failure rate
- Performance benchmark results
- Security vulnerability scan results

**Reporting Tools:**
- Jest coverage reports
- Lighthouse CI reports
- Playwright test reports
- SonarQube quality gates

## 11. Test Maintenance

### 11.1 Test Review Process

**Code Review Checklist:**
- [ ] Tests cover new functionality
- [ ] Tests are readable and maintainable
- [ ] Mock data is realistic
- [ ] Error cases are tested
- [ ] Performance implications considered

### 11.2 Test Refactoring

**Regular Maintenance Tasks:**
- Remove obsolete tests
- Update test data
- Refactor duplicated test code
- Update mock services
- Review and update test documentation

This comprehensive testing strategy ensures high-quality, reliable software that meets all functional and non-functional requirements.