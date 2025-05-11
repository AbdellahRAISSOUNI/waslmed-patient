import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import MedicalRecord from '@/models/MedicalRecord';
import bcrypt from 'bcryptjs';

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

    // Connect to the database
    await dbConnect();

    // Find the user by email
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the user's medical record
    const medicalRecord = await MedicalRecord.findOne({ user: user._id });
    
    // Return user data (excluding sensitive information like password)
    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        medicalRecordId: medicalRecord ? medicalRecord._id : null
      }
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user data' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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

    // Find the user by email
    const user = await User.findOne({ email: session.user.email }).select('+password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    // Prepare update object
    const updateData: any = {};
    
    // Update name if provided
    if (name && name !== user.name) {
      updateData.name = name;
    }
    
    // Update email if provided and different
    if (email && email !== user.email) {
      // Check if email is already in use by another user
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
      updateData.email = email;
    }
    
    // Handle password change if both current and new passwords are provided
    if (currentPassword && newPassword) {
      // Validate current password
      const isPasswordValid = await user.matchPassword(currentPassword);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
      
      // Validate new password (at least 6 characters)
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters long' },
          { status: 400 }
        );
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }
    
    // If no updates were provided
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No changes were made',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      });
    }
    
    // Update user data
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'User data updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating user data' },
      { status: 500 }
    );
  }
} 