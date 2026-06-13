import nodemailer from "nodemailer";
import { config } from "../config/env.js";

const assertEmailConfig = () => {
  const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"];
  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Email service is not configured: missing ${key}`);
    }
  }
};

const getEmailTransporter = () => {
  assertEmailConfig();

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

const sendMail = async ({ to, subject, text }) => {
  const transporter = getEmailTransporter();

  await transporter.sendMail({
    from: config.SMTP_FROM,
    to,
    subject,
    text,
  });
};

const buildOtpMessage = (otp) => `Your Bitely OTP is ${otp}. It expires in 5 minutes.`;

export const sendOTP = async ({ identifier, otp }) => {
  if (!identifier || !otp) {
    throw new Error("sendOTP requires identifier and otp");
  }

  await sendMail({
    to: identifier,
    subject: "Your Bitely OTP",
    text: buildOtpMessage(otp),
  });
};

export const sendVerificationEmail = async ({ email, otp }) => {
  if (!email || !otp) {
    throw new Error("sendVerificationEmail requires email and otp");
  }

  await sendMail({
    to: email,
    subject: "Verify your Bitely email",
    text: buildOtpMessage(otp),
  });
};

export const sendPasswordResetEmail = async ({ email, otp }) => {
  if (!email || !otp) {
    throw new Error("sendPasswordResetEmail requires email and otp");
  }

  await sendMail({
    to: email,
    subject: "Reset your Bitely password",
    text: buildOtpMessage(otp),
  });
};
