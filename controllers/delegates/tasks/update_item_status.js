const Task = require("../../../models/Task");

module.exports = async (req, res) => {
  try {
    const { taskId, itemId, status } = req.body;

    // Find the task by ID
    const task = await Task.findById(taskId);

    if (!task) {
      throw new Error("Task not found");
    }

    // Find the task item by ID
    const taskItem = task.items.id(itemId);

    if (!taskItem) {
      throw new Error("Task item not found");
    }

    // Update the status of the task item
    taskItem.status = status;

    // Save the updated task to the database
    await task.save();

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Task item status updated successfully.",
      result: taskItem,
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to update task item status.",
      error: error.message,
    });
  }
};
