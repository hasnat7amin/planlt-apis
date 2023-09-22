const Event = require("../../../models/Event");

module.exports = async (req, res) => {
  const eventId = req.params.id;
  const { delegateIds } = req.body; // Array of delegate IDs to remove

  try {
    // Find the event by ID
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    // Remove the specified delegate IDs from the event's delegates
    event.delegates = event.delegates.filter((delegateId) => !delegateIds.includes(delegateId));

    // Save the updated event to the database
    await event.save();

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Delegates removed successfully.",
      result: event,
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to remove delegates from the event.",
      error: error.message,
    });
  }
};

