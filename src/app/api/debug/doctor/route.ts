import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Doctor from '@/models/Doctor';

/**
 * GET: Debug route to fetch doctor details
 * This is a temporary endpoint for debugging purposes
 */
export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const email = searchParams.get('email');

    if (!doctorId && !email) {
      return NextResponse.json(
        { error: 'Either doctorId or email is required' }, 
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    let doctor;

    if (doctorId) {
      // Find doctor by ID
      doctor = await Doctor.findById(doctorId);
    } else if (email) {
      // Find doctor by email
      doctor = await Doctor.findOne({ email });
    }

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' }, 
        { status: 404 }
      );
    }

    // Return the doctor with connected patients information
    return NextResponse.json({
      success: true,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        patients: doctor.patients || []
      }
    });

  } catch (error) {
    console.error('Error in debug doctor endpoint:', error);
    return NextResponse.json(
      { error: 'An error occurred while debugging doctor data' }, 
      { status: 500 }
    );
  }
} 