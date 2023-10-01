const Users = require("../../../models/Users");
const addImage = require("../../../utils/addImage"); // Import your Firebase image upload function

module.exports = async (req, res) => {
  try {
    
    // Get the user ID from the request, assuming it's in req.params or req.body
    const userId = req.user._id; // Adjust this based on your route configuration

    // Find the user by ID
    const user = await Users.findById(userId);

    if (!user) {
      throw new Error("User not found.")
    }

    return res.status(200).json({
      code: 200,
      status: true,
      message: "User get successfully.",
      result: user,
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to get user.",
      error: error.message,
    });
  }
};
