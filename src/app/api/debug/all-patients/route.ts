import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import MedicalRecord from '@/models/MedicalRecord';
import User from '@/models/User';

/**
 * GET: Fetch all patients (medical records) in the database
 * This is a debugging endpoint to view all patients
 */
export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Find all medical records
    const medicalRecords = await MedicalRecord.find({})
      .select('_id user connectedDoctors createdAt');

    // Format the response
    const formattedRecords = await Promise.all(medicalRecords.map(async (record) => {
      let userName = "Unknown";
      let userEmail = "Unknown";
      
      // Try to get user info if available
      if (record.user) {
        try {
          const user = await User.findById(record.user).select('name email');
          if (user) {
            userName = user.name || "Unknown";
            userEmail = user.email || "Unknown";
          }
        } catch (err) {
          console.error('Error fetching user info:', err);
        }
      }
      
      return {
        id: record._id,
        userName: userName,
        userEmail: userEmail,
        userId: record.user,
        doctorConnections: record.connectedDoctors?.length || 0,
        connectedDoctors: record.connectedDoctors || [],
        createdAt: record.createdAt
      };
    }));

    return NextResponse.json({
      success: true,
      count: medicalRecords.length,
      patients: formattedRecords
    });

  } catch (error) {
    console.error('Error fetching all patients:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching patients data' }, 
      { status: 500 }
    );
  }
} 