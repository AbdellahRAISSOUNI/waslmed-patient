import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import MedicalRecord from '@/models/MedicalRecord';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    // Get the user's session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Find the user's medical record
    const userEmail = session.user.email;
    const user = await mongoose.models.User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const medicalRecord = await MedicalRecord.findOne({ user: user._id });
    
    if (!medicalRecord) {
      return NextResponse.json({ error: 'Medical record not found' }, { status: 404 });
    }
    
    return NextResponse.json(medicalRecord);
  } catch (error) {
    console.error('Error fetching medical record:', error);
    return NextResponse.json({ error: 'Failed to fetch medical record' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Get the user's session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get the request body
    const data = await req.json();
    
    // Find the user
    const userEmail = session.user.email;
    const user = await mongoose.models.User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update the lastUpdated field
    data.lastUpdated = new Date();
    
    // Find and update the medical record, or create if it doesn't exist
    const medicalRecord = await MedicalRecord.findOneAndUpdate(
      { user: user._id },
      { ...data, user: user._id },
      { new: true, upsert: true }
    );
    
    return NextResponse.json(medicalRecord);
  } catch (error) {
    console.error('Error updating medical record:', error);
    return NextResponse.json({ error: 'Failed to update medical record' }, { status: 500 });
  }
} 