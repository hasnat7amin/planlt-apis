const Event = require("../../../models/Event");
const sendEmail = require("../../../utils/send-email");
const sendSms = require("../../../utils/send_sms");
const addImage = require("../../../utils/addImage");
const qr = require("qrcode");

module.exports = async (req, res) => {
  try {
    const { invitations } = req.body; // Assuming you send invitations data in the request body
    const eventId = req.params.id; // Assuming you pass the event ID as a parameter

    // Find the event by its ID
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    // Check if event has previous invitations
    if (event.invitations && event.invitations.length > 0) {
      // Concatenate the new invitations with the existing invitations
      event.invitations = event.invitations.concat(invitations);
    } else {
      // If no previous invitations, assign the new invitations directly
      event.invitations = invitations;
    }

    // Update the 'invited' count in 'stats' field
    event.stats.invited = event.invitations.length;
    event.stats.waiting = event.invitations.length;

    // Save the updated event to the database
    await event.save();

    const serverUrl = `${req.protocol}://${req.get("host")}`;

    if (event.invitations) {
      // Send invitation links to all phone numbers
      for (const invitation of event.invitations) {
        if (invitation.phoneNo) {
          const phoneNumber = invitation.phoneNo; // Replace with your phone number field
          const invitationLink = `${serverUrl}/v1/event/${event._id}/phoneNo/invitation/${invitation._id}`; // Customize your invitation link
          await sendSms(
            (toPhoneNumber = phoneNumber),
            (message = `You are Invited To The Event. \n Event Invitation: ${invitationLink}`)
          ); // Customize your SMS content and implement sendSms function
        }
        if(invitation.email){
          const invitationLink = `${serverUrl}/v1/event/${event._id}/phoneNo/invitation/${invitation._id}`; // Customize your invitation link
          await sendEmail({
            email: invitation.email,
            from: process.env.SMPT_MAIL,
            subject: "Event Invitation",
            message: `You are Invited To The Event. \n Event Invitation: ${invitationLink}`,
          });
        }
      }
    }

    // Generate a QR code for the event
    const qrCodeData = `${serverUrl}/v1/event/${event._id}/guest/invitation`;
    const qrCode = await qr.toDataURL(qrCodeData);
    const invitationLink = `${serverUrl}/v1/event/${event._id}/guest/invitation`;

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Event updated successfully.",
      result: await Event.findById(eventId)
        .populate("tasks") // Populate the tasks field with associated Task documents
        .populate("userId") // Populate the userId field with associated User document
        .populate("delegates"),
      invitationLink: invitationLink,
      qrCodeData: qrCodeData, // Include the QR code data in the response
      qrCodeImage: qrCode, // Include the QR code image in the response
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to create the event.",
      error: error.message,
    });
  }
};
