import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const config = () => {
  return {
    host: process.env.EMAIL_HOST,
    port: +parseInt(process.env.EMAIL_PORT, 10),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
};

// Looking to send emails in production? Check out our Email API/SMTP product!
export const transport = nodemailer.createTransport(config());
