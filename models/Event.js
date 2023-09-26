const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: [true, "Enter event name"],
  },
  image: {
    type: String,
  },
  date: { type: Date, required: true },
  location: {
    latitude: String,
    longitude: String,
  },
  price: { type: Number },
  eventType: { type: String, enum: ["paid", "free"] },
  delegates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  eventBudget: { type: Number },
  invitations: [
    {
      phoneNo: String,
      email: String,
      paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending',
      },
      isGoing: Boolean,
      paymentMethod: {
        type: String,
        enum: ['paypal', 'stripe'],
      },
      paymentId: {
        type: String,
      },

    },
  ],
  stats:{
    invited: { type: Number,default: 0},
    going: { type: Number,default: 0},
    notgoing: { type: Number,default: 0},
    waiting: { type: Number,default: 0},
  },
  tasks:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    }
  ]
});

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;
