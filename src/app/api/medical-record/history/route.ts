import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import MedicalRecord from '@/models/MedicalRecord';

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
    const historyType = searchParams.get('type') || 'all'; // 'all', 'access', 'edit'
    const doctorId = searchParams.get('doctorId'); // optional: filter by doctor
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

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

    // Prepare response data
    let accessHistory = [];
    let editHistory = [];

    // Get access history
    if (historyType === 'all' || historyType === 'access') {
      accessHistory = medicalRecord.accessLog || [];
      
      // Filter by doctor if doctorId is provided
      if (doctorId) {
        accessHistory = accessHistory.filter(
          (log: any) => log.doctorId.toString() === doctorId
        );
      }
      
      // Sort by access date (newest first)
      accessHistory = accessHistory.sort(
        (a: any, b: any) => new Date(b.accessDate).getTime() - new Date(a.accessDate).getTime()
      );
      
      // Paginate results
      accessHistory = accessHistory.slice((page - 1) * limit, page * limit);
    }

    // Get edit history
    if (historyType === 'all' || historyType === 'edit') {
      editHistory = medicalRecord.editHistory || [];
      
      // Filter by doctor if doctorId is provided
      if (doctorId) {
        editHistory = editHistory.filter(
          (edit: any) => edit.editedBy.doctorId.toString() === doctorId
        );
      }
      
      // Sort by edit date (newest first)
      editHistory = editHistory.sort(
        (a: any, b: any) => new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime()
      );
      
      // Paginate results
      editHistory = editHistory.slice((page - 1) * limit, page * limit);
    }

    return NextResponse.json({
      success: true,
      accessHistory,
      editHistory,
      pagination: {
        page,
        limit,
        totalAccessRecords: medicalRecord.accessLog?.length || 0,
        totalEditRecords: medicalRecord.editHistory?.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching medical record history:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching medical record history' },
      { status: 500 }
    );
  }
} 