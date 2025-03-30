const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createPaymentLink(amount, description) {
  const options = {
    amount: amount * 100, // in paise
    currency: "INR",
    description,
  };
  const response = await razorpay.paymentLink.create(options);
  return response.short_url;
}

module.exports = { createPaymentLink };
