const express = require("express");
const AdminController = require("../controllers/admin/index")
const admin_authorize = require("../middlewares/admin_authorize");
const upload = require("../middlewares/multer");
const multer = require("multer");
const router = express.Router();


// profile
router.put("/profile/change-password", admin_authorize, AdminController.ChangePassword)
router.put("/profile/change-information", admin_authorize, AdminController.PersonalInfo)
router.put("/profile/change-image", admin_authorize,upload.single("image"),admin_authorize,AdminController.ChangeImage)


module.exports = router;
