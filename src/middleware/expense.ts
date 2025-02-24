import { Request, Response, NextFunction } from "express";
import { body, param } from "express-validator";
import Expense from "../models/expenses";
import Budget from "../models/Budget";

declare global {
  namespace Express {
    interface Request {
      expense: Expense;
    }
  }
}

export const validateExpenseInput = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("name")
    .notEmpty()
    .withMessage("Expense name is required")
    .run(req);

  await body("amount")
    .notEmpty()
    .withMessage("Expense amount is required")
    .isNumeric()
    .withMessage("Expense amount is not valid")
    .custom((value) => value > 0)
    .withMessage("Expense amount must be greater than 0")
    .run(req);

  next();
};

export const validationExpenseId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await param("expenseId")
    .isInt()
    .custom((value) => value > 0)
    .withMessage("Id not valid")
    .run(req);

  next();
};

export const validateExpenseExist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { expenseId, budgetId } = req.params;

    const expense = await Expense.findByPk(expenseId);

    if (!expense) {
      const error = new Error("Expense not found");
      res.status(404).json({ message: error.message });
      return;
    }

    req.expense = expense;

    next();
  } catch (error) {
    res.status(500).json({ message: "it was an error" });
  }
};
