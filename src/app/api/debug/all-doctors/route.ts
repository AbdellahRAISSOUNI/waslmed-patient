import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Doctor from '@/models/Doctor';

/**
 * GET: Fetch all doctors in the database
 * This is a debugging endpoint to view all doctors
 */
export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Find all doctors
    const doctors = await Doctor.find({})
      .select('_id name email specialization hospital profileImage createdAt');

    // Format the response
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization || 'Not specified',
      hospital: doctor.hospital || 'Not specified',
      profileImage: doctor.profileImage,
      createdAt: doctor.createdAt
    }));

    return NextResponse.json({
      success: true,
      count: doctors.length,
      doctors: formattedDoctors
    });

  } catch (error) {
    console.error('Error fetching all doctors:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching doctors data' }, 
      { status: 500 }
    );
  }
} 