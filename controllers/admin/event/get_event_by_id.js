const Event = require("../../../models/Event");
const Task = require("../../../models/Task");

module.exports = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate({ path: "tasks" }) 
      .populate({ path: "tasks.assignedDelegates" }) 
      .populate("userId") 
      .populate("delegates");

    if (!event) {
      throw new Error("Event not found");
    }

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Event Tasks fetched successfully.",
      result: event,
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to fetch event tasks.",
      error: error.message,
    });
  }
};
