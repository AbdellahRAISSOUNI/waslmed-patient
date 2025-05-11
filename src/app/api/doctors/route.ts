import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import MedicalRecord from '@/models/MedicalRecord';
import Doctor from '@/models/Doctor';

// GET: Fetch all doctors connected to the patient
export async function GET(req: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to access this endpoint' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // Connect to the database
    await dbConnect();

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the user's medical record
    const medicalRecord = await MedicalRecord.findOne({ user: user._id });
    if (!medicalRecord) {
      return NextResponse.json({ error: 'Medical record not found' }, { status: 404 });
    }

    // Filter doctors based on the status query parameter if provided
    let filteredDoctors = medicalRecord.connectedDoctors;
    if (status) {
      filteredDoctors = medicalRecord.connectedDoctors.filter(
        (doctor: any) => doctor.status === status
      );
    }

    // Return the connected doctors
    return NextResponse.json({ doctors: filteredDoctors });
  } catch (error) {
    console.error('Error fetching connected doctors:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching connected doctors' },
      { status: 500 }
    );
  }
}

// POST: Respond to a doctor connection request
export async function POST(req: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to access this endpoint' },
        { status: 401 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Parse the request body
    const body = await req.json();
    const { doctorId, status, notes } = body;

    if (!doctorId || !status) {
      return NextResponse.json(
        { error: 'Doctor ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either "approved" or "rejected"' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the user's medical record
    const medicalRecord = await MedicalRecord.findOne({ user: user._id });
    if (!medicalRecord) {
      return NextResponse.json({ error: 'Medical record not found' }, { status: 404 });
    }

    // Find the doctor connection
    const connectionIndex = medicalRecord.connectedDoctors.findIndex(
      (doctor: any) => doctor.doctorId.toString() === doctorId
    );

    if (connectionIndex === -1) {
      return NextResponse.json({ error: 'Doctor connection not found' }, { status: 404 });
    }

    // Update the doctor connection
    medicalRecord.connectedDoctors[connectionIndex].status = status;
    medicalRecord.connectedDoctors[connectionIndex].responseDate = new Date();
    
    if (notes) {
      medicalRecord.connectedDoctors[connectionIndex].notes = notes;
    }

    // Save the updated medical record
    await medicalRecord.save();

    // If the connection is approved, update the doctor's record as well
    if (status === 'approved') {
      const doctor = await Doctor.findById(doctorId);
      if (doctor) {
        // Find the patient connection in the doctor's record
        const patientIndex = doctor.patients.findIndex(
          (patient: any) => patient.patientId.toString() === user._id.toString()
        );

        if (patientIndex !== -1) {
          doctor.patients[patientIndex].status = status;
          doctor.patients[patientIndex].responseDate = new Date();
          doctor.patients[patientIndex].notes = notes || doctor.patients[patientIndex].notes;
          await doctor.save();
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Doctor connection ${status}`,
      doctor: medicalRecord.connectedDoctors[connectionIndex]
    });
  } catch (error) {
    console.error('Error updating doctor connection:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating doctor connection' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a doctor connection
export async function DELETE(req: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to access this endpoint' },
        { status: 401 }
      );
    }

    // Extract query parameters
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

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the user's medical record
    const medicalRecord = await MedicalRecord.findOne({ user: user._id });
    if (!medicalRecord) {
      return NextResponse.json({ error: 'Medical record not found' }, { status: 404 });
    }

    // Remove the doctor connection
    const initialLength = medicalRecord.connectedDoctors.length;
    medicalRecord.connectedDoctors = medicalRecord.connectedDoctors.filter(
      (doctor: any) => doctor.doctorId.toString() !== doctorId
    );

    if (medicalRecord.connectedDoctors.length === initialLength) {
      return NextResponse.json({ error: 'Doctor connection not found' }, { status: 404 });
    }

    // Save the updated medical record
    await medicalRecord.save();

    // Update the doctor's record as well
    const doctor = await Doctor.findById(doctorId);
    if (doctor) {
      // Remove the patient connection from the doctor's record
      doctor.patients = doctor.patients.filter(
        (patient: any) => patient.patientId.toString() !== user._id.toString()
      );
      await doctor.save();
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Doctor connection removed successfully' 
    });
  } catch (error) {
    console.error('Error removing doctor connection:', error);
    return NextResponse.json(
      { error: 'An error occurred while removing doctor connection' },
      { status: 500 }
    );
  }
} 