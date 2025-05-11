import mongoose, { Schema, Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface IAppointment extends Document {
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

const appointmentSchema = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 30
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['check-up', 'follow-up', 'consultation', 'procedure', 'emergency'],
    required: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Create and export the Appointment model
let Appointment: Model<IAppointment>;

try {
  // Try to get the existing model to prevent OverwriteModelError
  Appointment = mongoose.model<IAppointment>('Appointment');
} catch (e) {
  // Model doesn't exist yet, so create it
  Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
}

export default Appointment; 