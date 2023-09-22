const Users = require("../../models/Users");
const createToken = require("../../utils/create-token");
const sendErrorResponse = require("../../utils/send-error-response");

module.exports = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.login(email.trim(), password.trim());
    const token = await createToken(user._id);
    // const today = new Date();
    // let isMember = "user";
    // if (user.role == "admin") {
    //   isMember = "admin";
    // } else if (user.membership !== "none" && user.membershipExpiresAt > today) {
    //   isMember = "member";
    // }
    if(!user.isVerified){
      throw new Error("Your email is not verified");
    }

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Users successfully logged in.",
      result: {
        user: await Users.findOne({ _id: user._id }).select("-password"),
        token: token,
      },
    });
  } catch (error) {
    sendErrorResponse(
      res,
      500,
      "Failed to login with your credentials.",
      error.message
    );
  }
};
