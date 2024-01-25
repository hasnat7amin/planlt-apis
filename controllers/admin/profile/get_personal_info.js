const { isLength } = require("lodash");
const Users = require("../../../models/Users");
const addImage = require("../../../utils/addImage"); // Import your Firebase image upload function
const stripe = require("stripe")(
  "sk_test_51NoEIuKMt522YDQT5OLtuEkosFDi21H2GFWyqvesHmXYk0jAaLDAVXhwekQeiJdFvTEaOutTgqCujSDVoetOqqub00D8BDg3R1"
);

module.exports = async (req, res) => {
  try {

    // Get the user ID from the request, assuming it's in req.params or req.body
    const userId = req.user._id; // Adjust this based on your route configuration

    // Find the user by ID
    const user = await Users.findById(userId);

    if (!user) {
      throw new Error("User not found.")
    }
    let checkoutSession = null;
    let expiresAtString = null;
    let subscription = null;
    let currentPeriodEnd = null;
    let planInterval = null;
    if (user.subscriptionSessionId) {
      checkoutSession = await stripe.checkout.sessions.retrieve(user.subscriptionSessionId);
      if (checkoutSession) {
        const expiresAtTimestamp = checkoutSession.expires_at;
        const expiresAtDate = new Date(expiresAtTimestamp * 1000); // Convert seconds to milliseconds
        expiresAtString = expiresAtDate.toLocaleString();
        const subscriptionId = checkoutSession.subscription;
        if (subscriptionId) {
          subscription = await stripe.subscriptions.retrieve(subscriptionId);
          if (subscription) {
            const currentPeriodEndTimestamp = subscription.current_period_end;
            currentPeriodEnd = new Date(currentPeriodEndTimestamp * 1000).toLocaleString();
            planInterval = subscription.plan?.interval;
          }
        }

      }

    }


    return res.status(200).json({
      code: 200,
      status: true,
      message: "User get successfully.",
      result: { user, currentPeriodEnd, planInterval },
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to get user.",
      error: error.message,
    });
  }
};
