# WaslMed - Patient Healthcare Management System

WaslMed is a modern web application for healthcare management, providing patients with a secure platform to manage their medical records and share them with healthcare providers.

## Features

- **User Authentication**: Secure login and registration using Next-Auth
- **Patient Dashboard**: Centralized view of health information
- **Comprehensive Medical Records**: Store and manage detailed medical information including:
  - Personal information and profile photo
  - Medical history (conditions, surgeries, immunizations)
  - Lifestyle information
  - Family medical history
  - Medications and allergies
- **QR Code Generation**: Create QR codes that link to your medical profile for quick access by healthcare providers

## Technology Stack

- **Frontend**: React with Next.js 15
- **Styling**: TailwindCSS 4
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **State Management**: React Hooks
- **Icons**: Heroicons

## Project Structure

```
waslmed/
├── src/                      # Source code
│   ├── app/                  # Next.js app directory
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication API
│   │   │   └── medical-record/# Medical record API
│   │   ├── dashboard/        # Dashboard pages
│   │   │   ├── medical-record/# Medical record form
│   │   │   │   └── components/# Form components
│   │   │   └── qr-code/      # QR code generation
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   └── page.tsx          # Home page
│   ├── components/           # Reusable components
│   │   ├── Header.tsx        # Navigation header
│   │   └── ProtectedRoute.tsx# Authentication wrapper
│   ├── lib/                  # Utility functions
│   │   └── mongodb.ts        # Database connection
│   ├── models/               # Mongoose models
│   │   ├── User.ts           # User model
│   │   └── MedicalRecord.ts  # Medical record model
│   └── types/                # TypeScript type definitions
└── public/                   # Static assets
```

## Database Design

The application uses MongoDB with Mongoose for data modeling. There are two main collections:

### Users Collection

Stores user authentication and profile data:

```typescript
{
  name: String,               // User's full name
  email: String,              // Email address (unique)
  password: String,           // Hashed password
  createdAt: Date             // Account creation timestamp
}
```

### Medical Records Collection

Stores comprehensive medical information for each user:

```typescript
{
  user: ObjectId,             // Reference to user
  profileImage: String,       // Base64 encoded profile photo
  
  personalInfo: {             // Basic personal information
    dateOfBirth: Date,
    gender: String,
    bloodType: String,
    height: Number,           // in cm
    weight: Number,           // in kg
    maritalStatus: String,
    occupation: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    }
  },
  
  allergies: [{               // List of allergies
    allergen: String,
    severity: String,
    reaction: String,
    diagnosedDate: Date,
  }],
  
  medications: [{             // Current medications
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: String,
    purpose: String,
  }],
  
  conditions: [{              // Medical conditions
    name: String,
    diagnosedDate: Date,
    status: String,           // ongoing, resolved, etc.
    treatedBy: String,
    notes: String,
  }],
  
  surgeries: [{               // Surgical history
    procedure: String,
    date: Date,
    hospital: String,
    surgeon: String,
    outcome: String,
    notes: String,
  }],
  
  immunizations: [{           // Vaccination records
    vaccine: String,
    date: Date,
    administeredBy: String,
    batchNumber: String,
  }],
  
  familyHistory: [{           // Family medical history
    condition: String,
    relationship: String,     // e.g., mother, father, sibling
    notes: String,
  }],
  
  lifestyle: {                // Lifestyle information
    smokingStatus: String,
    alcoholConsumption: String,
    exerciseFrequency: String,
    diet: String,
    sleepPattern: String,
  },
  
  labTests: [{                // Laboratory test results
    testName: String,
    date: Date,
    result: String,
    normalRange: String,
    orderedBy: String,
    laboratory: String,
    notes: String,
  }],
  
  imaging: [{                 // Medical imaging results
    type: String,             // X-ray, MRI, CT, etc.
    date: Date,
    bodyPart: String,
    findings: String,
    facility: String,
    orderedBy: String,
  }],
  
  visits: [{                  // Healthcare provider visits
    date: Date,
    provider: String,
    reason: String,
    diagnosis: String,
    treatment: String,
    followUp: String,
  }],
  
  lastUpdated: Date           // Last modification timestamp
}
```

## Data Flow

1. **Authentication**:
   - User credentials are verified against the Users collection
   - Upon successful login, a session is created using NextAuth
   - Protected routes check for valid session before allowing access

2. **Medical Record Management**:
   - User medical data is fetched from the MedicalRecord collection
   - Forms are populated with existing data if available
   - Updates are sent to the API and stored in the database
   - All data is associated with the user's ID for security

3. **QR Code Generation**:
   - Creates a link to the user's profile using their unique identifier
   - Generated QR code can be saved or shared with healthcare providers

## API Endpoints

### Authentication
- `/api/auth/[...nextauth]`: NextAuth endpoints for login, logout, and session management

### Medical Records
- `GET /api/medical-record`: Retrieves the logged-in user's medical record
- `POST /api/medical-record`: Creates or updates the user's medical record

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or Atlas)

### Environment Setup

Create a `.env.local` file with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/waslmed.git
cd waslmed
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Next Steps

This project serves as a foundation for a comprehensive healthcare management system. Future enhancements could include:

1. **Patient-Doctor Communication**: Secure messaging and appointment scheduling
2. **Prescription Management**: Digital prescriptions and refill tracking
3. **Health Tracking**: Integration with wearable devices for continuous monitoring
4. **Telemedicine**: Video consultation capabilities
5. **Multi-language Support**: Localization for diverse patient populations
6. **Advanced Analytics**: Health trends and personalized insights
7. **Mobile App**: Native applications for iOS and Android

## Security Considerations

The application implements several security measures:
- Passwords are hashed using bcrypt
- Protected routes prevent unauthorized access
- Database interactions are secured through Mongoose
- Session management with NextAuth.js

For production deployment, consider adding:
- HTTPS enforcement
- Rate limiting
- Advanced security headers
- Two-factor authentication
