const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chats: [
      {
        receiver: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        messages: [
          {
            message: {
              type: String,
              required: true,
            },
            userType: {
              type: String,
              enum: ["sender", "receiver"],
              required: true,
            },
            read: {
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
    collection: "Chat",
  }
);

const Chat = mongoose.model("Chat", ChatSchema);

module.exports = Chat;
