import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  participants: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'participants.type'
    },
    type: {
      type: String,
      required: true,
      enum: ['User', 'Doctor']
    },
    name: String,
    profileImage: String
  }],
  lastMessage: {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'lastMessage.senderType'
    },
    senderType: {
      type: String,
      enum: ['User', 'Doctor']
    },
    content: String,
    timestamp: Date
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Update the updatedAt field on save
ConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create an index for faster queries
ConversationSchema.index({ 'participants.id': 1 });
ConversationSchema.index({ updatedAt: -1 });

// Static method to find or create a conversation
ConversationSchema.statics.findOrCreate = async function(participant1, participant2) {
  // Sort participants to ensure consistent query
  const sortedParticipants = [participant1, participant2].sort((a, b) => 
    a.id.toString().localeCompare(b.id.toString())
  );
  
  // Try to find existing conversation
  let conversation = await this.findOne({
    'participants': {
      $all: [
        { $elemMatch: { id: sortedParticipants[0].id, type: sortedParticipants[0].type } },
        { $elemMatch: { id: sortedParticipants[1].id, type: sortedParticipants[1].type } }
      ]
    }
  });
  
  // If conversation doesn't exist, create it
  if (!conversation) {
    conversation = await this.create({
      participants: sortedParticipants,
      unreadCount: new Map([
        [sortedParticipants[0].id.toString(), 0],
        [sortedParticipants[1].id.toString(), 0]
      ])
    });
  }
  
  return conversation;
};

// Update last message and unread count
ConversationSchema.statics.updateWithMessage = async function(conversationId, message) {
  const recipientId = message.recipientId.toString();
  
  return this.findByIdAndUpdate(
    conversationId,
    {
      $set: {
        lastMessage: {
          sender: message.senderId,
          senderType: message.senderType,
          content: message.message,
          timestamp: message.timestamp
        },
        updatedAt: new Date()
      },
      $inc: {
        [`unreadCount.${recipientId}`]: 1
      }
    },
    { new: true }
  );
};

// Reset unread count for a participant
ConversationSchema.statics.resetUnreadCount = async function(conversationId, participantId) {
  return this.findByIdAndUpdate(
    conversationId,
    {
      $set: {
        [`unreadCount.${participantId.toString()}`]: 0
      }
    },
    { new: true }
  );
};

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema); 