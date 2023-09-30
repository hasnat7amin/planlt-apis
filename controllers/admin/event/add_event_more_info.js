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
    const qrCodeData = `${serverUrl}/v1/event/${event._id}/guest/invitation`;
    const qrCode = await qr.toDataURL(qrCodeData);
    const invitationLink = `${serverUrl}/v1/event/${event._id}/guest/invitation`;

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Event updated successfully.",
      result: await Event.findById(id)
      .populate("tasks") // Populate the tasks field with associated Task documents
      .populate("userId") // Populate the userId field with associated User document
      .populate("delegates"),
      invitationLink:invitationLink,
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
