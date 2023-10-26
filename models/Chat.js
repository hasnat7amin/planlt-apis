const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    chats: [
      {
        receiver: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        messages: [
          {
            messageType: {
              type: String,
              enum: ['text', 'image', 'file', 'emoji', 'audio', 'document'],
              required: true,
            },
            messageContent: {
              type: String,
              required: true,
            },
            userType: {
              type: String,
              enum: ['sender', 'receiver'],
              required: true,
            },
            delivered: {
              type: Boolean,
              default: false,
            },
            seen: {
              type: Boolean,
              default: false,
            },
            time: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    collection: 'Chat',
  }
);

const Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat;
