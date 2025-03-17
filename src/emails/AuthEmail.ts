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
        <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirm account</a>
        <p>enter the code: <b>${user.token}</b></p>
        `,
    });
    // console.log(email.messageId);
  };

  static sendPasswordResetToken = async (user: EmailType) => {
    const email = await transport.sendMail({
      from: "CashTrackr <admin@cashtrackr.com>",
      to: user.email,
      subject: "Cashtrackr - Reset your Password",
      html: `
        <p>Hola: ${user.name}, you have requested to change your password </p>
        <p>Visit the following link: <a></a></p>
        <a href="${process.env.FRONTEND_URL}/auth/new-password">Reset Password</a>
        <p>enter the code: <b>${user.token}</b></p>
        `,
    });
    // console.log(email.messageId);
  };

  static sendConfirmationNewEmail = async (
    user: EmailType,
    newEmail: string
  ) => {
    const email = await transport.sendMail({
      from: "CashTrackr <admin@cashtrackr.com>",
      to: user.email,
      subject: "Cashtrackr - Confirmation new email",
      html: `
        <p>Hola: ${user.name}, you have changed your information </p>
        <p>to this new one ${newEmail}</p>
        <a href="${process.env.FRONTEND_URL}/auth/login">login here again</a>
        `,
    });
    // console.log(email.messageId);
  };
}
