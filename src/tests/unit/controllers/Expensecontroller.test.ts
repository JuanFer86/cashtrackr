import { createRequest, createResponse } from "node-mocks-http";
import { budgets } from "../../mocks/budgets";
import Expense from "../../../models/expenses";
import { ExpensesController } from "../../../controllers/ExpenseController";
import { expenses } from "../../mocks/expenses";

jest.mock("../../../models/expenses", () => ({
  create: jest.fn(),
}));

describe("ExpenseController.create", () => {
  it("should create an expense", async () => {
    const expenseMock = {
      save: jest.fn().mockResolvedValue(true),
    };

    (Expense.create as jest.Mock).mockResolvedValue(expenseMock);
    const request = createRequest({
      method: "POST",
      url: "/api/budgets/:budgetId/expenses",
      body: { name: "Test Expense", amount: 100 },
      budget: budgets[0],
    });

    const response = createResponse();

    await ExpensesController.create(request, response);

    expect(response.statusCode).toBe(201);
    expect(response._getJSONData()).toEqual({ message: "expense created" });
    expect(Expense.create).toHaveBeenCalled();
    expect(Expense.create).toHaveBeenCalledWith(request.body);
    expect(expenseMock.save).toHaveBeenCalled();
    expect(expenseMock.save).toHaveBeenCalledTimes(1);
  });

  it("should call error", async () => {
    const expenseMock = {
      save: jest.fn().mockResolvedValue(true),
    };

    (Expense.create as jest.Mock).mockRejectedValue(new Error());
    const request = createRequest({
      method: "POST",
      url: "/api/budgets/:budgetId/expenses",
      body: { name: "Test Expense", amount: 100 },
      budget: budgets[0],
    });

    const response = createResponse();

    await ExpensesController.create(request, response);

    expect(response.statusCode).toBe(500);
    expect(response._getJSONData()).toEqual({ message: "it was an error" });
    expect(expenseMock.save).not.toHaveBeenCalled();
  });
});

describe("ExpenseController.getById", () => {
  it("should get an expense by ID 1", async () => {
    const request = createRequest({
      method: "GET",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: expenses[0],
    });

    const response = createResponse();

    await ExpensesController.getById(request, response);

    expect(response.statusCode).toBe(201);
    expect(response._getJSONData()).toEqual(expenses[0]);
  });
});

describe("ExpenseController.updateById", () => {
  it("should update an expense by ID 1", async () => {
    const expenseMock = {
      ...expenses[0],
      update: jest.fn().mockResolvedValue(true),
    };

    const request = createRequest({
      method: "PUT",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: expenseMock,
      body: { name: "Updated Expense", amount: 100 },
    });

    const response = createResponse();

    await ExpensesController.updateById(request, response);

    expect(response.statusCode).toBe(201);
    expect(response._getJSONData()).toEqual({
      message: "Updated successfully",
    });
    expect(expenseMock.update).toHaveBeenCalled();
    expect(expenseMock.update).toHaveBeenCalledTimes(1);
    expect(expenseMock.update).toHaveBeenCalledWith(request.body);
  });
});

describe("ExpenseController.deleteById", () => {
  it("should delete an expense by ID 1", async () => {
    const expenseMock = {
      ...expenses[0],
      destroy: jest.fn(),
    };

    const request = createRequest({
      method: "DELETE",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: expenseMock,
    });

    const response = createResponse();

    await ExpensesController.deleteById(request, response);

    expect(response.statusCode).toBe(201);
    expect(response._getJSONData()).toEqual({
      message: "Updated successfully",
    });
    expect(expenseMock.destroy).toHaveBeenCalled();
    expect(expenseMock.destroy).toHaveBeenCalledTimes(1);
  });
});
