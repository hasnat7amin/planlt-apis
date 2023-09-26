module.exports = {
    GetEventGuestInvitation: require("./getEventGuestInvitation"),
    PostEventGuestInvitation: require("./postEventGestInvitation"),
    GetEventGuestPayment : require("./getEventGuestPayment"),

    GetEventGuestPayStripeCheckout: require("./eventGuestPayStripeCheckout"),
    GetEventGuestPayStripeConfirm: require("./eventGuestPayStripeConfirm"),

    EventGuestPayPalCheckout: require("./eventGuestPayPalCheckout"),	
    EventGuestPayPalConfirm: require("./eventGuestPayPalConfirm"),


    GetEventPhoneInvitation: require("./getEventPhoneInvitation"),
    EventPhonePayStripeCheckout: require("./eventPhonePayStripeCheckout"),
    EventPhonePayStripeConfirm: require("./eventPhonePayStripeConfirm"),

    EventPhonePayPalCheckout: require("./eventPhonePayPalCheckout"),
    EventPhonePayPalConfirm: require("./eventPhonePayPalConfirm"),

    EventPhoneFreePayment: require("./eventPhoneFreePayment"),

}