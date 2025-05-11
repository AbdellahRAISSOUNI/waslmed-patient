import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import Doctor from '@/models/Doctor';
import { Participant } from '@/types/chat';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = parseInt(url.searchParams.get('skip') || '0');
    
    // First, determine if the user is a patient or doctor
    const user = await User.findOne({ email: session.user.email });
    let userId, userType;
    
    if (user) {
      userId = user._id;
      userType = 'User';
    } else {
      const doctor = await Doctor.findOne({ email: session.user.email });
      if (!doctor) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      userId = doctor._id;
      userType = 'Doctor';
    }
    
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      'participants': {
        $elemMatch: { id: userId, type: userType }
      },
      'isActive': true
    })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit + 1) // Get one extra to check if there are more
    .lean();
    
    // Check if there are more conversations
    const hasMore = conversations.length > limit;
    const conversationsToReturn = hasMore ? conversations.slice(0, limit) : conversations;
    
    // Format conversations to include other participant info
    const formattedConversations = await Promise.all(conversationsToReturn.map(async conversation => {
      const otherParticipant = conversation.participants.find(
        (p: Participant) => !(p.id.toString() === userId.toString() && p.type === userType)
      );
      
      // Fetch additional details for the other participant if needed
      let enhancedParticipant = { ...otherParticipant };
      
      // If the other participant is a doctor, fetch their details
      if (otherParticipant && otherParticipant.type === 'Doctor') {
        try {
          const doctorDetails = await Doctor.findById(otherParticipant.id).lean();
          if (doctorDetails) {
            enhancedParticipant = {
              ...enhancedParticipant,
              name: doctorDetails.name || enhancedParticipant.name || 'Doctor',
              profileImage: doctorDetails.profileImage || enhancedParticipant.profileImage || '',
              specialization: doctorDetails.specialization
            };
          }
        } catch (err) {
          console.error('Error fetching doctor details:', err);
        }
      }
      
      // If the other participant is a user/patient, fetch their details
      if (otherParticipant && otherParticipant.type === 'User') {
        try {
          const userDetails = await User.findById(otherParticipant.id).lean();
          const medicalRecord = await mongoose.model('MedicalRecord').findOne({ user: otherParticipant.id }).lean();
          
          if (userDetails) {
            enhancedParticipant = {
              ...enhancedParticipant,
              name: userDetails.name || enhancedParticipant.name || 'Patient',
              profileImage: medicalRecord?.profileImage || enhancedParticipant.profileImage || ''
            };
          }
        } catch (err) {
          console.error('Error fetching user details:', err);
        }
      }
      
      return {
        _id: conversation._id,
        otherParticipant: enhancedParticipant,
        lastMessage: conversation.lastMessage,
        unreadCount: conversation.unreadCount || new Map(),
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        isActive: conversation.isActive
      };
    }));
    
    return NextResponse.json({
      conversations: formattedConversations,
      hasMore
    });
    
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
} 