import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import MedicalRecord from '@/models/MedicalRecord';
import Doctor from '@/models/Doctor';

/**
 * POST: Debug utility to reset all doctor-patient connections to approved
 * This is a temporary endpoint for fixing connection issues
 */
export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Update all medical records: set all connected doctors to approved
    const medicalRecordResult = await MedicalRecord.updateMany(
      { 'connectedDoctors.status': { $ne: 'approved' } },
      { $set: { 'connectedDoctors.$[elem].status': 'approved', 'connectedDoctors.$[elem].responseDate': new Date() } },
      { arrayFilters: [{ 'elem.status': { $ne: 'approved' } }], multi: true }
    );

    // Update all doctors: set all patient connections to approved
    const doctorResult = await Doctor.updateMany(
      { 'patients.status': { $ne: 'approved' } },
      { $set: { 'patients.$[elem].status': 'approved', 'patients.$[elem].responseDate': new Date() } },
      { arrayFilters: [{ 'elem.status': { $ne: 'approved' } }], multi: true }
    );

    return NextResponse.json({
      success: true,
      message: 'All connections have been reset to approved status',
      updatedMedicalRecords: medicalRecordResult.modifiedCount,
      updatedDoctors: doctorResult.modifiedCount
    });

  } catch (error) {
    console.error('Error resetting connections:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting connections' }, 
      { status: 500 }
    );
  }
} 