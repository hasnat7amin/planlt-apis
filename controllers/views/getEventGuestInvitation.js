const Event = require("../../models/Event");

module.exports = async (req, res) => {
  const eventId = req.params.id;

  try {
    // Fetch the event based on the provided ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.render("404",{errorDescription:"Event not found"})
    }

    // Render the EJS page and pass the event data
    res.render("eventGuestInvitation", { event });
  } catch (error) {
    console.error("Error fetching event:", error);
    return res.render("404",{errorDescription:"Internal Server Error"})
  }
};
