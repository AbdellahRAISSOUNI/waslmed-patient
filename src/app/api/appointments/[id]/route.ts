import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import User from '@/models/User';

// GET handler to retrieve a specific appointment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`Fetching appointment ${params.id} for user ${session.user.email}`);

    // Connect to the database
    await connectToDatabase();
    
    // Find the user by email to get the ID and role
    const userEmail = session.user.email;
    const userDoc = await User.findOne({ email: userEmail });
    
    if (!userDoc) {
      console.error("User not found in database:", userEmail);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Validate appointment ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }
    
    // Find the appointment
    const appointment = await Appointment.findById(params.id);
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    // Verify that the user has access to this appointment
    const userId = userDoc._id.toString();
    const userRole = userDoc.role;
    
    if (
      (userRole === 'doctor' && appointment.doctorId.toString() !== userId) ||
      (userRole === 'patient' && appointment.patientId.toString() !== userId)
    ) {
      return NextResponse.json({ error: 'Unauthorized access to appointment' }, { status: 403 });
    }
    
    return NextResponse.json(appointment);
  } catch (error: unknown) {
    console.error('Error fetching appointment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch appointment', details: errorMessage }, { status: 500 });
  }
}

// PUT handler to update an appointment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log(`Updating appointment ${params.id} for user ${session.user.email}`);
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the user by email to get the ID and role
    const userEmail = session.user.email;
    const userDoc = await User.findOne({ email: userEmail });
    
    if (!userDoc) {
      console.error("User not found in database:", userEmail);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Validate appointment ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }
    
    // Find the appointment
    const appointment = await Appointment.findById(params.id);
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    // Verify that the user has access to this appointment
    const userId = userDoc._id.toString();
    const userRole = userDoc.role;
    
    if (
      (userRole === 'doctor' && appointment.doctorId.toString() !== userId) ||
      (userRole === 'patient' && appointment.patientId.toString() !== userId)
    ) {
      return NextResponse.json({ error: 'Unauthorized access to appointment' }, { status: 403 });
    }
    
    // Parse the request body
    const updates = await request.json();
    console.log("Requested updates:", updates);
    
    // Validate updates
    const allowedUpdates = ['date', 'time', 'duration', 'status', 'type', 'notes'];
    const requestedUpdates = Object.keys(updates);
    
    // Only allow updates to specific fields
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowedUpdates.includes(key))
    );
    
    // Patients can only update status to 'cancelled'
    if (userRole === 'patient') {
      if (updates.status && updates.status !== 'cancelled') {
        return NextResponse.json(
          { error: 'Patients can only cancel appointments' },
          { status: 403 }
        );
      }
      
      // Remove any other fields patients shouldn't update
      Object.keys(filteredUpdates).forEach(key => {
        if (key !== 'status' && key !== 'notes') {
          delete filteredUpdates[key];
        }
      });
    }
    
    console.log("Final updates to apply:", filteredUpdates);
    
    // Update the appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      params.id,
      filteredUpdates,
      { new: true }
    );
    
    return NextResponse.json(updatedAppointment);
  } catch (error: unknown) {
    console.error('Error updating appointment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: 'Failed to update appointment', details: errorMessage }, { status: 500 });
  }
}

// DELETE handler to delete an appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated session
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log(`Deleting appointment ${params.id} for user ${session.user.email}`);
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the user by email to get the ID and role
    const userEmail = session.user.email;
    const userDoc = await User.findOne({ email: userEmail });
    
    if (!userDoc) {
      console.error("User not found in database:", userEmail);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Validate appointment ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }
    
    // Find the appointment
    const appointment = await Appointment.findById(params.id);
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    // Only doctors can delete appointments
    if (userDoc.role !== 'doctor' || appointment.doctorId.toString() !== userDoc._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized to delete appointment' }, { status: 403 });
    }
    
    // Delete the appointment
    await Appointment.findByIdAndDelete(params.id);
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting appointment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: 'Failed to delete appointment', details: errorMessage }, { status: 500 });
  }
} 