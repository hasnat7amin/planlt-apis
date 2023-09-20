const Event = require("../../../models/Event");
const Task = require("../../../models/Task");

module.exports = async (req, res) => {
  try {
    const { taskName, assignedDelegates, status, dueDate } = req.body;
    const eventId = req.params.eventId; // Assuming you pass the event ID as a parameter
    const taskId = req.params.taskId; // Assuming you pass the task ID as a parameter

    // Find the event by ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        code: 404,
        status: false,
        message: "Event not found.",
      });
    }

    // Find the task by ID
    let task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        code: 404,
        status: false,
        message: "Task not found.",
      });
    }

    // Update the task properties
    // task.taskName = taskName;
    // task.assignedDelegates = assignedDelegates;
    // task.status = status;
    // task.dueDate = dueDate;
    task = await Task.findByIdAndUpdate(taskId,req.body)
    task = await Task.findById(taskId);

    // Save the updated task to the database
    // await task.save();

     // Send notifications to assigned delegates via email and SMS
     for (const delegateId of task.assignedDelegates) {
        const delegate = await Users.findById(delegateId);
  
        if (delegate.email) {
          // Send email notification
          await sendEmail(
            delegate.email,
            "Task Updated",
            `The task "${taskName}" has been updated. Status: ${status}`
          );
        }
  
        if (delegate.phoneNo) {
          // Send SMS notification
          const smsMessage = `The task "${taskName}" has been updated. Status: ${status}`;
          await sendSms(delegate.phoneNo, smsMessage);
        }
      }

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Task updated successfully.",
      result: task,
    });
  } catch (error) {
    return res.status(400).json({
      code: 400,
      status: false,
      message: "Failed to update the task.",
      error: error.message,
    });
  }
};
