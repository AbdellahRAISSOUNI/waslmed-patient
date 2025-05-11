itimport { ObjectId } from "mongodb";

export interface Appointment {
  _id: string;
  patientId: string | ObjectId;
  patientName: string;
  doctorId: string | ObjectId;
  doctorName: string;
  date: string | Date;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'check-up' | 'follow-up' | 'consultation' | 'procedure' | 'emergency';
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Extend the next-auth session type to include role
declare module "next-auth" {
  interface User {
    role?: 'doctor' | 'patient' | 'admin';
  }
  
  interface Session {
    user: User & {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
} 