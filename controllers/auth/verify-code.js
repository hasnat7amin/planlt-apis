const OTP = require("../../models/OTP");
const Users = require("../../models/Users");
const sendErrorResponse = require("../../utils/send-error-response")
const createToken = require("../../utils/create-token");


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
        const token = await createToken(user._id);
        return res.status(200).json({
            code : 200,
            status: true,
            message: "Successfully verified OTP.",
            result: {
                userId: Otp.userId,
                user: user,
                token:token

            }
        })

        
    } catch (error) {
        sendErrorResponse(res,200,"Failed to create your account." , error.message)
    }
}