import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import MedicalRecord from '@/models/MedicalRecord';
import Doctor from '@/models/Doctor';

/**
 * PUT: Update additional notes for a doctor connection
 * Note: This simplified endpoint now only allows patients to add notes to
 * doctor connections since all connections are auto-approved.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    const doctorId = params.doctorId;

    // Get the user session
    const session = await getServerSession();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to access this endpoint' },
        { status: 401 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Parse the request body
    const body = await req.json();
    const { notes } = body;

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the user's medical record
    const medicalRecord = await MedicalRecord.findOne({ user: user._id });
    if (!medicalRecord) {
      return NextResponse.json({ error: 'Medical record not found' }, { status: 404 });
    }

    // Find the doctor connection
    const connectionIndex = medicalRecord.connectedDoctors.findIndex(
      (doctor: any) => doctor.doctorId.toString() === doctorId
    );

    if (connectionIndex === -1) {
      return NextResponse.json({ error: 'Doctor connection not found' }, { status: 404 });
    }

    // Update the notes field if provided
    if (notes) {
      medicalRecord.connectedDoctors[connectionIndex].notes = notes;
    }

    // Save the updated medical record
    await medicalRecord.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Doctor connection notes updated',
      doctor: medicalRecord.connectedDoctors[connectionIndex]
    });
  } catch (error) {
    console.error('Error updating doctor connection notes:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the connection notes' },
      { status: 500 }
    );
  }
} 