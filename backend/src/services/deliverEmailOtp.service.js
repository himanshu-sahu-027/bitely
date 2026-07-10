import nodemailer from "nodemailer";
import { config } from "../config/env.js";


const buildOtpMessage = (otp) => `<p>Hello <b>Badal Pujhari</b>,</p><p>Your Bitely Verification Code <h1>   ${otp}</h1></p><p>This verification code is valid for 5 minutes. For your security, never share this OTP with anyone.</p>`;

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
    subject: "Verify your Bitely account",
    html: message,
  });
};
