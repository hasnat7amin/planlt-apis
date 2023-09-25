const Event = require("../../models/Event");

module.exports = async (req, res) => {
  const eventId = req.params.id;

  try {
    // Fetch the event based on the provided ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).send("Event not found");
    }

    // Render the EJS page and pass the event data
    res.render("eventGuestInvitation", { event });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).send("Internal Server Error");
  }
};
