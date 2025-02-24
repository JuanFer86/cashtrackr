import { Router } from "express";
import { body, param } from "express-validator";
import { BudgetController } from "../controllers/BudgetController";
import { handleInputErrors } from "../middleware/validation";
import {
  hasAccessToBudget,
  validateBudgetExist,
  validateBudgetId,
  validateBudgetInput,
} from "../middleware/budget";
import { ExpensesController } from "../controllers/ExpenseController";
import {
  validateExpenseExist,
  validateExpenseInput,
  validationExpenseId,
} from "../middleware/expense";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate); // req.user

router.param("budgetId", validateBudgetId);
router.param("budgetId", validateBudgetExist); // req.budget
router.param("budgetId", hasAccessToBudget);

router.param("expenseId", validationExpenseId);
router.param("expenseId", validateExpenseExist);

router.get("/", BudgetController.getAll);

router.post(
  "/",
  validateBudgetInput,
  handleInputErrors,
  BudgetController.create
);

router.get("/:budgetId", BudgetController.getBudgetById);

router.put(
  "/:budgetId",
  validateBudgetInput,
  handleInputErrors,
  BudgetController.updateBudgetById
);

router.delete("/:budgetId", BudgetController.deleteBudgetById);

// routes for expenses
// router.get("/:budgetId/expenses", ExpensesController.getAll);
router.post(
  "/:budgetId/expenses",
  validateExpenseInput,
  handleInputErrors,
  ExpensesController.create
);
router.get("/:budgetId/expenses/:expenseId", ExpensesController.getById);
router.put(
  "/:budgetId/expenses/:expenseId",
  validateExpenseInput,
  handleInputErrors,
  ExpensesController.updateById
);
router.delete(
  "/:budgetId/expenses/:expenseId",
  validateExpenseInput,
  handleInputErrors,
  ExpensesController.deleteById
);

export default router;
