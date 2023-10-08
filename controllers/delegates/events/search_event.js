const Event = require("../../../models/Event");
const Task = require("../../../models/Task");

module.exports = async (req, res) => {
  try {
    const searchText = req.body.searchText;

    // Search events where user.req._id exists in delegates
    const events = await Event.find({
      delegates: { $in: [req.user._id] },
      name: { $regex: searchText, $options: "i" },
    })
      .populate("tasks")
      .populate("userId")
      .populate("delegates");

    // Get the event IDs for further task search
    const eventIds = events.map((event) => event._id);

    // Search tasks where eventId is in eventIds and taskName matches the search text
    const tasks = await Task.find({
      eventId: { $in: eventIds },
      taskName: { $regex: searchText, $options: "i" },
    });

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Search results fetched successfully.",
      result: {
        events,
        tasks,
      },
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to fetch search results.",
      error: error.message,
    });
  }
};
