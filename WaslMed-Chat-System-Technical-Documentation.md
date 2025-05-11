# WaslMed Chat System Technical Documentation

## Overview

The WaslMed Chat System provides secure messaging between patients and their healthcare providers. The system allows patients to see all their connected doctors (even if no previous conversations exist) and initiate new conversations directly from the messaging interface.

## Implementation Details

### Data Models

#### 1. Chat Data Types (`src/types/chat.ts`)

Key interfaces:
- `ChatMessage`: Represents individual messages
- `Conversation`: Represents a conversation between two participants
- `ConversationWithParticipantInfo`: Specialized view of conversation with other participant details
- `Participant`: Represents a user or doctor in a conversation
- Added `isPotential` flag to indicate potential conversations that don't yet exist in database

#### 2. Database Models

- `ChatMessage.ts`: Stores individual messages with sender/recipient info
- `Conversation.ts`: Tracks conversations between users with last message and unread counts
- Uses relationships with the existing `User`, `Doctor`, and `MedicalRecord` models

### API Endpoints

#### 1. Fetch Conversations (`/api/chat`)
- Returns all conversations for the authenticated user
- Formats with other participant info and unread counts

#### 2. Fetch/Send Messages (`/api/chat/messages`)
- GET: Retrieves messages for a specific conversation
- POST: Sends a new message, creating a conversation if needed

#### 3. Connected Doctors API (`/api/chat/connected-doctors`)
- New endpoint created specifically for this feature
- Fetches all doctors connected to the patient from their medical record
- Filters out doctors already in conversations
- Returns formatted potential conversations

```typescript
// Example of fetching connected doctors that don't have active conversations
export async function GET(req: NextRequest) {
  // Authentication check
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // Get patient data and medical record
  const user = await User.findOne({ email: session.user.email });
  const medicalRecord = await MedicalRecord.findOne({ user: user._id });

  // Find existing conversation doctor IDs
  const existingConversations = await Conversation.find({
    'participants': { $elemMatch: { id: user._id, type: 'User' } }
  }).lean();
  
  const existingDoctorIds = new Set();
  existingConversations.forEach(conv => {
    const doctorParticipant = conv.participants.find(p => p.type === 'Doctor');
    if (doctorParticipant) existingDoctorIds.add(doctorParticipant.id.toString());
  });

  // Filter connected doctors (approved and not already in conversations)
  const connectedDoctors = medicalRecord.connectedDoctors || [];
  const approvedDoctors = connectedDoctors.filter(
    conn => conn.status === 'approved' && !existingDoctorIds.has(conn.doctorId.toString())
  );

  // Format as potential conversations
  const potentialConversations = await Promise.all(
    approvedDoctors.map(async (doctorConn) => {
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

  return NextResponse.json({ potentialConversations });
}
```

### Frontend Components

#### 1. Messaging Page (`src/app/dashboard/messaging/page.tsx`)

- Main container that orchestrates the chat interface
- Fetches both actual conversations and potential conversations
- Handles selecting conversations and displaying the appropriate components
- Manages conversation state including:
  - Regular conversations from the database
  - Potential conversations with connected doctors
  - Selected conversation for display
  
```typescript
// Key aspects of implementation
const [conversations, setConversations] = useState<ConversationWithParticipantInfo[]>([]);
const [potentialConversations, setPotentialConversations] = useState<ConversationWithParticipantInfo[]>([]);
const [allConversations, setAllConversations] = useState<ConversationWithParticipantInfo[]>([]);

// Fetch conversations and connected doctors
useEffect(() => {
  if (status === 'authenticated') {
    fetchConversations();
    fetchConnectedDoctors();
  }
}, [status]);

// Combine conversations
useEffect(() => {
  setAllConversations([...conversations, ...potentialConversations]);
}, [conversations, potentialConversations]);

const handleSelectConversation = (conversation: ConversationWithParticipantInfo) => {
  // Handle potential conversations differently
  if (conversation.isPotential) {
    startNewConversation(conversation);
  } else {
    setSelectedConversation(conversation);
    // Reset unread count for this conversation
    setUnreadCounts(prev => ({ ...prev, [conversation._id]: 0 }));
  }
};
```

#### 2. Chat Sidebar (`src/components/chat/ChatSidebar.tsx`)

- Displays the list of conversations on the left side
- Visually separates real conversations from potential conversations
- Indicates unread messages with badge counters
- Shows doctor info with visual indicators

```typescript
// Key changes
// Separate real and potential conversations
const realConversations = filteredConversations.filter(conv => !conv.isPotential);
const potentialConversations = filteredConversations.filter(conv => conv.isPotential);

// Render different sections
{/* Active conversations */}
{realConversations.map((conversation) => (
  // Render existing conversations
))}

{/* Potential conversations section header */}
{potentialConversations.length > 0 && (
  <div className="pt-2 pb-1 px-3 bg-gray-100 border-b border-gray-200">
    <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Your Doctors</h3>
  </div>
)}

{/* Render potential conversations with visual indicator */}
{potentialConversations.map((conversation) => (
  <motion.div
    key={conversation._id}
    className={`p-3 border-b border-gray-200 cursor-pointer bg-blue-50 hover:bg-blue-100`}
    onClick={() => onSelectConversation(conversation)}
  >
    {/* Doctor details with "Start conversation" prompt */}
  </motion.div>
))}
```

#### 3. Chat Window (`src/components/chat/ChatWindow.tsx`)

- Displays the conversation content on the right side
- Shows messages with different styles for sent vs. received
- Handles the message input and sending functionality
- Modified to work with both real and potential conversations
- Special UI for first-time conversations

```typescript
// Key aspects of implementation
const isPotential = conversation.isPotential;

// Fetch messages differently based on conversation type
useEffect(() => {
  if (conversation && !isPotential) {
    fetchMessages();
  } else {
    // For potential conversations, we don't need to fetch messages
    setLoading(false);
    setMessages([]);
  }
}, [conversation._id, isPotential]);

// Customized empty state for potential conversations
{messages.length === 0 ? (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <div className={`rounded-full p-3 mb-3 ${isPotential ? 'bg-blue-100' : 'bg-emerald-100'}`}>
      {/* Icon */}
    </div>
    <h3 className="font-medium text-gray-900">
      {isPotential ? 'Start a conversation with your doctor' : 'No messages yet'}
    </h3>
    <p className="text-sm text-gray-500 mt-1">
      {isPotential 
        ? `Send a message to ${conversation.otherParticipant.name} to start the conversation`
        : 'Start the conversation by sending a message'}
    </p>
  </div>
) : (
  // Message list
)}
```

### Messaging Flow

1. Patient visits the messaging page
2. System fetches:
   - Existing conversations from `/api/chat`
   - Connected doctors without conversations from `/api/chat/connected-doctors`
3. All conversations are displayed in the sidebar:
   - Regular conversations on top
   - "Your Doctors" section with connected doctors
4. When patient clicks a regular conversation:
   - Messages are loaded from `/api/chat/messages`
   - Chat window displays the conversation history
5. When patient clicks a doctor from "Your Doctors":
   - A UI is shown to start a new conversation
   - The doctor is removed from potential conversations list
   - When first message is sent, a real conversation is created

## Type Definitions

### Conversation and ChatMessage

```typescript
export interface ChatMessage {
  _id?: string;
  senderId: string | Types.ObjectId;
  senderType: 'User' | 'Doctor';
  recipientId: string | Types.ObjectId;
  recipientType: 'User' | 'Doctor';
  message: string;
  timestamp: Date;
  read: boolean;
  readAt?: Date;
  attachments?: {
    type: 'image' | 'document' | 'other';
    url: string;
    name: string;
    size: number;
  }[];
}

export interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: LastMessage;
  unreadCount: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isPotential?: boolean; // Flag to indicate a potential conversation
}

export interface ConversationWithParticipantInfo extends Omit<Conversation, 'participants'> {
  otherParticipant: Participant;
  isPotential?: boolean; // Flag to indicate a potential conversation
}
```

## Implementation Notes

1. **TypeScript Type Safety**: The `DoctorConnectionSchema` from `MedicalRecord.ts` should be properly imported and used in the connected-doctors route to fix the "implicitly any" type warnings.

2. **Error Handling**: Each API endpoint includes comprehensive error handling, with specific error codes and messages.

3. **Performance Considerations**:
   - Fetches connected doctors only once on initial load
   - Avoids re-fetching all conversations when sending a new message
   - Uses lean queries for performance

4. **Security**:
   - All endpoints verify authenticated user
   - Ensures users can only access their own conversations
   - Validates doctor connections before allowing chat

## Future Enhancements

1. **Real-time Messaging**: Implement WebSocket or Server-Sent Events for instant message delivery using the PusherServer infrastructure already in place.

2. **Media Sharing**: Enhance the attachments system to support secure sharing of medical documents, images, and other files.

3. **Message Templates**: Add quick-reply templates for common doctor-patient communications.

4. **Group Conversations**: Support for multi-participant conversations for care teams.

5. **Read Receipts**: Visual indicators for when messages are read by the recipient. 