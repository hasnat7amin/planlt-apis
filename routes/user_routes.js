const express = require("express");
const DelegateController = require("../controllers/delegates/index")
const user_authorize = require("../middlewares/user_authorize");
const upload = require("../middlewares/multer");
const multer = require("multer");
const router = express.Router();


// event
router.get("/event/get", user_authorize, DelegateController.GetAllEvents)
router.post("/event/search", user_authorize, DelegateController.SearchEvents)
router.post("/event/add/reimbursment", user_authorize,upload.single("image"),user_authorize,DelegateController.AddEventReimbursement)


// task
router.put("/event/item/update", user_authorize,DelegateController.UpdateItemStatus)


module.exports = router;
