# Appointments Feature

The Appointments feature in WaslMed allows doctors and patients to manage healthcare appointments.

## Features

- **For Doctors**:
  - Schedule new appointments with connected patients
  - View upcoming, past, and current appointments
  - Mark appointments as completed or no-show
  - Cancel scheduled appointments
  - View appointments in calendar or list format

- **For Patients**:
  - View all scheduled appointments
  - Cancel appointments
  - Filter appointments by date and status
  - View appointment details including date, time, and notes
  - See appointments in calendar or list format

## Components

1. **AppointmentList**: Displays appointments in a list format with filtering options
2. **AppointmentCalendar**: Shows appointments in a calendar view
3. **AppointmentForm**: Form for creating and editing appointments (doctor only)

## API Endpoints

- `GET /api/appointments`: Fetch all appointments for the authenticated user
- `POST /api/appointments`: Create a new appointment (doctor only)
- `GET /api/appointments/:id`: Fetch a specific appointment by ID
- `PUT /api/appointments/:id`: Update an appointment
- `DELETE /api/appointments/:id`: Delete an appointment (doctor only)

## Database Schema

The appointments are stored in MongoDB using the following schema:

```typescript
interface IAppointment {
  patientId: string | ObjectId;
  patientName: string;
  doctorId: string | ObjectId;
  doctorName: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'check-up' | 'follow-up' | 'consultation' | 'procedure' | 'emergency';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Future Enhancements

- Email notifications for appointment reminders
- SMS reminders
- Appointment availability check
- Recurring appointments
- Video call integration for virtual appointments
- Support for group sessions/appointments 