const express = require("express");
const AdminController = require("../controllers/admin/index")
const admin_authorize = require("../middlewares/admin_authorize");
const upload = require("../middlewares/multer");
const multer = require("multer");
const authorize = require("../middlewares/authorize");
const router = express.Router();


router.put("/change-password", authorize, AdminController.ChangePassword)
router.put("/change-information", authorize, AdminController.PersonalInfo)
router.put("/change-image", authorize,upload.single("image"),authorize,AdminController.ChangeImage)
router.get("/create/subscription", authorize,AdminController.CreateSubscrption)
router.get("/:userId/subscriptions/success",AdminController.ConfirmSubscription)
router.get('/user-info',authorize, AdminController.GetPersonalInfo)

module.exports = router;
