const Event = require("../../../models/Event");
const Task = require("../../../models/Task");

module.exports = async (req, res) => {
  try {
    const { eventId,taskId } = req.params;

    const event = await Event.findById(eventId)
      .populate({ path: "tasks", populate: "assignedDelegates" })
      .populate("userId")
      .populate("delegates");

    if (!event) {
      throw new Error("Event not found");
    }

    // Fetch task items and supplies related to the event
    const tasks = await Task.findById(taskId).select("items supplies");

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Event Tasks and Supplies fetched successfully.",
      result: { event, tasks },
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to fetch event tasks and supplies.",
      error: error.message,
    });
  }
};
