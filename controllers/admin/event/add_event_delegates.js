const Event = require("../../../models/Event");
const sendEmail = require("../../../utils/send-email");
const sendSms = require("../../../utils/send_sms");
const addImage = require("../../../utils/addImage");
const qr = require("qrcode");
const Users = require("../../../models/Users");

module.exports = async (req, res) => {
  try {
    const { delegates } = req.body; // Assuming you send delegates data in the request body
    const eventId = req.params.id; // Assuming you pass the event ID as a parameter
    const serverUrl = `${req.protocol}://${req.get("host")}`;
    // Find the event by ID
    let event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        code: 404,
        status: false,
        message: "Event not found.",
      });
    }

    // Create an array to store user IDs for the delegates
    const delegateUserIds = [];

    // Process each delegate
    for (const delegate of delegates) {
      // Create a new user based on the delegate's email or phone number
      let user;

      if (delegate.email) {
        user = await Users.findOne({ email: delegate.email, role: "delegate" });
        if (!user) {
          user = new Users({
            email: delegate.email,
            role: "delegate",
            // You can set other user properties here if needed
          });
        }
      } else if (delegate.phoneNo) {
        user = await Users.findOne({
          phoneNo: delegate.phoneNo,
          role: "delegate",
        });
        if (!user) {
          user = new Users({
            phoneNo: delegate.phoneNo,
            role: "delegate",
            // You can set other user properties here if needed
          });
        }
      }

      // Save the user to the database
      await user.save();

      if (user.email) {
        const invitationLink = `${serverUrl}/event/${event._id}`;
        await sendEmail({
          email: user.email,
          from: process.env.SMPT_MAIL,
          subject: "Event Invitation",
          message: `You are invited to the event. Click this link to RSVP: ${invitationLink}`,
        });
        console.log(" email sented") // Customize your email content
      }
      if (user.phoneNo) {
        // Replace with your phone number field
        const invitationLink = `${serverUrl}/event/${event._id}`;
        await sendSms(
          user.phoneNo,
          `You are invited to the event. Click this link to RSVP: ${invitationLink}`
        );
      }

      // Retrieve the created user ID and store it in the delegateUserIds array
      // Check if the user ID is not already in the delegateUserIds array
      if (!event.delegates.includes(user._id)) {
        delegateUserIds.push(user._id);
      }
    }

    // If the event already has delegates, append the new delegates to the existing list
    if (event.delegates) {
      event.delegates = event.delegates.concat(delegateUserIds);
    } else {
      event.delegates = delegateUserIds;
    }

    // Save the updated event to the database
    await event.save();

    event = await Event.findById(eventId).populate({
      path: "delegates",
    });

    // Generate a QR code for the event
    const qrCodeData = `${serverUrl}/event/${event._id}`;
    const qrCode = await qr.toDataURL(qrCodeData);
    const invitationLink = `${serverUrl}/event/${event._id}`;

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Event updated successfully.",
      result: event,
      invitationLink: invitationLink,
      qrCodeData: qrCodeData, // Include the QR code data in the response
      qrCodeImage: qrCode, // Include the QR code image in the response
    });
  } catch (error) {
    return res.status(400).json({
      code: 400,
      status: false,
      message: "Failed to create the event.",
      error: error.message,
    });
  }
};
