import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();
    console.log('📊 MongoDB connected successfully');

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log('❌ Registration failed: User already exists:', email);
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    console.log('✅ User registered successfully:', {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    });

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
} 