# WaslMed Chat System Type Issues Fix

## Current TypeScript Errors

In `src/app/api/chat/connected-doctors/route.ts`, there are two TypeScript errors related to implicit `any` types:

1. Line 53: Parameter 'conn' implicitly has an 'any' type.
2. Line 58: Parameter 'doctorConn' implicitly has an 'any' type.

## Solution

The issue is that we're working with the `connectedDoctors` array from the `MedicalRecord` model, but we haven't properly imported or typed the interface for the doctor connection schema.

### Step 1: Create Interface for Doctor Connection

Create a new interface in `src/types/medical.ts` (or update existing one):

```typescript
import { Types } from 'mongoose';

export interface DoctorConnection {
  doctorId: Types.ObjectId;
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
```

### Step 2: Fix the Connected Doctors Route

Update `src/app/api/chat/connected-doctors/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import User from '@/models/User';
import Doctor from '@/models/Doctor';
import MedicalRecord from '@/models/MedicalRecord';
import Conversation from '@/models/Conversation';
import { Participant } from '@/types/chat';
import { DoctorConnection } from '@/types/medical';

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
        const doctor = await Doctor.findById(doctorConn.doctorId);
        
        return {
          _id: `potential_${doctorConn.doctorId}`,
          otherParticipant: {
            id: doctorConn.doctorId,
            type: 'Doctor',
            name: doctorConn.doctorName || (doctor ? doctor.name : 'Unknown Doctor'),
            profileImage: doctorConn.profileImage || (doctor ? doctor.profileImage : ''),
          },
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
```

### Alternative Solution

If you don't want to create a new type file, you can directly use type casting inline:

```typescript
// Filter to approved connections and not already in conversations
const approvedDoctors = connectedDoctors.filter(
  (conn: any) => conn.status === 'approved' && !existingDoctorIds.has(conn.doctorId.toString())
);

// Format as potential conversations
const potentialConversations = await Promise.all(
  approvedDoctors.map(async (doctorConn: any) => {
    // Get the actual doctor document for any additional info needed
    const doctor = await Doctor.findById(doctorConn.doctorId);
    
    // Rest of the code
  })
);
```

However, using proper type definitions is strongly recommended for better code quality and maintainability.

## Other Type Considerations

1. Make sure `isPotential` is consistently added to both the `Conversation` and `ConversationWithParticipantInfo` interfaces in `src/types/chat.ts`.

2. If you have a schema definition file for the `MedicalRecord`, consider exporting the `DoctorConnectionSchema` type directly from there to maintain type consistency.

3. Consider adding proper typing for the response data in your API endpoints:

```typescript
interface ConnectedDoctorsResponse {
  potentialConversations: ConversationWithParticipantInfo[];
}
```

These changes will ensure your chat system is properly typed and will pass TypeScript validation without errors. 