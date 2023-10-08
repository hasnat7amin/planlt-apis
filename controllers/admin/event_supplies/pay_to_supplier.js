const Users = require("../../../models/Users");
const Event = require("../../../models/Event");
const paypal = require('paypal-rest-sdk');

paypal.configure({
    mode: "sandbox", // Change to 'live' for production
    client_id:
      "AZsF8qBgAY7yLySfYciIJ073vE1ckLWVkqnNqSFr8qez49LVizrcaGrf-J9_YZxYtu4QSGRC1vfVl6a6",
    client_secret:
      "EESXt6fxEtG5m3RipjHYXh9l-ZnWqBvS5e8ZHVmuxbCD5BABE-C8iycVW6mVDzimKH766FzDl_O892f8",
  });

const processPayPalPayment = async (delegatePayPalEmail, paymentAmount) => {
  return new Promise((resolve, reject) => {
    const sender_batch_id = Math.random().toString(36).substring(9);
    const create_payout_json = {
      sender_batch_header: {
        sender_batch_id: sender_batch_id,
        email_subject: 'You have a payout!'
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: paymentAmount,
            currency: 'USD'
          },
          receiver: delegatePayPalEmail,
          note: 'Thanks for your cooperation!',
          sender_item_id: 'item_' + sender_batch_id
        }
      ]
    };

    paypal.payout.create(create_payout_json, (error, payout) => {
      if (error) {
        console.error('Error processing PayPal Payout:', error);
        reject(new Error('Failed to process PayPal payment.'));
      } else {
        console.log('Payment successful to PayPal account:', delegatePayPalEmail, 'Amount:', paymentAmount);
        resolve(true); // Payment successful
      }
    });
  });
};

module.exports = async (req, res) => {
  try {
    const { reimbursementId } = req.body;

    const event = await Event.findOne({ 'reimbursement._id': reimbursementId });

    if (!event) {
      throw new Error("Event with the provided reimbursement not found");
    }

    const reimbursement = event.reimbursement.find(reim => reim._id.toString() === reimbursementId);

    if (!reimbursement) {
      throw new Error("Reimbursement not found");
    }

    if (reimbursement.status === 'paid') {
      throw new Error("Reimbursement is already paid");
    }

    const delegate = await Users.findById(reimbursement.delegate);

    if (!delegate || !delegate.email) {
      throw new Error("Delegate not found or no PayPal email associated");
    }

    const paymentResult = await processPayPalPayment(delegate.email, reimbursement.tc);

    if (!paymentResult) {
      throw new Error("Failed to process PayPal payment.");
    }

    reimbursement.status = 'paid';
    await event.save();

    return res.status(200).json({
      code: 200,
      status: true,
      message: "Reimbursement paid successfully.",
      result: reimbursement,
    });
  } catch (error) {
    return res.status(200).json({
      code: 200,
      status: false,
      message: "Failed to process reimbursement payment.",
      error: error.message,
    });
  }
};
