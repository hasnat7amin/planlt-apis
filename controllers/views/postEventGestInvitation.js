const Event = require('../../models/Event');
const EventGuest = require('../../models/EventGuest'); // Create this model if not already existing

module.exports = async (req, res) => {
  const eventId = req.params.id;
  const { name, phoneNo, email } = req.body;

  try {
    // Fetch the event based on the provided ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).send('Event not found');
    }

    // Save guest data to EventGuest model
    const guestData = {
        username:name,
      phoneNo,
      email,
      eventId:eventId,
      paymentStatus: event.price > 0 ? 'pending' : 'paid'
    };

    const eventGuest = await EventGuest.create(guestData);
    eventGuest.scheduleDeletion();
    const serverUrl = `${req.protocol}://${req.get("host")}`;

    return res.redirect(`${serverUrl}/v1/event/${eventId}/guest/${eventGuest._id}/payment` );
  } catch (error) {
    console.error('Error handling event invitation:', error);
    return res.status(400).json({
      code:400,
      status:false,
      message:"Guest Event not added successfully.",
      error: error.message
    })
  }
};  

 