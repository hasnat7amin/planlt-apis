const Users = require("../../models/Users");
const createToken = require("../../utils/create-token");
const sendErrorResponse = require("../../utils/send-error-response")
const bcrypt = require("bcrypt");

module.exports = async (req, res) => {
    try {
        const {userId, password} = req.body;
        const user = await Users.findOne({_id: userId});
        if(!user){
            throw new Error("Users not found.please verify your OTP again.")
        }
        if (password.length<6 ) {
            throw new Error("password length must be greater than 6 digits.");
          }
        const salt = await bcrypt.genSalt(10);
        const newPassword = await bcrypt.hash(password, salt);
        user.password = newPassword;
        await user.save();
        const token = await createToken(user._id)
        return res.status(200).json({
            code : 200,
            status: true,
            message: "Users password changed successfully",
            result: {
                user: await Users.findOne({_id: user._id}).select("-password "),
                token: token
            }
        })

    } catch (error) {
        sendErrorResponse(res,200,"Failed to create your account." , error.message)
    }
}