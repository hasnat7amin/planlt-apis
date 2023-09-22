const Event = require("../../../models/Event");
const sendEmail = require("../../../utils/send-email");
const sendSms = require("../../../utils/send_sms");
const addImage = require("../../../utils/addImage");
const qr = require("qrcode");

module.exports = async (req, res) => {
  try {
    const { eventId, name, price, date, latitude, longitude } = req.body;
    const { imageFile } = req; // Assuming image is sent as a file

    // Find the event by ID
    let event = await Event.findById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    // Update event details if provided
    if (name) event.name = name;
    if (price) event.price = price;
    if (date) event.date = date;
    if (latitude && longitude) event.location = { latitude, longitude };
    if (req.file) {
      // Update image if a new image file is provided
      const updatedImage = await addImage(req.file);
      event.image = updatedImage;
    }

    // Save the updated event to the database
    await event.save();

    const serverUrl = `${req.protocol}://${req.get("host")}`;

    // Generate a QR code for the event
    const qrCodeData = `${serverUrl}/event/${event._id}`;
    const qrCode = await qr.toDataURL(qrCodeData);
    const invitationLink = `${serverUrl}/event/${event._id}`;

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Event details updated successfully.",
      result: await Event.findById(eventId),
      invitationLink: invitationLink,
      qrCodeData: qrCodeData,
      qrCodeImage: qrCode,
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: false,
      message: "Failed to update event details.",
      error: error.message,
    });
  }
};
