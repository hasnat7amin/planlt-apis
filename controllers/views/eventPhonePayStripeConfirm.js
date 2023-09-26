const stripe = require("stripe")(
  "sk_test_51NoEIuKMt522YDQT5OLtuEkosFDi21H2GFWyqvesHmXYk0jAaLDAVXhwekQeiJdFvTEaOutTgqCujSDVoetOqqub00D8BDg3R1"
);
const Event = require("../../models/Event");
const EventGuest = require("../../models/EventGuest");

module.exports = async (req, res) => {
  try {
    const { eventId, invitationId } = req.params;
    const serverUrl = `${req.protocol}://${req.get("host")}`;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.render("404", { errorDescription: "Event not found" });
    }

    const user = event.invitations.find(
      (inv) => inv._id.toString() === invitationId
    );

    if (!user || !user.paymentId) {
      return res.render("404", {
        errorDescription: "User Not Found OR Payment Id don't exist",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(user.paymentId);

    if (!session) {
      return res.render("404", {
        errorDescription: "Didn't CheckOut For Payment",
      });
    }

    if (session.payment_status === "paid") {
      event.stats.going = event.stats.going + 1;
      event.stats.waiting = event.stats.waiting - 1;
      event.invitations.map((invitation) => {
        if (invitation._id == invitationId) {
          invitation.paymentId = session.id;
          invitation.paymentStatus = "paid";
          invitation.paymentMethod = "stripe";
          invitation.isGoing = true;
        }
      });

      await event.save();
      return res.render("eventTicketSuccess");
    } else {
      return res.render("eventTicketCancel", { link: session.url });
    }
  } catch (error) {
    return res.render("404", { errorDescription: "Internal Server Error" });
  }
};
