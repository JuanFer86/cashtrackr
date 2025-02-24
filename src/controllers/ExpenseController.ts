import type { Request, Response } from "express";
import Expense from "../models/expenses";

export class ExpensesController {
  //   static getAll = async (req: Request, res: Response) => {};

  static create = async (req: Request, res: Response) => {
    // console.log(req.params.budgetId, "   ", req.budget.id);
    try {
      const expense = new Expense(req.body);
      expense.budgetId = req.budget.id;
      await expense.save();
      res.status(201).json({ message: "expense created" });
    } catch (error) {
      // console.log(error)
      res.status(500).json({ message: "it was an error" });
    }
  };

  static getById = async (req: Request, res: Response) => {
    res.status(201).json(req.expense);
  };

  static updateById = async (req: Request, res: Response) => {
    await req.expense.update(req.body);
    res.status(201).json({ message: "Updated successfully" });
  };

  static deleteById = async (req: Request, res: Response) => {
    await req.expense.destroy(req.body);
    res.status(201).json({ message: "Updated successfully" });
  };
}
