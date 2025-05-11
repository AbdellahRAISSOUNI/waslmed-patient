import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import MedicalRecord from '@/models/MedicalRecord';
import Doctor from '@/models/Doctor';
import mongoose from 'mongoose';

/**
 * POST: Log doctor access to a medical record
 * This endpoint is called when a doctor attempts to access a medical record
 */
export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const body = await req.json();
    const { medicalRecordId, doctorId, doctorToken, accessType = 'view' } = body;

    if (!medicalRecordId || !doctorId) {
      return NextResponse.json(
        { error: 'Medical record ID and doctor ID are required' },
        { status: 400 }
      );
    }

    // Validate that the doctor exists and token is valid (if provided)
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Token validation (optional - can be implemented for additional security)
    if (doctorToken) {
      const validToken = doctor.accessTokens && doctor.accessTokens.some((tokenObj: any) => 
        tokenObj.token === doctorToken && new Date(tokenObj.expires) > new Date()
      );

      if (!validToken) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
    }

    // Find the medical record
    const medicalRecord = await MedicalRecord.findById(medicalRecordId);
    if (!medicalRecord) {
      return NextResponse.json({ error: 'Medical record not found' }, { status: 404 });
    }

    // Check if the doctor is authorized to access this medical record
    const isAuthorized = medicalRecord.connectedDoctors.some(
      (connection: any) => 
        connection.doctorId.toString() === doctorId && 
        connection.status === 'approved'
    );

    if (!isAuthorized) {
      // Check if a connection request already exists
      const existingConnection = medicalRecord.connectedDoctors.find(
        (connection: any) => connection.doctorId.toString() === doctorId
      );

      // If a connection already exists, just log the access attempt
      if (existingConnection) {
        // Log the access attempt
        medicalRecord.accessLog.push({
          doctorId: new mongoose.Types.ObjectId(doctorId),
          doctorName: doctor.name,
          specialization: doctor.specialization,
          accessType: 'view',
          authorized: false
        });

        await medicalRecord.save();

        return NextResponse.json({ 
          success: false, 
          message: `Access denied. Connection status: ${existingConnection.status}`,
          authorized: false,
          connectionStatus: existingConnection.status
        });
      }
      
      // Otherwise, redirect to connection request endpoint
      // Note: In a real implementation, you'd return a message instructing the client to make a proper connection request
      return NextResponse.json({ 
        success: false, 
        message: 'No connection exists. Please request access first.',
        authorized: false,
        connectionStatus: 'none'
      });
    }

    // Log the successful access
    medicalRecord.accessLog.push({
      doctorId: new mongoose.Types.ObjectId(doctorId),
      doctorName: doctor.name,
      specialization: doctor.specialization,
      accessType,
      authorized: true
    });

    await medicalRecord.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Access granted',
      authorized: true,
      connectionStatus: 'approved'
    });
  } catch (error) {
    console.error('Error processing medical record access:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing access request' },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Edit a medical record by a doctor
 * This endpoint is called when a doctor makes changes to a patient's medical record
 */
export async function PATCH(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const body = await req.json();
    const { medicalRecordId, doctorId, doctorToken, updates, editNote } = body;

    if (!medicalRecordId || !doctorId || !doctorToken || !updates) {
      return NextResponse.json(
        { error: 'Medical record ID, doctor ID, doctor token and updates are required' },
        { status: 400 }
      );
    }

    // Validate that the doctor exists and the token is valid
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Verify doctor's token
    const validToken = doctor.accessTokens.some((tokenObj: any) => 
      tokenObj.token === doctorToken && new Date(tokenObj.expires) > new Date()
    );

    if (!validToken) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Find the medical record
    const medicalRecord = await MedicalRecord.findById(medicalRecordId);
    if (!medicalRecord) {
      return NextResponse.json({ error: 'Medical record not found' }, { status: 404 });
    }

    // Check if the doctor is authorized to edit this medical record
    const isAuthorized = medicalRecord.connectedDoctors.some(
      (connection: any) => 
        connection.doctorId.toString() === doctorId && 
        connection.status === 'approved'
    );

    if (!isAuthorized) {
      return NextResponse.json({ 
        error: 'You are not authorized to edit this medical record',
        authorized: false
      }, { status: 403 });
    }

    // Track the changes in the edit history
    const editHistoryEntries = [];

    // Process the updates and record each change
    for (const [field, newValue] of Object.entries(updates)) {
      // Get the old value - handle nested fields with dot notation
      const fieldParts = field.split('.');
      let oldValue = medicalRecord;
      let currentObj = medicalRecord;
      let lastPart = '';

      // Navigate to the nested property
      for (let i = 0; i < fieldParts.length; i++) {
        const part = fieldParts[i];
        
        if (i === fieldParts.length - 1) {
          // Save the last part for the update
          lastPart = part;
          oldValue = currentObj[part];
        } else {
          // Navigate to the next level
          currentObj = currentObj[part];
        }
      }

      // Update the value - handle nested fields 
      // (In a real app, use a more robust method to handle arrays and nested objects)
      if (fieldParts.length === 1) {
        // Top level field
        medicalRecord[field] = newValue;
      } else {
        // Nested field
        currentObj[lastPart] = newValue;
      }

      // Add to edit history
      editHistoryEntries.push({
        field,
        oldValue,
        newValue,
        editedBy: {
          doctorId: new mongoose.Types.ObjectId(doctorId),
          doctorName: doctor.name,
          specialization: doctor.specialization,
        },
        note: editNote || 'Updated by doctor'
      });
    }

    // Add the edit history entries
    if (!medicalRecord.editHistory) {
      medicalRecord.editHistory = [];
    }
    medicalRecord.editHistory.push(...editHistoryEntries);

    // Update the last updated timestamp
    medicalRecord.lastUpdated = new Date();

    // Log this access as an edit
    medicalRecord.accessLog.push({
      doctorId: new mongoose.Types.ObjectId(doctorId),
      doctorName: doctor.name,
      specialization: doctor.specialization,
      accessType: 'edit',
      authorized: true
    });

    await medicalRecord.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Medical record updated successfully',
      editHistory: editHistoryEntries
    });
  } catch (error) {
    console.error('Error updating medical record:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the medical record' },
      { status: 500 }
    );
  }
} 