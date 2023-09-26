const paypal = require("paypal-rest-sdk"); // Make sure to install the 'paypal-rest-sdk' package
const Event = require("../../models/Event");
const EventGuest = require("../../models/EventGuest");

paypal.configure({
  mode: "sandbox", // Change to 'live' for production
  client_id:
    "AZsF8qBgAY7yLySfYciIJ073vE1ckLWVkqnNqSFr8qez49LVizrcaGrf-J9_YZxYtu4QSGRC1vfVl6a6",
  client_secret:
    "EESXt6fxEtG5m3RipjHYXh9l-ZnWqBvS5e8ZHVmuxbCD5BABE-C8iycVW6mVDzimKH766FzDl_O892f8",
});

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

    if (guest.paymentStatus === "paid" && guest.paymentMethod === "paypal") {
      // Retrieve the payment details from PayPal
      paypal.payment.get(guest.paymentId, async (error, payment) => {
        if (error) {
          console.error("Error getting PayPal payment details:", error);
          return res.status(400).json({ error: "Internal Server Error" });
        }

        if (payment.state === "approved") {
          event.invitations.map((invitation) => {
            if (invitation._id == invitationId) {
              invitation.paymentStatus = "paid";
              invitation.paymentMethod = "paypal";
            }
          });

          await event.save();

          return res.status(200).json({
            code: 200,
            status: true,
            message: "Invitation Event checkout successfully.",
            result: {
              redirect: `${serverUrl}/v1/event/${eventId}/phoneNo/${invitationId}/payment/paypal/success`,
            },
          });
        } else {
          return res.status(400).json({ error: "Payment not approved" });
        }
      });
    }

    // Create a PayPal payment session
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${serverUrl}/v1/event/${eventId}/phoneNo/${invitationId}/payment/paypal/success`,
        cancel_url: `${serverUrl}/v1/event/${eventId}/phoneNo/${invitationId}/payment/paypal/cancel`,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: event.name,
                sku: "item",
                price: event.price,
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: event.price,
          },
          description: `Event Ticket for ${event.name}`,
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, payment) => {
      if (error) {
        console.error("Error creating PayPal payment session:", error);
        return res.status(400).json({ error: "Internal Server Error" });
      } else {
        event.invitations.map((invitation) => {
          if (invitation._id == invitationId) {
            invitation.paymentId = payment.id;
            invitation.paymentStatus = "pending";
            invitation.paymentMethod = "paypal";
          }
        });

        await event.save();

        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            return res.status(200).json({
              code: 200,
              status: true,
              message: "Guest Event checkout successfully.",
              result: { redirect: payment.links[i].href },
            });
          }
        }
      }
    });
  } catch (error) {
    console.error("Error creating PayPal checkout session:", error);
    res.status(400).json({ error: "Internal Server Error" });
  }
};
