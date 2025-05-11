import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import ChatMessage from '@/models/ChatMessage';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import Doctor from '@/models/Doctor';
import { Participant, ChatMessage as ChatMessageType } from '@/types/chat';
import { PusherServer } from '@/lib/pusher';

// Get messages for a conversation
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get query parameters
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');
    const recipientId = url.searchParams.get('recipientId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const skip = parseInt(url.searchParams.get('skip') || '0');
    
    if (!conversationId && !recipientId) {
      return NextResponse.json({ error: 'Missing conversationId or recipientId' }, { status: 400 });
    }
    
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
    
    let messages: ChatMessageType[] = [];
    
    if (conversationId) {
      // Verify the user is part of this conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        'participants': {
          $elemMatch: { id: userId, type: userType }
        }
      });
      
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      
      // Get the other participant
      const otherParticipant = conversation.participants.find(
        (p: Participant) => !(p.id.toString() === userId.toString() && p.type === userType)
      );
      
      if (!otherParticipant) {
        return NextResponse.json({ error: 'Invalid conversation' }, { status: 400 });
      }
      
      // Get messages
      messages = await ChatMessage.find({
        $or: [
          { senderId: userId, recipientId: otherParticipant.id },
          { senderId: otherParticipant.id, recipientId: userId }
        ]
      })
      .sort({ timestamp: 1 })
      .skip(skip)
      .limit(limit + 1)
      .lean();
      
      // Mark messages as read - using mongoose methods
      await ChatMessage.updateMany(
        { 
          recipientId: userId,
          senderId: otherParticipant.id,
          read: false
        },
        {
          $set: { 
            read: true,
            readAt: new Date()
          }
        }
      ).exec();
      
      // Reset unread count - using mongoose methods
      await Conversation.findByIdAndUpdate(
        conversationId,
        {
          $set: {
            [`unreadCount.${userId.toString()}`]: 0
          }
        }
      );
      
    } else if (recipientId) {
      const recipientType = url.searchParams.get('recipientType') || 'User';
      
      // Get messages between the two users
      messages = await ChatMessage.find({
        $or: [
          { senderId: userId, senderType: userType, recipientId, recipientType },
          { senderId: recipientId, senderType: recipientType, recipientId: userId, recipientType: userType }
        ]
      })
      .sort({ timestamp: 1 })
      .skip(skip)
      .limit(limit + 1)
      .lean();
      
      // Mark messages as read - using mongoose methods
      await ChatMessage.updateMany(
        { 
          recipientId: userId,
          senderId: recipientId,
          read: false
        },
        {
          $set: { 
            read: true,
            readAt: new Date()
          }
        }
      ).exec();
      
      // Find conversation and reset unread count
      const conversation = await Conversation.findOne({
        'participants': {
          $all: [
            { $elemMatch: { id: userId, type: userType } },
            { $elemMatch: { id: recipientId, type: recipientType } }
          ]
        }
      });
      
      if (conversation) {
        await Conversation.findByIdAndUpdate(
          conversation._id,
          {
            $set: {
              [`unreadCount.${userId.toString()}`]: 0
            }
          }
        );
      }
    }
    
    // Check if there are more messages
    const hasMore = messages.length > limit;
    const messagesToReturn = hasMore ? messages.slice(0, limit) : messages;
    
    return NextResponse.json({
      messages: messagesToReturn,
      hasMore
    });
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// Send a message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const data = await req.json();
    const { recipientId, recipientType, message, attachments } = data;
    
    if (!recipientId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // First, determine if the user is a patient or doctor
    const user = await User.findOne({ email: session.user.email });
    let sender, senderId, senderType, senderName, senderImage;
    
    if (user) {
      sender = user;
      senderId = user._id;
      senderType = 'User';
      senderName = user.name;
      // If there's a medical record with profile image, use it
      const medicalRecord = await mongoose.model('MedicalRecord').findOne({ user: user._id });
      senderImage = medicalRecord?.profileImage || '';
    } else {
      const doctor = await Doctor.findOne({ email: session.user.email });
      if (!doctor) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      sender = doctor;
      senderId = doctor._id;
      senderType = 'Doctor';
      senderName = doctor.name;
      senderImage = doctor.profileImage || '';
    }
    
    // Verify recipient exists
    let recipient, recipientName, recipientImage;
    
    if (recipientType === 'User') {
      recipient = await User.findById(recipientId);
      if (!recipient) {
        return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
      }
      recipientName = recipient.name;
      const medicalRecord = await mongoose.model('MedicalRecord').findOne({ user: recipient._id });
      recipientImage = medicalRecord?.profileImage || '';
    } else {
      recipient = await Doctor.findById(recipientId);
      if (!recipient) {
        return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
      }
      recipientName = recipient.name;
      recipientImage = recipient.profileImage || '';
    }
    
    // Create or find conversation using mongoose methods directly
    let conversation = await Conversation.findOne({
      'participants': {
        $all: [
          { $elemMatch: { id: senderId, type: senderType } },
          { $elemMatch: { id: recipientId, type: recipientType } }
        ]
      }
    });
    
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [
          { 
            id: senderId, 
            type: senderType, 
            name: senderName, 
            profileImage: senderImage 
          },
          { 
            id: recipientId, 
            type: recipientType, 
            name: recipientName, 
            profileImage: recipientImage 
          }
        ],
        unreadCount: {
          [senderId.toString()]: 0,
          [recipientId.toString()]: 0
        }
      });
    }
    
    // Create message
    const newMessage = await ChatMessage.create({
      senderId,
      senderType,
      recipientId,
      recipientType,
      message,
      timestamp: new Date(),
      read: false,
      attachments
    });
    
    // Update conversation with last message using mongoose methods
    await Conversation.findByIdAndUpdate(
      conversation._id,
      {
        $set: {
          lastMessage: {
            sender: senderId,
            senderType,
            content: message,
            timestamp: new Date()
          },
          updatedAt: new Date()
        },
        $inc: {
          [`unreadCount.${recipientId.toString()}`]: 1
        }
      }
    );
    
    // We would normally send a real-time notification here
    // But we'll handle that on the client side with socket.io
    
    return NextResponse.json({
      message: newMessage,
      conversationId: conversation._id
    });
    
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
} 