const stripe = require("stripe")(
    "sk_test_51NoEIuKMt522YDQT5OLtuEkosFDi21H2GFWyqvesHmXYk0jAaLDAVXhwekQeiJdFvTEaOutTgqCujSDVoetOqqub00D8BDg3R1"
  );
const Users = require("../../../models/Users");

module.exports = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Users.findById(userId);

    // Check if the user has an active subscription
    if (!user.subscriptionSessionId) {
      return res.status(200).json({
        code: 200,
        status: false,
        message: "User does not have an active subscription.",
      });
    }

    // Use the Stripe API to cancel the user's subscription
    await stripe.subscriptions.update(user.subscriptionSessionId, {
      cancel_at_period_end: true,
    });

    // Update the user's information in your database to reflect the cancellation
    await Users.findByIdAndUpdate(userId, {
      subscriptionSessionId: null,
      subscriptionCheckoutUrl: null,
      membership: "none", // Update the membership status to free or another appropriate value
    });

    return res.status(200).json({
      code: 200,
      status: true,
      result: await Users.findById(userId),
      message: "Subscription cancellation scheduled at the end of the billing period.",
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to cancel subscription",
      error: error.message,
    });
  }
};
