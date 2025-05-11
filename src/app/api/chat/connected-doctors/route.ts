import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import User from '@/models/User';
import Doctor from '@/models/Doctor';
import MedicalRecord from '@/models/MedicalRecord';
import Conversation from '@/models/Conversation';
import { Participant } from '@/types/chat';

interface DoctorConnection {
  doctorId: mongoose.Types.ObjectId;
  doctorName?: string;
  specialization?: string;
  profileImage?: string;
  hospital?: string;
  requestDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  responseDate?: Date;
  notes?: string;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Verify user is a patient
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get user's medical record to find connected doctors
    const medicalRecord = await MedicalRecord.findOne({ user: user._id });
    if (!medicalRecord) {
      return NextResponse.json({ error: 'Medical record not found' }, { status: 404 });
    }
    
    // Get existing conversations
    const existingConversations = await Conversation.find({
      'participants': {
        $elemMatch: { id: user._id, type: 'User' }
      }
    }).lean();
    
    // Create a map of doctor IDs already in conversations
    const existingDoctorIds = new Set();
    existingConversations.forEach(conv => {
      const doctorParticipant = conv.participants.find(
        (p: Participant) => p.type === 'Doctor'
      );
      if (doctorParticipant) {
        existingDoctorIds.add(doctorParticipant.id.toString());
      }
    });
    
    // Get connected doctors from medical record
    const connectedDoctors = medicalRecord.connectedDoctors || [];
    
    // Filter to approved connections and not already in conversations
    const approvedDoctors = connectedDoctors.filter(
      (conn: DoctorConnection) => conn.status === 'approved' && !existingDoctorIds.has(conn.doctorId.toString())
    );
    
    // Format as potential conversations
    const potentialConversations = await Promise.all(
      approvedDoctors.map(async (doctorConn: DoctorConnection) => {
        // Get the actual doctor document for any additional info needed
        const doctor = await Doctor.findById(doctorConn.doctorId).lean();
        
        // Combine data from both doctor document and connection data
        const doctorInfo = {
          id: doctorConn.doctorId,
          type: 'Doctor',
          name: doctor?.name || doctorConn.doctorName || 'Unknown Doctor',
          profileImage: doctor?.profileImage || doctorConn.profileImage || '',
          specialization: doctor?.specialization || doctorConn.specialization || '',
          hospital: doctor?.hospital || doctorConn.hospital || ''
        };
        
        return {
          _id: `potential_${doctorConn.doctorId}`,
          otherParticipant: doctorInfo,
          isPotential: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          unreadCount: new Map(),
          isActive: true
        };
      })
    );
    
    return NextResponse.json({
      potentialConversations
    });
    
  } catch (error) {
    console.error('Error fetching connected doctors:', error);
    return NextResponse.json({ error: 'Failed to fetch connected doctors' }, { status: 500 });
  }
} 