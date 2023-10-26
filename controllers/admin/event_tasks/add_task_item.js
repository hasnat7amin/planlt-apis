const Task = require("../../../models/Task");
const Users = require("../../../models/Users"); // Import your Users model
const sendEmail = require("../../../utils/send-email"); // Import your send-email utility
const sendSms = require("../../../utils/send_sms"); // Import your send-sms utility

module.exports = async (req, res) => {
  try {
    const {
      taskId,
      itemName,
      itemsMeasureName,
      itemsMeasureQuantity,
      quantityNumber,
      quantitySize,
      status,
      time,
    } = req.body;

    // Find the task by ID
    const task = await Task.findById(taskId);

    if (!task) {
      throw new Error("Task not found");
    }

    // Create a new task item
    const taskItem = {
      itemName,
      itemsMeasureName,
      itemsMeasureQuantity,
      quantityNumber,
      quantitySize,
      status,
      time,
    };

    // Push the task item to the task's items array
    task.items.push(taskItem);

    // Save the updated task to the database
    await task.save();

    // Send notifications to assigned delegates via email and SMS
    for (const delegateId of task.assignedDelegates) {
      const delegate = await Users.findById(delegateId);

      if (delegate.email) {
        // Send email notification
        await sendEmail({
          email: delegate.email,
          subject: "Task Item Created",
          message: `A new task item "${itemName}" has been created for the task "${task.taskName}".`,
        });
      }

      if (delegate.phoneNo) {
        // Send SMS notification
        const smsMessage = `A new task item "${itemName}" has been created for the task "${task.taskName}".`;
        await sendSms(delegate.phoneNo, smsMessage);
      }
    }

    return res.status(201).json({
      code: 201,
      status: true,
      message: "Task item created successfully.",
      result: {
        task : await Task.findById(taskId),
        item: taskItem
      },
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to create the task item.",
      error: error.message,
    });
  }
};
