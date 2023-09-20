const Event = require("../../../models/Event");

module.exports = async (req, res) => {
  try {
    const { sortByDate, upcomingOnly } = req.query;
    const filter = { userId: req.user._id };

    if (upcomingOnly === 'true') {
      // Show only upcoming events (eventDate >= currentDate)
      filter.date = { $gte: new Date() };
    }

    let eventsQuery =  Event.find(filter);

    if (sortByDate === 'true') {
      // Sort by date if requested
      eventsQuery =  eventsQuery.sort({ date: 1 });
    }

    const events = await eventsQuery.exec();

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Events fetched successfully.",
      result: events,
    });
  } catch (error) {
    return res.status(400).json({
      code: 400,
      status: false,
      message: "Failed to fetch events.",
      error: error.message,
    });
  }
};


// /events: Fetch all events for the user.
// /events?sortByDate=true: Fetch events sorted by date in ascending order.
// /events?upcomingOnly=true: Fetch only upcoming events.