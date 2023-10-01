const JWT = require("jsonwebtoken");
const Users = require("../models/Users");
const sendErrorResponse = require("../utils/send-error-response");
require("dotenv").config();

module.exports = async (req, res, next) => {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader === "undefined") {
    return res.status(401).send("user not authorized");
  }

  const token = bearerHeader.split(" ")[1];

  try {
    await JWT.verify(
      token,
      process.env.TOKEN_KEY,
      async (err, decodedToken) => {
        if (err) {
          return res.status(200).json({
            code: 200,
            success: false,
            message: "Failed to verify token.",
            result: { err },
          });
        } else {
          let user = await Users.findById(decodedToken.id);
          if (!user) {
            return res.status(200).json({
              code: 200,
              success: false,
              message: "Failed to get the user.",
              result: { err },
            });
          }

          req.user = user;
          next();
        }
      }
    ).catch((err) => {
      throw new Error(err.message);
    });
  } catch (err) {
    sendErrorResponse(res, 400, "Failed to verify Token.", err.message);
  }
};
