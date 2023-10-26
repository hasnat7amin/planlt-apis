const Users = require("../../../models/Users");

module.exports = async (req, res) => {
  try {
    // Get the FCM token from the request body or query params
    const fcmToken = req.body.fcmToken;

    // Get the user ID from the request, assuming it's in req.params or req.body
    const userId = req.user._id; // Adjust this based on your route configuration

    // Find the user by ID
    const user = await Users.findById(userId);

    if (!user) {
      throw new Error("User not found.");
    }

    // Update the user's fcmToken field
    user.fcmToken = fcmToken;

    // Save the updated user
    await user.save();

    return res.status(200).json({
      code: 200,
      status: true,
      message: "FCM token added to user successfully.",
      result: user,
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to add FCM token to user.",
      error: error.message,
    });
  }
};
