# OneST Web Portal - Requirements Specification

## 1. Project Overview

**Project Name:** OneST Web Portal  
**Version:** 1.0  
**Date:** September 12, 2025  

### 1.1 Purpose
OneST is a web portal that provides multiple public services to users in Singapore. This document outlines the requirements for implementing two core services: UEN validation and weather forecasting.

### 1.2 Scope
The system will provide:
- A modern web-based user interface
- UEN (Unique Entity Number) validation service
- Singapore weather forecast service
- RESTful API endpoints
- Responsive design for desktop and mobile devices

## 2. Functional Requirements

### 2.1 Service 1: UEN Validation Service

#### 2.1.1 Overview
Users can input a UEN string and verify if it complies with the correct format according to Singapore's entity registration standards.

#### 2.1.2 UEN Format Rules

**Format A: Businesses registered with ACRA**
- Format: `nnnnnnnX` (9 digits)
- Where 'n' = number, 'X' = alphabetical letter
- Example: `12345678A`

**Format B: Local companies registered with ACRA**
- Format: `yyyynnnnnX` (10 digits)
- Where 'yyyy' = year of issuance, 'nnnnn' = sequential number, 'X' = check alphabet
- Example: `200912345A`

**Format C: All other entities with new UEN**
- Format: `TyyPQnnnnnX` (10 digits)
- Where:
  - 'T' = Entity type indicator (single letter)
  - 'yy' = Year of issuance (2 digits)
  - 'P' = Alphabetical letter
  - 'Q' = Alpha-numeric digit
  - 'nnnnn' = Sequential number (5 digits)
  - 'X' = Check alphabet
- Example: `T09LL0001B`

#### 2.1.3 Entity Type Mapping
The system should recognize and validate entity types based on the issuing agencies:
- ACRA: LP, LL, LC, PF
- ESG: RF
- IRAS: MQ, MM
- MCI: NB
- MCCY: CC, CS, MB
- Mindef: FM
- MOE: GS
- MFA: DP, CP, NR
- MOH: CM, MC, MD, HS, VH, CH, MH, CL, XL, CA, HC
- MOM: TU
- MND: TC
- MAS: FB, FN
- PA: PA, PB
- ROS: SS
- SLA: MC, SM
- SNDGO: GA, GB

#### 2.1.4 Functional Requirements
- **FR1.1:** System shall accept UEN input via web form
- **FR1.2:** System shall validate UEN format against all three format types
- **FR1.3:** System shall provide clear validation results (valid/invalid)
- **FR1.4:** System shall display appropriate error messages for invalid formats
- **FR1.5:** System shall identify which format type the UEN belongs to
- **FR1.6:** System shall not validate check alphabet (as specified in requirements)

### 2.2 Service 2: Weather Forecast Service

#### 2.2.1 Overview
Users can view the weather forecast for Singapore for the next 2 hours, with the ability to choose/enter a valid Singapore location.

#### 2.2.2 Data Sources
- Primary API: `https://data.gov.sg/datasets/d_3f9e064e25005b0e42969944ccaf2e7a/view`
- Secondary API: `https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast`

#### 2.2.3 Functional Requirements
- **FR2.1:** System shall display current weather forecast for Singapore
- **FR2.2:** System shall provide 2-hour weather forecast
- **FR2.3:** System shall allow users to select/enter Singapore locations
- **FR2.4:** System shall display weather information in a user-friendly format
- **FR2.5:** System shall handle API failures gracefully
- **FR2.6:** System shall refresh weather data periodically

## 3. Non-Functional Requirements

### 3.1 Performance Requirements
- **NFR1:** API response time shall be less than 2 seconds
- **NFR2:** Web pages shall load within 3 seconds
- **NFR3:** System shall support concurrent users (minimum 100)

### 3.2 Usability Requirements
- **NFR4:** Interface shall be intuitive and require minimal training
- **NFR5:** System shall be responsive across desktop, tablet, and mobile devices
- **NFR6:** System shall provide clear feedback for user actions

### 3.3 Reliability Requirements
- **NFR7:** System uptime shall be 99.9%
- **NFR8:** System shall handle API failures without crashing
- **NFR9:** Data validation shall be accurate and consistent

### 3.4 Security Requirements
- **NFR10:** Input validation shall prevent injection attacks
- **NFR11:** API endpoints shall implement rate limiting
- **NFR12:** No sensitive data shall be logged or stored

## 4. Technical Requirements

### 4.1 Technology Stack
- **Frontend:** React 18+ with Vite
- **Backend:** Next.js 13+ with App Router
- **Language:** JavaScript/TypeScript
- **Styling:** Modern CSS framework (Tailwind CSS recommended)
- **HTTP Client:** Axios or Fetch API

### 4.2 Architecture Requirements
- **AR1:** RESTful API design
- **AR2:** Separation of concerns (frontend/backend)
- **AR3:** Component-based frontend architecture
- **AR4:** Error handling and logging
- **AR5:** Environment-based configuration

### 4.3 API Requirements
- **API1:** GET `/api/uen/validate?uen={uen}` - UEN validation endpoint
- **API2:** GET `/api/weather/forecast?location={location}` - Weather forecast endpoint
- **API3:** GET `/api/weather/locations` - Available Singapore locations

## 5. User Interface Requirements

### 5.1 General UI Requirements
- Modern, clean design following Material Design or similar principles
- Responsive layout for all screen sizes
- Accessible design (WCAG 2.1 compliance)
- Loading states and progress indicators
- Error handling with user-friendly messages

### 5.2 UEN Validation Interface
- Input field for UEN entry
- Validation button or real-time validation
- Clear display of validation results
- Format examples and help text
- Error messages with format guidance

### 5.3 Weather Forecast Interface
- Location selector/input
- Current weather display
- 2-hour forecast information
- Visual weather indicators
- Last updated timestamp

## 6. Testing Requirements

### 6.1 Unit Testing
- All utility functions shall have unit tests
- Minimum 80% code coverage
- Test edge cases and error conditions

### 6.2 Integration Testing
- API endpoint testing
- Frontend-backend integration
- External API integration testing

### 6.3 User Acceptance Testing
- Test all user workflows
- Cross-browser compatibility testing
- Responsive design testing
- Performance testing

## 7. Deployment Requirements

### 7.1 Development Environment
- Local development setup with hot reloading
- Environment variable configuration
- Development database/mock services

### 7.2 Production Environment
- Production-ready build optimization
- Environment-specific configurations
- Error monitoring and logging
- Performance monitoring

## 8. Documentation Requirements

- **DOC1:** README with setup instructions
- **DOC2:** API documentation
- **DOC3:** User guide
- **DOC4:** Technical architecture documentation
- **DOC5:** Testing documentation

## 9. Assumptions and Constraints

### 9.1 Assumptions
- Users have modern web browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Internet connectivity is available for weather API calls
- Singapore government APIs are stable and available

### 9.2 Constraints
- No Python usage as specified
- Must use React+Vite for frontend and Next.js for backend
- Weather data limited to Singapore locations
- UEN validation based on format only (no registry lookup)

## 10. Success Criteria

- **SC1:** Both services are fully functional and tested
- **SC2:** Modern, responsive UI that works across devices
- **SC3:** Production-ready code with proper error handling
- **SC4:** Complete documentation and setup instructions
- **SC5:** Unit tests with good coverage
- **SC6:** Performance meets specified requirements