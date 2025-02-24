import { transport } from "../config/nodemailer";

type EmailType = {
  name: string;
  email: string;
  token: string;
};

export class AuthEmail {
  static sendConfirmationEmail = async (user: EmailType) => {
    const email = await transport.sendMail({
      from: "CashTrackr <admin@cashtrackr.com>",
      to: user.email,
      subject: "Cashtrackr - Confirm you account",
      html: `
        <p>Hola: ${user.name}, you have created an account in Cashtrackr, it's almost done</p>
        <p>Visit the following link: <a></a></p>
        <a href="#">Confirm account</a>
        <p>enter the code: <b>${user.token}</b></p>
        `,
    });
    console.log(email.messageId);
  };

  static sendPasswordResetToken = async (user: EmailType) => {
    const email = await transport.sendMail({
      from: "CashTrackr <admin@cashtrackr.com>",
      to: user.email,
      subject: "Cashtrackr - Reset your Password",
      html: `
        <p>Hola: ${user.name}, you have requested to change your password </p>
        <p>Visit the following link: <a></a></p>
        <a href="#">Reset Password</a>
        <p>enter the code: <b>${user.token}</b></p>
        `,
    });
    console.log(email.messageId);
  };
}
