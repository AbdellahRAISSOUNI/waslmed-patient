import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderType'
  },
  senderType: {
    type: String,
    required: true,
    enum: ['User', 'Doctor']
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientType'
  },
  recipientType: {
    type: String,
    required: true,
    enum: ['User', 'Doctor']
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'other']
    },
    url: String,
    name: String,
    size: Number
  }]
});

// Create indexes for faster queries
ChatMessageSchema.index({ senderId: 1, recipientId: 1 });
ChatMessageSchema.index({ timestamp: 1 });

// Define a virtual for conversation ID (combination of both IDs)
ChatMessageSchema.virtual('conversationId').get(function() {
  // Sort IDs to ensure consistent conversation ID regardless of sender/recipient
  const ids = [this.senderId.toString(), this.recipientId.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
});

// Create a static method to get messages between two users
ChatMessageSchema.statics.getConversation = async function(user1Id, user2Id, limit = 50, skip = 0) {
  const sortedIds = [user1Id.toString(), user2Id.toString()].sort();
  
  return this.find({
    $or: [
      { senderId: sortedIds[0], recipientId: sortedIds[1] },
      { senderId: sortedIds[1], recipientId: sortedIds[0] }
    ]
  })
  .sort({ timestamp: 1 })
  .skip(skip)
  .limit(limit)
  .exec();
};

// Mark messages as read
ChatMessageSchema.statics.markAsRead = async function(recipientId, senderId) {
  return this.updateMany(
    { 
      recipientId: recipientId,
      senderId: senderId,
      read: false
    },
    {
      $set: { 
        read: true,
        readAt: new Date()
      }
    }
  ).exec();
};

// Get unread message count
ChatMessageSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({
    recipientId: userId,
    read: false
  }).exec();
};

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema); 