const OTP = require("../../models/OTP");
const Users = require("../../models/Users");
const sendErrorResponse = require("../../utils/send-error-response")

module.exports = async (req, res) => {
    try {
        const {otp} = req.body;
        const Otp = await OTP.findOne({otp: otp});
        if(!Otp){
            throw new Error("OTP not found.Check your email address.")
        }
        let user = await Users.findById(Otp.userId);
        user.isVerified = true;
        await user.save();
        return res.status(200).json({
            code : 200,
            status: true,
            message: "Successfully verified OTP.",
            result: {
                userId: Otp.userId,
            }
        })

        
    } catch (error) {
        sendErrorResponse(res,400,"Failed to create your account." , error.message)
    }
}