const Event = require("../../../models/Event");

module.exports = async (req, res) => {
  try {
    const { sortByDate, sortRecent } = req.query;
    const filter = { userId: req.user._id };

  

    let eventsQuery =  Event.find(filter)
    .populate("tasks") // Populate the tasks field with associated Task documents
    .populate("userId") // Populate the userId field with associated User document
    .populate("delegates");

    if (sortByDate === 'true') {
      // Sort by event date in ascending order
      eventsQuery = eventsQuery.sort({ date: 1 });
    }

    if (sortRecent === 'true') {
      // Sort by event creation date in descending order (recent events first)
      eventsQuery = eventsQuery.sort({ createdAt: -1 });
    }


    const events = await eventsQuery.exec();

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


// /events: Fetch all events for the user.
// /events?sortByDate=true: Fetch events sorted by date in ascending order.
// /events?upcomingOnly=true: Fetch only upcoming events.