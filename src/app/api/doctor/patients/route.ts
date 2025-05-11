import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Doctor from '@/models/Doctor';

/**
 * GET: Get all patients connected to a doctor
 */
export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const status = searchParams.get('status');

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Find the doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Filter patients based on the status query parameter if provided
    let patients = doctor.patients;
    if (status) {
      patients = doctor.patients.filter(
        (patient: any) => patient.status === status
      );
    }

    // Return the patients
    return NextResponse.json({
      success: true,
      patients
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching patients' },
      { status: 500 }
    );
  }
} 