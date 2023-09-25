const Event = require('../../models/Event');
const EventGuest = require('../../models/EventGuest');

module.exports = async (req, res) => {
  const eventId = req.params.eventId;
  const guestId = req.params.guestId;

  try {
    // Fetch the event based on the provided ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).send('Event not found');
    }

    // Fetch the guest based on the provided guestId
    const guest = await EventGuest.findById(guestId);

    if (!guest) {
      return res.status(404).send('Guest not found');
    }

    // Render the payment page with event and guest details
    res.render('eventGuestPayment', { event, guest }); // Assuming you have a view named 'paymentPage.ejs'
  } catch (error) {
    console.error('Error rendering payment page:', error);
    res.status(500).send('Internal Server Error');
  }
};

