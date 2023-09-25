module.exports = {
    GetEventGuestInvitation: require("./getEventGuestInvitation"),
    PostEventGuestInvitation: require("./postEventGestInvitation"),
    GetEventGuestPayment : require("./getEventGuestPayment"),

    GetEventGuestPayStripeCheckout: require("./eventGuestPayStripeCheckout"),
    GetEventGuestPayStripeConfirm: require("./eventGuestPayStripeConfirm"),
}