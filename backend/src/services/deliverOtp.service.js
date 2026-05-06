import nodemailer from "nodemailer";
import twilio from "twilio";
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

const getSmsClient = () => {
  if (
    !config.TWILIO_ACCOUNT_SID ||
    !config.TWILIO_AUTH_TOKEN ||
    !config.TWILIO_PHONE_NUMBER
  ) {
    throw new Error("SMS OTP delivery is not configured.");
  }

  return twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
};

const normalizePhoneForSms = (identifier) => {
  if (identifier.startsWith("+")) {
    return identifier;
  }

  return `${config.SMS_DEFAULT_COUNTRY_CODE}${identifier}`;
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

  if (type === "phone") {
    const client = getSmsClient();

    await client.messages.create({
      body: message,
      from: config.TWILIO_PHONE_NUMBER,
      to: normalizePhoneForSms(identifier),
    });

    return;
  }

  throw new Error("Invalid type");
};
