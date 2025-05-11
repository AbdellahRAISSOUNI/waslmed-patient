import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Doctor from '@/models/Doctor';
import MedicalRecord from '@/models/MedicalRecord';
import User from '@/models/User';

/**
 * GET: Get a specific patient by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = params.id;
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');

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

    // Check if the doctor is connected to this patient
    const patientConnection = doctor.patients.find(
      (patient: any) => patient.patientId.toString() === patientId
    );

    if (!patientConnection) {
      return NextResponse.json({ 
        error: 'Patient not found in doctor\'s connections' 
      }, { status: 404 });
    }

    // If the connection is not approved, return limited information
    if (patientConnection.status !== 'approved') {
      return NextResponse.json({
        success: true,
        patient: {
          id: patientId,
          status: patientConnection.status,
          requestDate: patientConnection.requestDate,
          responseDate: patientConnection.responseDate,
          notes: patientConnection.notes
        }
      });
    }

    // If the connection is approved, return more details including the medical record
    const user = await User.findById(patientId);
    const medicalRecord = await MedicalRecord.findById(patientConnection.medicalRecordId);

    if (!user || !medicalRecord) {
      return NextResponse.json({ 
        error: 'Patient information not found' 
      }, { status: 404 });
    }

    // Return detailed patient information
    return NextResponse.json({
      success: true,
      patient: {
        id: patientId,
        name: user.name,
        email: user.email,
        status: patientConnection.status,
        requestDate: patientConnection.requestDate,
        responseDate: patientConnection.responseDate,
        medicalRecord
      }
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching patient information' },
      { status: 500 }
    );
  }
} 