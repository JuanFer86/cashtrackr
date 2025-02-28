import { Response, Request } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // prevent duplicates
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      const error = new Error("Email already exists");
      res.status(409).json({ message: error.message });
      return;
    }
    try {
      const user = await User.create(req.body);
      user.password = await hashPassword(password);
      const token = generateToken();
      user.token = token;

      if (process.env.NODE_ENV !== "production") {
        globalThis.cashTrackrConfirmationToken = token;
      }

      await user.save();

      await AuthEmail.sendConfirmationEmail({
        name: user.name,
        email: user.email,
        token: user.token,
      });

      res.status(201).json({ message: "Account created successfully" });
    } catch (error) {
      // console.log(error)
      res.status(500).json({ message: "Internal server error" });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    const { token } = req.body;
    const user = await User.findOne({ where: { token } });

    if (!user) {
      const error = new Error("Token not valid");
      res.status(409).json({ message: error.message });
      return;
    }
    user.confirmed = true;
    user.token = null;
    await user.save();

    res.status(201).json({ message: "Account confirmed" });
    try {
    } catch (error) {}
  };

  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      const error = new Error("User not found");
      res.status(404).json({ message: error.message });
      return;
    }

    if (!user.confirmed) {
      const error = new Error("User is not confirmed");
      res.status(403).json({ message: error.message });
      return;
    }

    const validPassword = await checkPassword(password, user.password);

    if (!validPassword) {
      const error = new Error("Password is incorrect");
      res.status(401).json({ message: error.message });
      return;
    }

    const tokenJWT = generateJWT(user.id);

    res.status(201).json({ token: tokenJWT });
  };

  static forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      const error = new Error("User not found");
      res.status(404).json({ message: error.message });
      return;
    }

    user.token = generateToken();
    await user.save();

    await AuthEmail.sendPasswordResetToken({
      name: user.name,
      email: user.email,
      token: user.token,
    });

    res.status(201).json({ message: "check your email" });
  };

  static validateToken = async (req: Request, res: Response) => {
    const { token } = req.body;
    const tokenExists = await User.findOne({ where: { token } });

    if (!tokenExists) {
      const error = new Error("Token not valid");
      res.status(404).json({ message: error.message });
      return;
    }

    res.status(201).json({ message: "Token Valid..." });
  };

  static resetPasswordWithToken = async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ where: { token } });

    if (!user) {
      const error = new Error("Token not valid");
      res.status(404).json({ message: error.message });
      return;
    }

    user.password = await hashPassword(password);
    user.token = null;
    await user.save();

    res.status(201).json({ message: "Password updated succesfully" });
  };

  static user = async (req: Request, res: Response) => {
    // res.status(201).json({ token: token });
    res.status(201).json(req.user);
  };

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;

    const { id } = req.user;

    const user = await User.findByPk(id);

    const isPasswordCorrect = await checkPassword(
      current_password,
      user.password
    );

    if (!isPasswordCorrect) {
      const error = new Error("Current password is incorrect");
      res.status(401).json({ message: error.message });
      return;
    }

    user.password = await hashPassword(password);
    await user.save();

    res.status(201).json({ message: "password update succesfully" });
  };

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;

    const { id } = req.user;

    const user = await User.findByPk(id);

    const isPasswordCorrect = await checkPassword(password, user.password);

    if (!isPasswordCorrect) {
      const error = new Error("Password is incorrect");
      res.status(401).json({ message: error.message });
      return;
    }

    res.status(201).json({ message: "Password is correct" });
  };
}
