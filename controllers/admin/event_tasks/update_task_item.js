const Task = require("../../../models/Task");
const Users = require("../../../models/Users"); // Import your Users model
const sendEmail = require("../../../utils/send-email"); // Import your send-email utility
const sendSms = require("../../../utils/send_sms"); // Import your send-sms utility


module.exports = async (req, res) => {
    try {
      const { taskId, itemId } = req.params;
      const updateData = req.body;
      
      // Find the task by ID
      const task = await Task.findById(taskId);
  
      if (!task) {
        throw new Error(`Task not found.`);
      }
      let found = false;
      // Find the task item within the task
      const taskItem = task.items.map((item)=>
      {
        if(item._id==itemId){
          found = true;
          Object.keys(req.body).map((key,index)=> {
            console.log(key,index)
            item[key] = req.body[key];
          });
        }
      });
  
      if (!found) {
        throw new Error(`Task item not found.`);
      }
  
    
      // Save the updated task to the database
      await task.save();
  
      // Send notifications to assigned delegates via email and SMS
      for (const delegateId of task.assignedDelegates) {
        const delegate = await Users.findById(delegateId);
  
        if (delegate.email) {
          // Send email notification
          await sendEmail({
           email: delegate.email,
            subject:"Task Item Updated",
            message:`Task item "${taskItem.itemName}" for the task "${task.taskName}" has been updated.`
        });
        }
  
        if (delegate.phoneNo) {
          // Send SMS notification
          const smsMessage = `Task item "${taskItem.itemName}" for the task "${task.taskName}" has been updated.`;
          await sendSms(delegate.phoneNo, smsMessage);
        }
      }
  
      return res.status(200).json({
        code: 200,
        status: true,
        message: "Task item updated successfully.",
        result: await Task.findById(taskId),
      });
    } catch (error) {
      return res.status(200).json({
        code: 200,
        status: false,
        message: "Failed to update the task item.",
        error: error.message,
      });
    }
  };
  