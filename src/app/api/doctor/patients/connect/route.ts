import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import MedicalRecord from '@/models/MedicalRecord';
import Doctor from '@/models/Doctor';
import mongoose from 'mongoose';

/**
 * POST: Doctor requests access to a patient's medical record
 * This endpoint is called when a doctor wants to connect with a patient
 */
export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const body = await req.json();
    const { medicalRecordId, doctorId, reason = 'Requesting access to your medical record' } = body;

    if (!medicalRecordId || !doctorId) {
      return NextResponse.json(
        { error: 'Medical record ID and doctor ID are required' },
        { status: 400 }
      );
    }

    // Find the doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Find the medical record
    const medicalRecord = await MedicalRecord.findById(medicalRecordId);
    if (!medicalRecord) {
      return NextResponse.json({ error: 'Medical record not found' }, { status: 404 });
    }

    // Check if connection request already exists
    const existingConnection = medicalRecord.connectedDoctors.find(
      (connection: any) => connection.doctorId.toString() === doctorId
    );

    if (existingConnection) {
      // Connection already exists
      return NextResponse.json({ 
        success: true, 
        message: `Connection request already exists with status: ${existingConnection.status}`,
        status: existingConnection.status
      });
    }

    // Add a new connection request
    medicalRecord.connectedDoctors.push({
      doctorId: new mongoose.Types.ObjectId(doctorId),
      doctorName: doctor.name,
      specialization: doctor.specialization,
      profileImage: doctor.profileImage,
      hospital: doctor.hospital,
      status: 'approved',
      reason: reason,
      requestDate: new Date(),
      responseDate: new Date()
    });

    // Add the patient to the doctor's record as well
    doctor.patients.push({
      patientId: medicalRecord.user,
      medicalRecordId: medicalRecord._id,
      status: 'approved',
      requestDate: new Date(),
      responseDate: new Date(),
      notes: reason || 'Auto-approved connection'
    });

    // Save both records
    await Promise.all([doctor.save(), medicalRecord.save()]);

    // Log the connection request
    console.log(`Doctor ${doctor.name} (${doctorId}) connected to medical record ${medicalRecordId}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Connected to patient successfully',
      status: 'approved'
    });
  } catch (error) {
    console.error('Error creating connection request:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating connection request', details: error }, 
      { status: 500 }
    );
  }
} 