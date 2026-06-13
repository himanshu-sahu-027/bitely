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

export const deliverOtp = async ({ identifier, type, otp }) => {
  const message = buildOtpMessage(otp);

  if (type === "email") {
    const transporter = getEmailTransporter();

    await transporter.sendMail({
      from: config.SMTP_FROM,
      to: identifier,
      subject: "Your Bitely OTP",
      text: message,
    });

    return;
  }

  // Twilio/phone OTP intentionally disabled for production migration.
  if (type === "phone") {
    throw new Error("Phone OTP delivery is disabled.");
  }

  throw new Error("Invalid type");
};
