const Event = require("../../../models/Event");

module.exports = async (req, res) => {
  try {
    const { sortByDate, upcomingOnly } = req.query;

    // Find events where the current user is a delegate
    const events = await Event.find({
      delegates: { $in: [req.user._id] },
      ...(upcomingOnly === 'true' && { date: { $gte: new Date() } })
    })
      .populate("tasks") 
      .populate("userId") 
      .populate("delegates")
      .sort(sortByDate === 'true' ? { date: 1 } : {});

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Events fetched successfully.",
      result: events,
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to fetch events.",
      error: error.message,
    });
  }
};
