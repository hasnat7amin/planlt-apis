const OTP = require("../../models/OTP");
const Users = require("../../models/Users");
const generateOtp = require("../../utils/generate-otp");
const sendEmail = require("../../utils/send-email");
const sendSms = require("../../utils/send_sms")
const createToken = require("../../utils/create-token");
const sendErrorResponse = require("../../utils/send-error-response");
const bcrypt = require("bcrypt");

module.exports = async (req, res) => {
  try {
    const { email, password, phoneNo } = req.body;

    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(password, salt);

    let user;

    // Check if the user exists by email
    if (email) {
      user = await Users.findOne({ email: email });
    }

    // If the user doesn't exist by email, check by phone number
    if (!user && phoneNo) {
      user = await Users.findOne({ phoneNo: phoneNo });
    }
    
    if (user && user.role === 'admin') {
      throw new Error("This email's admin is already exists. Please try a unique one.");
    }

    else if(user && user.role === 'delegate' && !user.password) {
     
      user = await Users.updateOne({ email: email },{password:newPassword})
    }
    else if(user && user.role === 'delegate' && user.password) {
      throw new Error("This email's delegate is already exists. Please try a unique one."); 
    }
    else{
      user = await Users.create({
        email,
        password:newPassword,
        role:"admin",
      });
    } 
    // let membershipExpiresAt = null;
    // if (membership === "bronze") {
    //   membershipExpiresAt = new Date();
    //   membershipExpiresAt.setMonth(membershipExpiresAt.getMonth() + 1);
    // } else if (membership === "silver") {
    //   membershipExpiresAt = new Date();
    //   membershipExpiresAt.setMonth(membershipExpiresAt.getMonth() + 3);
    // } else if (membership === "gold") {
    //   membershipExpiresAt = new Date();
    //   membershipExpiresAt.setMonth(membershipExpiresAt.getMonth() + 6);
    // }

    
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
        from: process.env.SMPT_MAIL ,
        subject: "Planit OTP",
        message: `Hi! ${user.username}\nYour OTP is: ${tokenOtp}. Thanks for your cooperation.`,
      });
    } 
    
    const token = await createToken(user._id);

    return res.status(201).json({
      code: 201,
      status: true,
      message: "Users created successfully",
      result: {
        user: await Users.findOne({ _id: user._id }).select(
          "-password"
        ),
        token: token,
      },
    });
  } catch (error) {
    sendErrorResponse(
      res,
      200,
      "Failed to create your account.",
      error.message
    );
  }
};
