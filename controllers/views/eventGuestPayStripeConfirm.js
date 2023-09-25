const stripe = require("stripe")(
    "sk_test_51NoEIuKMt522YDQT5OLtuEkosFDi21H2GFWyqvesHmXYk0jAaLDAVXhwekQeiJdFvTEaOutTgqCujSDVoetOqqub00D8BDg3R1"
  );
  const Event = require('../../models/Event'); 
  const EventGuest = require("../../models/EventGuest")
  
  module.exports = async (req, res) => {
    try {
      const { guestId } = req.params;
      const serverUrl = `${req.protocol}://${req.get("host")}`;
      const user = await EventGuest.findById(guestId);

      if(!user || !user.paymentId){
        return res.render("404",{errorDescription:"User Not Found OR Payment Id don't exist"})
      }
  
      const session = await stripe.checkout.sessions.retrieve(
        user.paymentId
      );
      
      if(!session){
        return res.render("404",{errorDescription:"Didn't CheckOut For Payment"})
      }

      if (session.payment_status === "paid") {
        await EventGuest.findByIdAndUpdate(guestId, {
            paymentStatus:"paid"
        });
        return res.render("eventTicketSuccess")
      }
     else{
        return res.render("eventTicketCancel",{link:session.url})
     }
  
      
    } catch (error) {
        return res.render("404",{errorDescription:"Internal Server Error"})
    }
  };
  