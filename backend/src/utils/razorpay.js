import Razorpay from "razorpay";

import { config } from "../config/env.js";

let razorpayInstance = null;

export const isRazorpayConfigured = () =>
  Boolean(config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET);

export const getRazorpayInstance = () => {
  if (!isRazorpayConfigured()) {
    return null;
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: config.RAZORPAY_KEY_ID,
      key_secret: config.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayInstance;
};
