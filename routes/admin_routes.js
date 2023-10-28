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
router.get("/event/get/:eventId", admin_authorize, AdminController.GetEventById);
router.post("/event/search",admin_authorize, admin_authorize)
router.put("/event/update",admin_authorize,upload.single("image"),admin_authorize, AdminController.UpdateEvent)
router.delete("/event/:id", admin_authorize, AdminController.DeleteEventById)

// event suppliers
router.post("/event/suppliers/add",admin_authorize,	AdminController.AddSupplies);
router.post("/event/suppliers/pay",admin_authorize,	AdminController.PayToSupplier);


// event task
router.post("/event/:id/task", admin_authorize, AdminController.AddTask);
router.get("/event/:eventId/tasks", admin_authorize, AdminController.GetEventTasks);
router.put("/event/:eventId/task/:taskId", admin_authorize, AdminController.UpdateTask);
router.post("/event/task/:taskId/item/add", admin_authorize, AdminController.AddTaskItem)
router.put("/event/task/:taskId/item/:itemId/update", admin_authorize, AdminController.UpdateTaskItem)

router.post("/event/add/supplies",admin_authorize, AdminController.AddSupplies);
    
// profile
router.put("/profile/change-password", admin_authorize, AdminController.ChangePassword)
router.put("/profile/change-information", admin_authorize, AdminController.PersonalInfo)
router.put("/profile/change-image", admin_authorize,upload.single("image"),admin_authorize,AdminController.ChangeImage)
router.get("/profile/create/subscription", admin_authorize,AdminController.CreateSubscrption)
router.get("/:userId/subscriptions/success",AdminController.ConfirmSubscription)
router.get('/profile/user-info',admin_authorize, AdminController.GetPersonalInfo)

module.exports = router;
