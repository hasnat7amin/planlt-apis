const OTP = require("../../models/OTP");
const Users = require("../../models/Users");
const generateOtp = require("../../utils/generate-otp");
const sendEmail = require("../../utils/send-email");
const sendSms = require("../../utils/send_sms")
const sendErrorResponse = require("../../utils/send-error-response");
require("dotenv/config");

module.exports = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ email: email });
    if (!user) {
      throw new Error("Don't have any account on that email address.");
    }
    const tokenOtp = await generateOtp();
    const previousToken = await OTP.find({ userId: user._id });
    for (let pt of previousToken) {
      await OTP.deleteOne({ _id: pt._id });
    }
    const Otp = await OTP.create({
      userId: user._id,
      otp: tokenOtp,
    });
    if (user.role === 'delegate' && phoneNo) {
      // If the user is a delegate and has a phone number, send OTP to phoneNo
      await sendSms(phoneNo, `Your OTP is: ${tokenOtp}. Thanks for your cooperation.`);
    } else {
      // Otherwise, send OTP to the email
      await sendEmail({
        email: email,
        from: process.env.SMPT_MAIL,
        subject: "Planit OTP",
        message: `Hi! ${user.username}\nYour OTP is: ${tokenOtp}. Thanks for your cooperation.`,
      });
    }
    return res.status(200).json({
      code: 200,
      status: true,
      message: "Successfully send OTP to the email.",
      result: {
        email: email,
      },
    });
  } catch (error) {
    sendErrorResponse(
      res,
      500,
      "Failed to send code on your email.",
      error.message
    );
  }
};
