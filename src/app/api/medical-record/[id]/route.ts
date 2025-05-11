import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import MedicalRecord from '@/models/MedicalRecord';
import User from '@/models/User';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Connect to the database
    await dbConnect();

    // Get the user from DB
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the medical record ID from the request params - ensure params is properly awaited
    const id = params.id;

    // Find the medical record
    const medicalRecord = await MedicalRecord.findById(id);

    if (!medicalRecord) {
      return NextResponse.json(
        { error: 'Medical record not found' },
        { status: 404 }
      );
    }

    // Check if the medical record belongs to the authenticated user
    if (medicalRecord.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to access this medical record' },
        { status: 403 }
      );
    }

    // Return the medical record
    return NextResponse.json({
      success: true,
      medicalRecord
    });
  } catch (error) {
    console.error('Error fetching medical record:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the medical record' },
      { status: 500 }
    );
  }
} 