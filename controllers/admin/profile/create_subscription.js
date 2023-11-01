const stripe = require("stripe")(
  "sk_test_51NoEIuKMt522YDQT5OLtuEkosFDi21H2GFWyqvesHmXYk0jAaLDAVXhwekQeiJdFvTEaOutTgqCujSDVoetOqqub00D8BDg3R1"
);
const Users = require("../../../models/Users");

module.exports = async (req, res) => {
  try {
    const serverUrl = `${req.protocol}://${req.get("host")}`;

    const user = await Users.findById(req.user._id);

    if (user.membership=="none"|| !user.subscriptionSessionId) {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: "price_1NsTZtKMt522YDQT8ncljhhy",
            quantity: 1,
          },
        ],
        success_url: `${serverUrl}/api/admin/${req.user._id}/subscriptions/success`,
        //   cancel_url: 'http://localhost:5173/cancel',
      });

      await Users.findByIdAndUpdate(req.user._id, {
        subscriptionSessionId: session.id,
        subscriptionCheckoutUrl: session.url,
      });
    }

    return res.status(200).json({
      code: 200,
      status: true,
      result: await Users.findById(req.user._id),
      message: "You Subscribed the plan successfully.",
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed for creating subscription",
      error: error.message,
    });
  }
};
