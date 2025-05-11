import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import MedicalRecord from '@/models/MedicalRecord';
import User from '@/models/User';

/**
 * GET: Debug route to fetch medical record details
 * This is a temporary endpoint for debugging purposes
 */
export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const recordId = searchParams.get('recordId');

    if (!email && !recordId) {
      return NextResponse.json(
        { error: 'Either email or recordId is required' }, 
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    let medicalRecord;

    if (email) {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json(
          { error: 'User not found with provided email' }, 
          { status: 404 }
        );
      }

      // Find medical record for user
      medicalRecord = await MedicalRecord.findOne({ user: user._id });
    } else if (recordId) {
      // Find medical record by ID
      medicalRecord = await MedicalRecord.findById(recordId);
    }

    if (!medicalRecord) {
      return NextResponse.json(
        { error: 'Medical record not found' }, 
        { status: 404 }
      );
    }

    // Return the medical record with connected doctors information
    return NextResponse.json({
      success: true,
      medicalRecord: {
        id: medicalRecord._id,
        userId: medicalRecord.user,
        connectedDoctors: medicalRecord.connectedDoctors || []
      }
    });

  } catch (error) {
    console.error('Error in debug medical record endpoint:', error);
    return NextResponse.json(
      { error: 'An error occurred while debugging medical record' }, 
      { status: 500 }
    );
  }
} 