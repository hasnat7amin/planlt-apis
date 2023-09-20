const express = require("express");
const router = express.Router();
const admin_authorize = require("../middlewares/admin_authorize");
const auth = require("./auth_routes");
const admin = require("./admin_routes");
const delegates = require("./user_routes")

router.use("/auth",auth);
router.use("/admin",admin)
router.use("/delegates",delegates);
 


module.exports = router;