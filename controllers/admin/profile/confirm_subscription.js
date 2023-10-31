const stripe = require("stripe")(
  "sk_test_51NoEIuKMt522YDQT5OLtuEkosFDi21H2GFWyqvesHmXYk0jAaLDAVXhwekQeiJdFvTEaOutTgqCujSDVoetOqqub00D8BDg3R1"
);
const Users = require("../../../models/Users");

module.exports = async (req, res) => {
  try {
    const { userId } = req.params;
    const serverUrl = `${req.protocol}://${req.get("host")}`;
    const user = await Users.findById(userId);

    const session = await stripe.checkout.sessions.retrieve(
      user.subscriptionSessionId
    );

    if (session && session.payment_status === "paid") {
      const startDate = new Date();
      await Users.findByIdAndUpdate(userId, {
        subscriptionSessionId: session.id,
        subscriptionCheckoutUrl: null,
        membership: "premium",
        subscriptionStartDate: startDate,
      });
    }
   

    // await Users.findByIdAndUpdate(req.user._id,{
    //     subscriptionSessionId: session.id,
    //     subscriptionCheckoutUrl: session.url
    // })

    return res.status(200).json({
        code: 200,
        status: true,
        result: await Users.findById(userId),
        message: "Subscribed the plan successfully.",
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
