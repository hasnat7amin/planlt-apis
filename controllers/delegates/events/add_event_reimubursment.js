const Event = require("../../../models/Event");
const addImage = require("../../../utils/addImage"); // Import your image utility function

module.exports = async (req, res) => {
  try {
    const { eventId, itemName, quantityNumber, quantitySize, uc, tc, notes,amount } = req.body;

    // Find the event by ID
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    // Upload the image and get the image URL
    let receipt;
    if (req.file) {
      receipt = await addImage(req.file);
    }

    // Create a new reimbursement entry
    const newReimbursement = {
      itemName,
      delegate: req.user._id,
      amount,
      quantityNumber,
      quantitySize,
      uc,
      tc,
      notes,
      receipt, // URL or path to the image receipt
      status: "pending", // Default status
    };

    // Push the new reimbursement to the event's reimbursement array
    event.reimbursement.push(newReimbursement);

    // Save the updated event to the database
    await event.save();

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Event reimbursement added successfully.",
      result: newReimbursement,
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to add event reimbursement.",
      error: error.message,
    });
  }
};
