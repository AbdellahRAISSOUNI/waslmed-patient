# WaslMed Project Structure

This document outlines the organization of the WaslMed project, explaining the folder structure and the purpose of each component.

## Directory Structure

```
waslmed/
├── node_modules/ # Dependencies
├── public/ # Static assets
├── src/ # Source code
│   ├── app/ # Next.js 13 App Router
│   │   ├── api/ # API routes
│   │   │   ├── ai/ # AI-related endpoints
│   │   │   ├── auth/ # Authentication endpoints
│   │   │   ├── doctors/ # Doctor connection endpoints
│   │   │   ├── medical-record/ # Medical record endpoints
│   │   │   │   ├── access/ # Doctor access and edit endpoints
│   │   │   │   └── history/ # Access and edit history endpoints
│   │   │   └── user/ # User profile endpoints
│   │   ├── dashboard/ # Dashboard pages
│   │   │   ├── ai/ # AI assistant page
│   │   │   ├── doctors/ # Healthcare providers page
│   │   │   ├── downloads/ # Reports and downloads page
│   │   │   ├── health-education/ # Health education page
│   │   │   ├── medical-record/ # Medical record pages
│   │   │   └── qr-code/ # QR code generation page
│   │   ├── login/ # Login page
│   │   ├── register/ # Registration page
│   │   └── layout.tsx # Root layout
│   ├── components/ # Reusable components
│   │   ├── ai/ # AI-related components
│   │   ├── auth/ # Authentication components
│   │   ├── dashboard/ # Dashboard components
│   │   ├── doctors/ # Doctor-related components
│   │   ├── landing/ # Landing page components
│   │   ├── layout/ # Layout components
│   │   └── ui/ # UI utility components
│   ├── lib/ # Utility functions and libraries
│   │   ├── gemini.ts # Google Gemini AI API utilities
│   │   └── mongodb.ts # MongoDB connection utilities
│   ├── models/ # MongoDB models
│   │   ├── AIConversation.ts # AI conversation model
│   │   ├── Doctor.ts # Doctor model
│   │   ├── MedicalRecord.ts # Medical record model
│   │   └── User.ts # User model
│   └── types/ # TypeScript type definitions
├── .env.local # Environment variables
├── next.config.js # Next.js configuration
├── package.json # Project metadata and dependencies
├── WaslMed-Scanner-App-Database-Guide.md # Scanner app documentation
├── WaslMed-AI-Documentation.md # AI features documentation
└── PROJECT_STRUCTURE.md # This file
```

## Core Features

### User Authentication
- Login, registration, and password recovery
- JWT-based session management via Next-Auth
- Secure password hashing with bcrypt

### Medical Record Management
- Comprehensive patient medical information
- Support for allergies, medications, conditions, etc.
- Medical history tracking and updates

### AI Assistant
- Powered by Google's Gemini API
- Multiple specialized conversation types:
  - General health assistance
  - Symptom checking
  - Health recommendations
  - Risk assessment
  - Early warning detection
  - Document analysis
  - Health education

### Doctor Connections
- QR code scanning for medical record access
- Connection request system for doctor-patient relationships
- Access control for viewing and editing medical records
- Comprehensive access and edit history tracking
- Full transparency for patients about who accessed their data

### QR Code Generation
- Creates secure QR codes for sharing medical records
- Used by healthcare providers to access patient data
- QR codes contain URI with medical record ID

## Technology Stack

- **Frontend**: React, Next.js, TailwindCSS
- **Backend**: Next.js API routes
- **Database**: MongoDB
- **AI**: Google Gemini API
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

## Key Data Models

### User
- Basic user information (name, email)
- Authentication credentials

### Medical Record
- Comprehensive health data structure
- Connected to a specific user
- Includes doctor connections, access logs, and edit history

### Doctor
- Healthcare provider information
- Professional details and credentials
- Patient connections and access history

### AIConversation
- Records of AI interactions
- Various specialized conversation types
- Health education content and user engagement data

## Root Directory

```
/
├── public/               # Static files
├── src/                  # Source code
│   ├── app/              # Next.js App Router
│   ├── components/       # Reusable components
│   ├── lib/              # Utility functions
│   ├── models/           # Database models
│   └── types/            # TypeScript type definitions
├── .next/                # Next.js build output
├── node_modules/         # Dependencies
├── README.md             # Main documentation
├── PROJECT_STRUCTURE.md  # Project structure documentation
├── WaslMed-Scanner-App-Database-Guide.md # Scanner app documentation
├── WaslMed-AI-Documentation.md # AI features documentation
└── ...                   # Configuration files
```

## Source Code Structure

### App Directory (src/app)

The app directory follows Next.js App Router structure:

```
src/app/
├── api/                  # API routes
│   ├── auth/             # Authentication endpoints
│   ├── medical-record/   # Medical record endpoints
│   ├── ai/               # AI feature endpoints
│   │   ├── symptom-check/    # Symptom checker endpoints
│   │   ├── health-recommendations/ # Health recommendations endpoints
│   │   ├── risk-assessment/   # Risk assessment endpoints
│   │   ├── early-warning/     # Early warning endpoints
│   │   ├── document-analysis/ # Document analysis endpoints
│   │   └── health-education/  # Health education endpoints
│   └── user/             # User endpoints
├── context/              # React context providers
├── dashboard/            # Dashboard pages
│   ├── medical-record/   # Medical record management
│   ├── qr-code/          # QR code generation
│   ├── appointments/     # Appointment management
│   ├── ai/               # AI assistant pages
│   └── health-education/ # Health education pages
├── login/                # Login page
├── register/             # Registration page
├── globals.css           # Global styles
└── layout.tsx            # Root layout
```

### Components Directory (src/components)

Components are organized by feature or functionality:

```
src/components/
├── auth/                 # Authentication components
│   ├── AuthLayout.tsx    # Layout for auth pages (login/register)
│   └── ProtectedRoute.tsx # Route protection component
├── dashboard/            # Dashboard components
│   ├── DashboardLayout.tsx # Layout for dashboard pages
│   ├── DashboardHome.tsx   # Dashboard home page content
│   └── qr-code/          # QR code related components
│       └── QRCodeGenerator.tsx # QR code generation component
├── landing/              # Landing page components
│   └── HeroSection.tsx   # Hero section for landing page
├── layout/               # Layout components
│   ├── Header.tsx        # Application header
│   └── Footer.tsx        # Application footer
└── ai/                   # AI components
    ├── GeneralConversation.tsx # General AI chat component
    ├── SymptomChecker.tsx      # Symptom checker component
    ├── HealthRecommendations.tsx # Health recommendations component
    ├── RiskAssessment.tsx      # Risk assessment component
    ├── EarlyWarning.tsx        # Early warning component
    ├── DocumentAnalysis.tsx    # Document analysis component
    ├── HealthEducation.tsx     # Health education component
    └── ConversationHistory.tsx # AI conversation history sidebar
```

## Component Hierarchy

### Landing Page

```
Root Layout
└── Home Page (page.tsx)
    ├── Header
    ├── HeroSection
    └── Footer
```

### Authentication Pages

```
Root Layout
└── Auth Page (login/register)
    └── AuthLayout
        ├── Header
        ├── Form Components (specific to login/register)
        └── Footer
```

### Dashboard Pages

```
Root Layout
└── Dashboard Page (dashboard/page.tsx)
    └── DashboardLayout
        ├── Header
        ├── ProtectedRoute (authentication check)
        ├── Page-specific content
        └── Footer
```

### QR Code Page

```
Root Layout
└── QR Code Page (dashboard/qr-code/page.tsx)
    └── DashboardLayout
        ├── Header
        ├── ProtectedRoute
        ├── QRCodeGenerator
        └── Footer
```

### Medical Record Page

```
Root Layout
└── Medical Record Page (dashboard/medical-record/page.tsx)
    └── DashboardLayout
        ├── Header
        ├── ProtectedRoute
        ├── Medical Record Form Components
        └── Footer
```

### AI Assistant Page

```
Root Layout
└── AI Assistant Page (dashboard/ai/page.tsx)
    └── DashboardLayout
        ├── Header
        ├── ProtectedRoute
        ├── AI Feature Tabs
        │   ├── GeneralConversation
        │   ├── SymptomChecker
        │   ├── HealthRecommendations
        │   ├── RiskAssessment
        │   └── EarlyWarning
        └── Footer
```

### Health Education Page

```
Root Layout
└── Health Education Page (dashboard/health-education/page.tsx)
    └── DashboardLayout
        ├── Header
        ├── ProtectedRoute
        ├── Feature Cards
        │   ├── AI-generated Content
        │   ├── VR Simulations
        │   ├── Gamified Learning
        │   └── Wellness Plans
        ├── HealthEducation Component
        └── Footer
```

## Key Design Decisions

1. **Feature-Based Organization**: Components are organized by feature (auth, dashboard, landing) to make it clear what each component is for.

2. **Consistent Layouts**: Layout components are shared across pages to ensure a consistent user experience.

3. **Separation of Concerns**: UI components are separated from data fetching logic and business logic.

4. **Reusable Components**: Common UI elements are placed in shared directories for reuse across the application.

5. **Clean Page Files**: Page files are kept simple, primarily composing components rather than containing complex logic.

6. **Nested Component Structure**: Components are organized hierarchically, with layouts containing page-specific components.

7. **AI Feature Integration**: AI capabilities are integrated throughout the application with dedicated components and API routes.

## Adding New Features

When adding new features to the application:

1. Create a new directory in `src/app/` for the feature's pages
2. Add feature-specific components in `src/components/[feature-name]/`
3. Create API routes in `src/app/api/` if needed
4. Update models in `src/models/` for any new data structures
5. Update this documentation to reflect the changes

## Styling Approach

The application uses Tailwind CSS for styling. Component-specific styles are contained within each component file using Tailwind's utility classes. 