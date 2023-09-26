const Event = require("../../models/Event");
const EventGuest = require("../../models/EventGuest");
const stripe = require("stripe")(
  "sk_test_51NoEIuKMt522YDQT5OLtuEkosFDi21H2GFWyqvesHmXYk0jAaLDAVXhwekQeiJdFvTEaOutTgqCujSDVoetOqqub00D8BDg3R1"
);
const paypal = require("paypal-rest-sdk"); // Make sure to install the 'paypal-rest-sdk' package

paypal.configure({
  mode: "sandbox", // Change to 'live' for production
  client_id:
    "AZsF8qBgAY7yLySfYciIJ073vE1ckLWVkqnNqSFr8qez49LVizrcaGrf-J9_YZxYtu4QSGRC1vfVl6a6",
  client_secret:
    "EESXt6fxEtG5m3RipjHYXh9l-ZnWqBvS5e8ZHVmuxbCD5BABE-C8iycVW6mVDzimKH766FzDl_O892f8",
});
module.exports = async (req, res) => {
  const eventId = req.params.eventId;
  const guestId = req.params.guestId;

  try {
    // Fetch the event based on the provided ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.render("404", { errorDescription: "Event not found" });
    }

    // Fetch the guest based on the provided guestId
    const guest = await EventGuest.findById(guestId);

    if (!guest) {
      return res.render("404", { errorDescription: "Guest not found" });
    }
    if (event.price > 0) {
      if (guest.paymentStatus === "paid" && guest.paymentMethod === "stripe") {
        const session = await stripe.checkout.sessions.retrieve(
          guest.paymentId
        );

        if (session.payment_status === "paid") {
          await EventGuest.findByIdAndUpdate(guestId, {
            paymentStatus: "paid",
          });
          return res.render("eventTicketSuccess");
        }
      }
      if (guest.paymentStatus === "paid" && guest.paymentMethod === "paypal") {
        paypal.payment.get(guest.paymentId, async (error, payment) => {
          if (payment.state === "approved") {
            await EventGuest.findByIdAndUpdate(guestId, {
              paymentStatus: "paid",
            });
            return res.render("eventTicketSuccess");
          }
        });
      }
    } else {
      res.render("eventTicketSuccess");
    }

    // Render the payment page with event and guest details
    res.render("eventGuestPayment", { event, guest }); // Assuming you have a view named 'paymentPage.ejs'
  } catch (error) {
    console.error("Error rendering payment page:", error);
    return res.render("404", { errorDescription: "Internal Server Error" });
  }
};
