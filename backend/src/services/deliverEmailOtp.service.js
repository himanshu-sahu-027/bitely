import nodemailer from "nodemailer";
import { config } from "../config/env.js";

const buildOtpMessage = (otp) =>
  `Your Bitely OTP is ${otp}. It expires in 5 minutes.`;

const getEmailTransporter = () => {
  if (
    !config.SMTP_HOST ||
    !config.SMTP_PORT ||
    !config.SMTP_USER ||
    !config.SMTP_PASS ||
    !config.SMTP_FROM
  ) {
    throw new Error("Email OTP delivery is not configured.");
  }

  return nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  });
};

export const deliverEmailOtp = async ({ identifier, otp }) => {
  const transporter = getEmailTransporter();
  const message = buildOtpMessage(otp);

  await transporter.sendMail({
    from: config.SMTP_FROM,
    to: identifier,
    subject: "Your Bitely OTP",
    text: message,
  });
};
