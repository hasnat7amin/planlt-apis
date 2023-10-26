const Users = require("../../../models/Users");
const addImage = require("../../../utils/addImage"); // Import your Firebase image upload function

module.exports = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      throw new Error("No image upload.");
    }

    // Upload the image to Firebase Storage
    const firebaseImageUrl = await addImage(req.file);

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Document added successfully.",
      result: firebaseImageUrl
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to add  image.",
      error: error.message
    });
  }
};
