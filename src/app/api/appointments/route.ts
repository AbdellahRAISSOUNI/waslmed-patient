import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import Doctor from '@/models/Doctor';
import User from '@/models/User';

// GET handler to retrieve appointments
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("Fetching appointments for user:", session.user.email);

    // Parse query parameters
    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date');
    const statusParam = url.searchParams.get('status');

    // Connect to the database
    await connectToDatabase();
    console.log("Database connected successfully");
    
    // Find the user by email to get the ID
    const userEmail = session.user.email;
    const userDoc = await User.findOne({ email: userEmail });
    
    if (!userDoc) {
      console.error("User not found in database:", userEmail);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log("User found:", userDoc._id, "Role:", userDoc.role);
    
    // Build the query
    const query: any = {};
    
    // Add filters based on user role
    if (userDoc.role === 'doctor') {
      query.doctorId = userDoc._id;
    } else {
      query.patientId = userDoc._id;
    }
    
    console.log("Query filters:", JSON.stringify(query));
    
    // Add date filter if provided
    if (dateParam) {
      const startDate = new Date(dateParam);
      const endDate = new Date(dateParam);
      endDate.setDate(endDate.getDate() + 1);
      
      query.date = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    // Add status filter if provided
    if (statusParam) {
      query.status = statusParam;
    }
    
    console.log("Final query:", JSON.stringify(query));
    
    // Find appointments
    const appointments = await Appointment.find(query).sort({ date: 1, time: 1 });
    console.log(`Found ${appointments.length} appointments`);
    
    return NextResponse.json(appointments);
  } catch (error: unknown) {
    console.error('Error fetching appointments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch appointments', details: errorMessage }, { status: 500 });
  }
}

// POST handler to create a new appointment
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log("Creating appointment, user:", session.user.email);
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the user by email to get the ID and role
    const userEmail = session.user.email;
    const userDoc = await User.findOne({ email: userEmail });
    
    if (!userDoc) {
      console.error("User not found in database:", userEmail);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Only doctors can create appointments
    if (userDoc.role !== 'doctor') {
      return NextResponse.json({ error: 'Only doctors can create appointments' }, { status: 403 });
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Validate that the patient is connected to the doctor
    const doctor = await Doctor.findById(userDoc._id);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }
    
    console.log("Doctor found:", doctor._id);
    console.log("Patient ID from request:", body.patientId);
    console.log("Connected patients:", doctor.patients);
    
    if (!doctor.patients.includes(body.patientId) && !doctor.patients.some((p: mongoose.Types.ObjectId) => p.toString() === body.patientId)) {
      return NextResponse.json({ error: 'Patient is not connected to this doctor' }, { status: 403 });
    }
    
    // Get patient details
    const patient = await User.findById(body.patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
    
    // Create a new appointment
    const newAppointment = new Appointment({
      patientId: body.patientId,
      patientName: body.patientName || `${patient.firstName} ${patient.lastName}`,
      doctorId: userDoc._id,
      doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      date: new Date(body.date),
      time: body.time,
      duration: body.duration || 30,
      type: body.type,
      notes: body.notes || '',
    });
    
    console.log("Creating appointment:", newAppointment);
    
    // Save the appointment
    await newAppointment.save();
    
    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating appointment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: 'Failed to create appointment', details: errorMessage }, { status: 500 });
  }
} 