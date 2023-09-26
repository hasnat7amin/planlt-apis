const Event = require('../../models/Event');

module.exports = async (req, res) => {
    const { eventId, invitationId } = req.params;
  
    try {
      // Fetch event and invitation data based on IDs
      const event = await Event.findById(eventId);
      const invitation = event.invitations.find(inv => inv._id.toString() === invitationId);
  
      if (!event || !invitation) {
        return res.render("404",{errorDescription:"Event or invitation not found"})
      }

      if(event.price>0){
        if(invitation.paymentStatus === "paid"){
            res.render('eventTicketSuccess')
        }
      }else{
        if(invitation.isGoing == true || invitation.isGoing == false){
            res.render('eventTicketSuccess')
        }
      }
  
      // Render the EJS template with event and invitation data
      res.render('eventPhoneInvitation', { event, invitation });
    } catch (error) {
        return res.render("404",{errorDescription:"Internal Server Error"})
    }
  };
  