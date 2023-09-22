const Event = require("../../../models/Event");
const Task = require("../../../models/Task");


module.exports = async (req, res) => {
    try {
      const searchText = req.body.searchText; // Assuming the search text is in the request body
  
      // Search events where userId matches and event name contains the search text
      const events = await Event.find({
        userId: req.user._id,
        name: { $regex: searchText, $options: 'i' } // Case-insensitive search
      });
  
      const searchEvents = await Event.find({
        userId: req.user._id,})
      // Search tasks where userId matches and task name contains the search text
      const tasks = await Task.find({
        eventId: { $in: searchEvents.map(event => event._id) },
        taskName: { $regex: searchText, $options: 'i' } // Case-insensitive search
      });
  
      return res.status(200).json({
        code: 200,
        status: true,
        message: "Search results fetched successfully.",
        result: {
          events,
          tasks
        }
      });
    } catch (error) {
      return res.status(500).json({
        code: 500,
        status: false,
        message: "Failed to fetch search results.",
        error: error.message
      });
    }
  };
  