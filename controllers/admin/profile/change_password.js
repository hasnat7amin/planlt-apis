const Users = require("../../../models/Users.js");
const bcrypt = require("bcrypt");

module.exports = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id; // Assuming you have access to the authenticated user's ID

    // Find the user by ID
    const user = await Users.findById(userId);

    if (!user) {
      throw new Error("user not found");
    }

    // Verify the old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new Error("Your old password is incorrect.");
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword ) {
      throw new Error("New password and confirm password do not match.");
    }
    if (newPassword.length<6 ) {
      throw new Error("password length must be greater than 6 digits.");
    }

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);
    

    // Hash the new password (this will automatically use the pre-save middleware)
    user.password = newHashedPassword;

    // Save the updated user to the database
    await user.save();

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to change the password.",
      error: error.message,
    });
  }
};
