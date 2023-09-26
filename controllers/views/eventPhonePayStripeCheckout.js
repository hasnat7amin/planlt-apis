const stripe = require("stripe")(
  "sk_test_51NoEIuKMt522YDQT5OLtuEkosFDi21H2GFWyqvesHmXYk0jAaLDAVXhwekQeiJdFvTEaOutTgqCujSDVoetOqqub00D8BDg3R1"
);
const Event = require("../../models/Event");
const EventGuest = require("../../models/EventGuest");

module.exports = async (req, res) => {
  const { eventId, invitationId } = req.params;
  const serverUrl = `${req.protocol}://${req.get("host")}`;
  try {
    // Fetch the event based on the provided ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const guest = event.invitations.find(
      (inv) => inv._id.toString() === invitationId
    );

    if (guest.paymentStatus === "paid" && guest.paymentMethod === "stripe") {
      const session = await stripe.checkout.sessions.retrieve(guest.paymentId);

      if (session.payment_status === "paid") {
        event.invitations.map((invitation) => {
          if (invitation._id == invitationId) {
            invitation.paymentId = session.id;
            invitation.paymentStatus = "paid";
            invitation.paymentMethod = "stripe";
          }
        });

        await event.save();

        return res.status(200).json({
          code: 200,
          status: true,
          message: "Invitation Event checkout successfully.",
          result: {
            redirect: `${serverUrl}/v1/event/${eventId}/phoneNo/${invitationId}/payment/stripe/success`,
          },
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: event.name,
              description: "Event Ticket",
              images: [event.image],
            },
            unit_amount: event.price * 100, // Amount in cents
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        description: `Event Ticket for ${event.name}`,
      },

      success_url: `${serverUrl}/v1/event/${eventId}/phoneNo/${invitationId}/payment/stripe/success`, // Replace with your success URL
      cancel_url: `${serverUrl}/v1/event/${eventId}/phoneNo/${invitationId}/payment/stripe/cancel`, // Replace with your cancel URL
    });

    console.log(session);

    event.invitations.map((invitation) => {
      if (invitation._id == invitationId) {
        invitation.paymentId = session.id;
        invitation.paymentStatus = "pending";
        invitation.paymentMethod = "stripe";
      }
    });

    await event.save();

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Guest Event checkout successfully.",
      result: { redirect: session.url },
    });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    res.status(400).json({ error: "Internal Server Error" });
  }
};
