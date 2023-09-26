const Event = require("../../models/Event");
const EventGuest = require("../../models/EventGuest");
const paypal = require("paypal-rest-sdk");
paypal.configure({
  mode: "sandbox", // Change to 'live' for production
  client_id:
    "AZsF8qBgAY7yLySfYciIJ073vE1ckLWVkqnNqSFr8qez49LVizrcaGrf-J9_YZxYtu4QSGRC1vfVl6a6",
  client_secret:
    "EESXt6fxEtG5m3RipjHYXh9l-ZnWqBvS5e8ZHVmuxbCD5BABE-C8iycVW6mVDzimKH766FzDl_O892f8",
});

module.exports = async (req, res) => {
  const { eventId, guestId } = req.params;
  const serverUrl = `${req.protocol}://${req.get("host")}`;
  try {
    // Fetch the event based on the provided ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const guest = await EventGuest.findById(guestId);
    if (!guest) {
      return res.status(404).json({ error: "Event Guest not found" });
    }

    // Build PayPal payment object
    const createPaypalPayment = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${serverUrl}/v1/event/${eventId}/guest/${guestId}/payment/paypal/success`,
        cancel_url: `${serverUrl}/v1/event/${eventId}/guest/${guestId}/payment/paypal/cancel`,
      },
      transactions: [
        {
          amount: {
            total: event.price,
            currency: "USD",
          },
          description: `Event Ticket for ${event.name}`,
        },
      ],
    };

    // Create a PayPal payment
    paypal.payment.create(createPaypalPayment, (error, payment) => {
      if (error) {
        console.error("Error creating PayPal payment:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      } else {
        const redirectUrl = payment.links.find(
          (link) => link.rel === "approval_url"
        ).href;
        return res.status(200).json({
          code: 200,
          status: true,
          message: "Guest Event checkout successfully.",
          result: { redirect: redirectUrl },
        });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
