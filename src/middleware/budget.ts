import { NextFunction, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import Budget from "../models/Budget";

declare global {
  namespace Express {
    interface Request {
      budget: Budget;
    }
  }
}

export const validateBudgetId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await param("budgetId")
    .isInt()
    .withMessage("ID no valid")
    .bail() // is failed this validation, stop here
    .custom((value) => value > 0)
    .bail()
    .withMessage("ID must be greater than 0")
    .run(req);

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

export const validateBudgetExist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { budgetId } = req.params;
    const budget = await Budget.findByPk(budgetId);

    if (!budget) {
      const error = new Error("Budget not found");
      res.status(404).json({ message: error.message });
      return;
    }

    req.budget = budget;

    next();
  } catch (error) {
    res.status(500).json({ message: "it was an error" });
  }
};

export const validateBudgetInput = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("name").notEmpty().withMessage("Name is required").run(req);

  await body("amount")
    .notEmpty()
    .withMessage("amount is required")
    .isNumeric()
    .withMessage("amount is not valid")
    .custom((value) => value > 0)
    .withMessage("amount must be greater than 0")
    .run(req);

  next();
};

export const hasAccessToBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user.id !== req.budget.userId) {
    const error = new Error("You don't have access to this budget");
    res.status(401).json({ message: error.message });
    return;
  }

  next();
};
