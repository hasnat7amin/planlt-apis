const Event = require("../../../models/Event");
const sendEmail = require("../../../utils/send-email");
const sendSms = require("../../../utils/send_sms");
const addImage = require("../../../utils/addImage");
const qr = require("qrcode");

module.exports = async (req, res) => {
  try {
    const {eventBudget} = req.body; // Assuming you send event data in the request body

    const event = await Event.findByIdAndUpdate(req.params.id,{eventBudget:eventBudget });

    const serverUrl = `${req.protocol}://${req.get("host")}`;
    // Generate a QR code for the event
    const qrCodeData = `${serverUrl}/event/${event._id}`;
    const qrCode = await qr.toDataURL(qrCodeData);
    const invitationLink = `${serverUrl}/event/${event._id}`;

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Event updated successfully.",
      result: await Event.findById(req.params.id),
      invitationLink:invitationLink,
      qrCodeData: qrCodeData, // Include the QR code data in the response
      qrCodeImage: qrCode, // Include the QR code image in the response
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: false,
      message: "Failed to create the event.",
      error: error.message,
    });
  }
};
