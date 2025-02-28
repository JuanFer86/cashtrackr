import { createRequest, createResponse } from "node-mocks-http";
import { validateExpenseExist } from "../../../middleware/expense";
import Expense from "../../../models/expenses";
import { expenses } from "../../mocks/expenses";
import { hasAccessToBudget } from "../../../middleware/budget";
import { budgets } from "../../mocks/budgets";

jest.mock("../../../models/expenses", () => ({
  findByPk: jest.fn(),
}));

describe("Expenses middleware - validateExpenseExist", () => {
  beforeEach(() => {
    (Expense.findByPk as jest.Mock).mockImplementation((id) => {
      const expense = expenses.find((e) => e.id === id) ?? null;
      return Promise.resolve(expense);
    });
  });

  it("should handle a non-existent budget", async () => {
    const request = createRequest({
      params: {
        expenseId: 120,
      },
    });
    const response = createResponse();
    const next = jest.fn();
    await validateExpenseExist(request, response, next);

    const data = response._getJSONData();

    expect(response.statusCode).toBe(404);
    expect(data).toEqual({ message: "Expense not found" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next middleware if expense exists", async () => {
    const request = createRequest({
      params: {
        expenseId: 1,
      },
    });
    const response = createResponse();
    const next = jest.fn();
    await validateExpenseExist(request, response, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(request.expense).toEqual(expenses[0]);
  });

  it("should handle internal server error", async () => {
    (Expense.findByPk as jest.Mock).mockRejectedValue(new Error());

    const request = createRequest({
      params: {
        expenseId: 1,
      },
    });
    const response = createResponse();
    const next = jest.fn();
    await validateExpenseExist(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
    expect(response._getJSONData()).toEqual({ message: "it was an error" });
  });

  it("should prevent unaouthorized users from adding expenses", async () => {
    const request = createRequest({
      method: "POST",
      url: "/api/budgets/:buudgetId/expenses",
      budget: budgets[0],
      user: { id: 20 },
      body: { name: "Expense Test", amount: 3000 },
    });
    const response = createResponse();
    const next = jest.fn();

    await hasAccessToBudget(request, response, next);

    const data = response._getJSONData();

    expect(response.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
    expect(data).toEqual({ message: "You don't have access to this budget" });
  });
});
