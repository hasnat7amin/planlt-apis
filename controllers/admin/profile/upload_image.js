const Users = require("../../../models/Users");
const addImage = require("../../../utils/addImage"); // Import your Firebase image upload function

module.exports = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      throw new Error("No image upload.")
    }

    // Get the user ID from the request, assuming it's in req.params or req.body
    const userId = req.user._id; // Adjust this based on your route configuration

    // Find the user by ID
    const user = await Users.findById(userId);

    if (!user) {
      throw new Error("User not found.")
    }

    // Upload the image to Firebase Storage
    const firebaseImageUrl = await addImage(req.file);

    // Update the user's image field with the Firebase image URL
    user.image = firebaseImageUrl;

    // Save the updated user
    await user.save();

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Users image added successfully.",
      result: user,
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to add user image.",
      error: error.message,
    });
  }
};
