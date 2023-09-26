const Event = require("../../../models/Event");
const Users = require("../../../models/Users")
const Task = require("../../../models/Task");
const sendEmail = require("../../../utils/send-email"); 
const sendSms = require("../../../utils/send_sms");

module.exports = async (req, res) => {
  try {
    const { taskName, assignedDelegates, status, dueDate } = req.body;
    const eventId = req.params.eventId; // Assuming you pass the event ID as a parameter
    const taskId = req.params.taskId; // Assuming you pass the task ID as a parameter

    // Find the event by ID
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error("Event not found.")
    }

    // Find the task by ID
    let task = await Task.findById(taskId);

    if (!task) {
      throw new Error("Task not found.")
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
          await sendEmail({
            email:delegate.email,
            subject:"Task Updated",
            message:`The task "${taskName}" has been updated.`
        });
        }
  
        if (delegate.phoneNo) {
          // Send SMS notification
          const smsMessage = `The task "${taskName}" has been updated.`;
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
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to update the task.",
      error: error.message,
    });
  }
};
