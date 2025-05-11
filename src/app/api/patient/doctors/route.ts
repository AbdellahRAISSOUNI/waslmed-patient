import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import MedicalRecord from '@/models/MedicalRecord';

/**
 * GET: Fetch all doctors connected to the patient
 */
export async function GET(req: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to access this endpoint' },
        { status: 401 }
      );
    }

    console.log('Fetching doctors for patient:', session.user.email);

    // Connect to the database
    await dbConnect();

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      console.log('User not found for email:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Found user:', user._id);

    // Find the user's medical record
    const medicalRecord = await MedicalRecord.findOne({ user: user._id });
    if (!medicalRecord) {
      console.log('Medical record not found for user:', user._id);
      return NextResponse.json({ error: 'Medical record not found' }, { status: 404 });
    }

    console.log('Found medical record:', medicalRecord._id);
    console.log('Connected doctors in medical record:', medicalRecord.connectedDoctors || []);

    // Get all connected doctors (status filtering no longer needed as all are auto-approved)
    const connectedDoctors = medicalRecord.connectedDoctors || [];

    // Return the connected doctors
    return NextResponse.json({
      success: true,
      doctors: connectedDoctors
    });
  } catch (error) {
    console.error('Error fetching connected doctors:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching connected doctors' },
      { status: 500 }
    );
  }
} 