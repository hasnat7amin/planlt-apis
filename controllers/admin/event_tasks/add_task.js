const Event = require("../../../models/Event");
const Task = require("../../../models/Task");
const Users = require("../../../models/Users");
const sendEmail = require("../../../utils/send-email"); // Import your send-email utility
const sendSms = require("../../../utils/send_sms");

module.exports = async (req, res) => {
  try {
    const { taskName, assignedDelegates, status, dueDate } = req.body;
    const eventId = req.params.id; // Assuming you pass the event ID as a parameter

    // Find the event by ID
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    // Create a new task associated with the event
    const task = new Task({
      eventId,
      taskName,
      assignedDelegates,
      status,
      dueDate,
    });

    // Save the task to the database
    await task.save();

    // Add the created task to the event's tasks array
    event.tasks.push(task);

    // Save the updated event to the database
    await event.save();

    // Send notifications to assigned delegates via email and SMS
    for (const delegateId of assignedDelegates) {
      const delegate = await Users.findById(delegateId); // Assuming you have a Users model

      if (delegate.email) {
        // Send email notification
        await sendEmail({
          from: process.env.SMPT_MAIL,
          email: delegate.email,
          subject: "Task Assignment",
          message: `You have been assigned a new task: ${taskName}`,
        });
      }

      if (delegate.phoneNo) {
        // Send SMS notification
        await sendSms(
           toPhoneNumber =delegate.phoneNo,
          message = `You have been assigned a new task: ${taskName}`
        );
      }
    }

    return res.status(201).json({
      code: 201,
      status: true,
      message: "Task created successfully and added to the event.",
      result: task,
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to create the task.",
      error: error.message,
    });
  }
};
