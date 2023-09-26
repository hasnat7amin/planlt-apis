const Event = require("../../models/Event");



module.exports = async (req, res) => {
  const { eventId, invitationId } = req.params;
  const { isGoing } = req.body;
  const serverUrl = `${req.protocol}://${req.get("host")}`;

  try {
    // Fetch the event based on the provided ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    let found = false;

    event.invitations.find((inv) => {
      if (inv._id.toString() === invitationId) {
        found = true;
        inv.isGoing = isGoing;
        if (isGoing) {
          event.stats.going += 1;
          event.stats.waiting -= 1;
        } else {
          event.stats.notgoing += 1;
          event.stats.waiting -= 1;
        }
      }
    });
    await event.save();

    if (found) {
      return res.status(200).json({
        code: 200,
        status: true,
        message: "Guest Event added successfully.",
        result: {
          redirect: `${serverUrl}/v1/event/${eventId}/phoneNo/invitation/${invitationId}`,
        },
      });
    } else {
      return res.status(400).json({
        code: 400,
        status: false,
        message: "Invitee not found.",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error creating PayPal checkout session:", error);
    return res.status(400).json({
      code: 400,
      status: false,
      message: "Event Invitee not updadated successfully.",
      error: error.message,
    });
  }
};
