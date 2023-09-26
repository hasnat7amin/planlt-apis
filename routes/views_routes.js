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

router.post("/event/:eventId/guest/:guestId/payment/paypal",ViewsController.EventGuestPayPalCheckout)
router.get("/event/:eventId/guest/:guestId/payment/paypal/success",ViewsController.EventGuestPayPalConfirm);
router.get("/event/:eventId/guest/:guestId/payment/paypal/cancel",ViewsController.EventGuestPayPalConfirm);

router.get("/event/:eventId/phoneNo/invitation/:invitationId",ViewsController.GetEventPhoneInvitation)

router.post('/event/:eventId/phoneNo/invitation/:invitationId/free',ViewsController.EventPhoneFreePayment)

router.post("/event/:eventId/phoneNo/:invitationId/payment/stripe",ViewsController.EventPhonePayStripeCheckout)
router.get("/event/:eventId/phoneNo/:invitationId/payment/stripe/success",ViewsController.EventPhonePayStripeConfirm);
router.get("/event/:eventId/phoneNo/:invitationId/payment/stripe/cancel",ViewsController.EventPhonePayStripeConfirm);

router.post("/event/:eventId/phoneNo/:invitationId/payment/paypal",ViewsController.EventPhonePayPalCheckout)
router.get("/event/:eventId/phoneNo/:invitationId/payment/paypal/success",ViewsController.EventPhonePayPalConfirm);
router.get("/event/:eventId/phoneNo/:invitationId/payment/paypal/cancel",ViewsController.EventPhonePayPalConfirm);




module.exports = router;
