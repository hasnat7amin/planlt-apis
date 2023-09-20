const twilio = require("twilio");
const accountSid = "AC4f3b1b8cb20eefce49a08e78a317b1d1";
const authToken = "59145fa4aba1c6d3097f60f9cadfab1e";

const client = require('twilio')(accountSid, authToken);

const sendSms = async (toPhoneNumber, message) => {
    try {
      const response = await client.messages.create({
        body: message,
        from: "+18333171448", // Your Twilio phone number
        to: toPhoneNumber, // Recipient's phone number
      });
  
      console.log(`SMS sent with SID: ${response.sid}`);
      return true;
    } catch (error) {
      console.error(`Failed to send SMS: ${error.message}`);
      return false;
    }
  };


  module.exports =  sendSms;



  // +18333171448