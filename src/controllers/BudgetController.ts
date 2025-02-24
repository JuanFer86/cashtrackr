import { Request, Response } from "express";
import Budget from "../models/Budget";
import Expense from "../models/expenses";

export class BudgetController {
  static getAll = async (req: Request, res: Response) => {
    try {
      const budgets = await Budget.findAll({
        order: [["createdAt", "DESC"]],
        where: {
          userId: req.user.id,
        },
      });
      res.status(201).json(budgets);
    } catch (error) {
      res.status(500).json({ message: "it was an error" });
    }
  };

  static create = async (req: Request, res: Response) => {
    try {
      const budget = await Budget.create(req.body);

      budget.userId = req.user.id;

      await budget.save();
      res.status(201).json("Budget created succesfully");
    } catch (error) {
      // console.log(error)
      res.status(500).json({ message: "it was an error" });
    }
  };

  static getBudgetById = async (req: Request, res: Response) => {
    const budget = await Budget.findByPk(req.budget.id, {
      include: [Expense],
    });

    res.status(201).json({ budget });
  };

  static updateBudgetById = async (req: Request, res: Response) => {
    const { budget } = req;

    // write body changes
    await budget.update(req.body);

    res.status(201).json({ message: "budget updated succesfully" });
  };

  static deleteBudgetById = async (req: Request, res: Response) => {
    const { budget } = req;

    await budget.destroy();

    res.status(201).json({ message: "budget deleted succesfully" });
  };
}
