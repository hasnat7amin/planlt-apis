const express = require("express");
const router = express.Router();
const ViewsController = require('../controllers/views/index'); 

// event guest invitations
router.get("/event/:id/guest/invitation", ViewsController.GetEventGuestInvitation);
router.post("/event/:id/guest/invitation", ViewsController.PostEventGuestInvitation);

router.get("/event/:eventId/guest/:guestId/payment", ViewsController.GetEventGuestPayment)

router.post("/event/:eventId/guest/:guestId/payment/stripe",ViewsController.GetEventGuestPayStripeCheckout)
router.get("/event/:eventId/guest/:guestId/payment/stripe/success",ViewsController.GetEventGuestPayStripeConfirm);
router.get("/event/:eventId/guest/:guestId/payment/stripe/cancel",ViewsController.GetEventGuestPayStripeConfirm);


module.exports = router;
