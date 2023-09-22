const express = require("express");
const AdminController = require("../controllers/admin/index")
const admin_authorize = require("../middlewares/admin_authorize");
const upload = require("../middlewares/multer");
const multer = require("multer");
const router = express.Router();


// event
router.post("/event/create", admin_authorize, upload.single("image"), admin_authorize, AdminController.AddEvent);
router.put("/event/:id/add/delegates", admin_authorize, AdminController.AddEventDelegates);
router.put("/event/:id/add/invites", admin_authorize, AdminController.AddEventInvites);
router.put("/event/:id/add/more_info", admin_authorize, AdminController.AddEventMoreInfo);
router.get("/event/get",admin_authorize, AdminController.GetEvents),
router.post("/event/search",admin_authorize, AdminController.SearchEvents)
router.put("/event/update",admin_authorize,upload.single("image"),admin_authorize, AdminController.UpdateEvent)

// event task
router.post("/event/:id/task", admin_authorize, AdminController.AddTask);
router.put("/event/:eventId/task/:taskId", admin_authorize, AdminController.UpdateTask);
router.post("/event/task/:taskId/item/add", admin_authorize, AdminController.AddTaskItem)
router.put("/event/task/:taskId/item/update", admin_authorize, AdminController.UpdateTaskItem)

// profile
router.put("/profile/change-password", admin_authorize, AdminController.ChangePassword)
router.put("/profile/change-information", admin_authorize, AdminController.PersonalInfo)
router.put("/profile/change-image", admin_authorize,upload.single("image"),admin_authorize,AdminController.ChangeImage)
router.get("/profile/create/subscription", admin_authorize,AdminController.CreateSubscrption)
router.get("/:userId/subscriptions/success",AdminController.ConfirmSubscription)

module.exports = router;
