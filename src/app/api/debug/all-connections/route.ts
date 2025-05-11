import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import MedicalRecord from '@/models/MedicalRecord';
import Doctor from '@/models/Doctor';

/**
 * GET: Debug utility to view all doctor-patient connections in the system
 * This is a temporary endpoint for debugging connection issues
 */
export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Find all medical records with connected doctors
    const medicalRecords = await MedicalRecord.find({ 
      'connectedDoctors.0': { $exists: true } 
    }).select('user connectedDoctors');

    // Find all doctors with connected patients
    const doctors = await Doctor.find({ 
      'patients.0': { $exists: true } 
    }).select('_id name email patients');

    // Format the response for better readability
    const formattedMedicalRecords = medicalRecords.map(record => ({
      medicalRecordId: record._id,
      userId: record.user,
      connectedDoctorsCount: record.connectedDoctors?.length || 0,
      connectedDoctors: record.connectedDoctors?.map(doc => ({
        doctorId: doc.doctorId,
        doctorName: doc.doctorName,
        status: doc.status,
        requestDate: doc.requestDate,
        responseDate: doc.responseDate
      }))
    }));

    const formattedDoctors = doctors.map(doctor => ({
      doctorId: doctor._id,
      name: doctor.name,
      email: doctor.email,
      patientsCount: doctor.patients?.length || 0,
      patients: doctor.patients?.map(patient => ({
        patientId: patient.patientId,
        medicalRecordId: patient.medicalRecordId,
        status: patient.status,
        requestDate: patient.requestDate,
        responseDate: patient.responseDate
      }))
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalMedicalRecordsWithConnections: medicalRecords.length,
        totalDoctorsWithConnections: doctors.length,
      },
      medicalRecords: formattedMedicalRecords,
      doctors: formattedDoctors
    });

  } catch (error) {
    console.error('Error fetching all connections:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching connection data' }, 
      { status: 500 }
    );
  }
} 