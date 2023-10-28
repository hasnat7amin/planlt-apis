const Event = require("../../../models/Event");

module.exports = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if the event with the given ID exists
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        code: 404,
        status: false,
        message: "Event not found.",
      });
    }

    // Delete the event
    await Event.deleteOne({_id:eventId});

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Event deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: false,
      message: "Failed to delete the event.",
      error: error.message,
    });
  }
};
