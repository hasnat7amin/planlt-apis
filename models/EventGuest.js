const mongoose = require('mongoose');

const EventGuestSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please enter your username'],
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
  },
  phoneNo: {
    type: String,
    required: [true, 'Please enter your phone number'],
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required'],
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['zelle', 'stripe'],
  },
  paymentId: {
    type: String,
  },
});

// Define a function to delete the event guest after 5 minutes if payment is not received
EventGuestSchema.methods.scheduleDeletion = function () {
  const eventGuest = this;

  // Schedule the deletion after 5 minutes if payment is still pending
  setTimeout(async () => {
    if (eventGuest.paymentStatus === 'pending') {
      await EventGuest.findByIdAndDelete(eventGuest._id);
      console.log('Event guest deleted due to non-payment:', eventGuest._id);
    }
  }, 5 * 60 * 1000);
};

const EventGuest = mongoose.model('EventGuest', EventGuestSchema);

module.exports = EventGuest;
