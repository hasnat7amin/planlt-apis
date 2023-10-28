  const mongoose = require("mongoose");

  const TaskSchema = new mongoose.Schema({
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event", // Reference to the Event model to associate the task with an event
      required: true,
    },
    taskName: {
      type: String,
      required: [true, "Enter task name"],
    },
    status: {
      type: String,
      enum: ["pending", "complete"],
      default: "pending",
    },
    assignedDelegates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model for the assigned delegate
      },
    ],
    dueDate: {
      type: String,
      required: true,
    },
    dueTime: {
      type: String,
      required: true,
    },
    items: [
      {
        itemName: String,
        itemsMeasureName: String,
        itemsMeasureQuantity: String,
        quantityNumber: Number,
        quantitySize: String,
        status: {
          type: String,
          enum: ["pending", "complete"],
          default: "pending",
        },
        time: String,
      },
    ],  
    supplies:[
      {
        itemName: String,
        quantityNumber: Number,
        quantitySize: String,
        uc: Number,
        tc: Number,
        notes: String,
      },
    ],
  });

  const Task = mongoose.model("Task", TaskSchema);

  module.exports = Task;
