const Users = require("../../models/Users");
const createToken = require("../../utils/create-token");
const sendErrorResponse = require("../../utils/send-error-response")

module.exports = async (req, res) => {
    try {
        const {userId, password} = req.body;
        const user = await Users.findOne({_id: userId});
        if(!user){
            throw new Error("Users not found.please verify your OTP again.")
        }
        user.password = password;
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