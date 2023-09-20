const Users = require("../../../models/Users");

module.exports = async (req, res) => {
  try {
    // Get the user ID from the request, assuming it's in req.params or req.body
    const userId = req.user._id; // Adjust this based on your route configuration

    // Find the user by ID
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({
        code: 404,
        status: false,
        message: "Users not found.",
      });
    }

    // Update the user's properties with the provided data
    if (req.body.username) {
      user.username = req.body.username;
    }

    if (req.body.phoneNo) {
      user.phoneNo = req.body.phoneNo;
    }

    if (req.body.email) {
      user.email = req.body.email;
      user.isVerified = false;
    }

    if (req.body.bio) {
      user.bio = req.body.bio;
    }

    // Save the updated user
    await user.save();

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Users information updated successfully.",
      result: user,
    });
  } catch (error) {
    return res.status(400).json({
      code: 400,
      status: false,
      message: "Failed to update user information.",
      error: error.message,
    });
  }
};
