import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    const error = new Error("Not authorized");
    res.status(401).json({ message: error.message });
    return;
  }

  const [, token] = bearer.split(" ");

  if (!token) {
    const error = new Error("Not authorized");
    res.status(401).json({ message: error.message });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof decoded === "object" && decoded.id) {
      req.user = await User.findByPk(decoded.id, {
        attributes: ["id", "name", "email"],
      });

      next();
    }
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: "token no valido" });
  }
};
