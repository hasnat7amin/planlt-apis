const Event = require("../../../models/Event");
const sendEmail = require("../../../utils/send-email");
const sendSms = require("../../../utils/send_sms");
const addImage = require("../../../utils/addImage");
const qr = require("qrcode");

module.exports = async (req, res) => {
  try {
    const { name, price, date, address,description,time } = req.body; // Assuming you send event data in the request body
    // const location = { latitude, longitude };

    const user = req.user;

    // Check the user's membership status
    if (user.membership !== "premium") {
      // If the user is not in premium membership, check the number of events they have
      const eventCount = await Event.countDocuments({ userId: user._id });
      if (eventCount >= 3) {
        return res.status(200).json({
          code: 200,
          status: false,
          message: "You are in free membership and has reached the event limit (3 events).",
          error: "You are in free membership and has reached the event limit (3 events).",
        });
      }
    }


    let image;
    if (req.file) {
      image = await addImage(req.file);
    }
    const event = new Event({
      name,
      price,
      time,
      date,
      address: address,
      image: image,
      description,
      userId: req.user._id,
    });

    // Save the event to the database
    await event.save();

    const serverUrl = `${req.protocol}://${req.get("host")}`;

    // Generate a QR code for the event
    const qrCodeData = `${serverUrl}/v1/event/${event._id}/guest/invitation`;
    const qrCode = await qr.toDataURL(qrCodeData);
    const invitationLink = `${serverUrl}/v1/event/${event._id}/guest/invitation`;

    return res.status(201).json({
      code: 201,
      status: true,
      message: "Event created successfully.",
      result: event,
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
