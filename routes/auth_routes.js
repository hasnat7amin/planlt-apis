const express = require("express");
const login = require("../controllers/auth/login");
const signup = require("../controllers/auth/signup");
const getCode = require("../controllers/auth/get-code");
const verifyCode = require("../controllers/auth/verify-code");
const resetPassword = require("../controllers/auth/reset-password");
const router = express.Router();

router.post("/login", login);
router.post("/register", signup );
router.post("/get-otp", getCode);
router.post("/verify-otp", verifyCode);
router.post("/reset-password", resetPassword);


module.exports = router;