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
      return res.status(404).json({
        code: 404,
        status: false,
        message: "Event not found.",
      });
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

    // Save the updated event to the database
    await event.save();

    const serverUrl = `${req.protocol}://${req.get("host")}`;

    if (event.invitations) {
      // Send invitation links to all phone numbers
      for (const invitation of event.invitations) {
        const phoneNumber = invitation.phoneNo; // Replace with your phone number field
        const invitationLink =  `${serverUrl}/event/${event._id}`; // Customize your invitation link
        await sendSms(phoneNumber, `Event Invitation: ${invitationLink}`); // Customize your SMS content and implement sendSms function
      }
    }

    



    // Generate a QR code for the event
    const qrCodeData = `${serverUrl}/event/${event._id}`;
    const qrCode = await qr.toDataURL(qrCodeData);
    const invitationLink = `${serverUrl}/event/${event._id}`;

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Event updated successfully.",
      result: await Event.findById(eventId),
      invitationLink:invitationLink,
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
