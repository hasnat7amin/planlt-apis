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
router.get("/create/subscription/:type", authorize,AdminController.CreateSubscrption)
router.get("/:userId/subscriptions/success",AdminController.ConfirmSubscription)
router.get("/cancel/subscription", admin_authorize,AdminController.CancelSubscription)
router.get('/user-info',authorize, AdminController.GetPersonalInfo)


router.post("/upload", authorize,upload.single("image"),authorize,AdminController.UploadDocument)


router.post("/fcm-token",authorize,AdminController.FcmToken)
  

module.exports = router; 
