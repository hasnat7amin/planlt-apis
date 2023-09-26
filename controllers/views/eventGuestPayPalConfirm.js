const paypal = require("paypal-rest-sdk"); // Make sure to install the 'paypal-rest-sdk' package
const EventGuest = require("../../models/EventGuest");

paypal.configure({
    mode: "sandbox", // Change to 'live' for production
    client_id:
      "AZsF8qBgAY7yLySfYciIJ073vE1ckLWVkqnNqSFr8qez49LVizrcaGrf-J9_YZxYtu4QSGRC1vfVl6a6",
    client_secret:
      "EESXt6fxEtG5m3RipjHYXh9l-ZnWqBvS5e8ZHVmuxbCD5BABE-C8iycVW6mVDzimKH766FzDl_O892f8",
  });

module.exports = async (req, res) => {
  try {
    const { guestId } = req.params;
    const serverUrl = `${req.protocol}://${req.get("host")}`;
    const user = await EventGuest.findById(guestId);

    if (!user || !user.paymentId) {
      return res.render("404", { errorDescription: "User Not Found OR Payment Id doesn't exist" });
    }

    // Retrieve the payment details from PayPal
    paypal.payment.get(user.paymentId, async (error, payment) => {
      if (error) {
        console.error("Error getting PayPal payment details:", error);
        return res.render("404", { errorDescription: "Internal Server Error" });
      }

      if (payment.state === "approved") {
        await EventGuest.findByIdAndUpdate(guestId, { paymentStatus: "paid" });
        return res.render("eventTicketSuccess");
      } else {
        return res.render("eventTicketCancel", { link: payment.links[0].href });
      }
    });
  } catch (error) {
    return res.render("404", { errorDescription: "Internal Server Error" });
  }
};
