const Task = require("../../../models/Task");
const Event = require("../../../models/Event");

module.exports = async (req, res) => {
  try {
    const { taskId, supplies } = req.body;

    // Find the task by ID
    const task = await Task.findById(taskId);

    if (!task) {
      throw new Error("Task not found");
    }

    const event = await Event.findById(task["eventId"]);

    if (!event) {
      throw new Error("Event not found");
    }


    // Create a new supplies item
    const suppliesItem = {
      ...supplies,
    };

    // Push the supplies item to the task's supplies array
    task.supplies.push(suppliesItem);

    
    // Update pendingReimbursement and calculate remainingBudget
    event.pendingReimbursement += suppliesItem.tc;
    event.remainingBudget = event.eventBudget - event.pendingReimbursement;

    // Save the updated event to the database
    await event.save();

    // Save the updated task to the database
    await task.save();



    return res.status(201).json({
      code: 201,
      status: true,
      message: "Task supplies added successfully.",
      result: suppliesItem,
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to add task supplies.",
      error: error.message,
    });
  }
};
