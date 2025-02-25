import { createRequest, createResponse } from "node-mocks-http";
import { budgets } from "../../mocks/budgets";
import { BudgetController } from "../../../controllers/BudgetController";
import Budget from "../../../models/Budget";
import Expense from "../../../models/expenses";

jest.mock("../../../models/Budget", () => ({
  findAll: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
}));

describe("BudgetController.getAll", () => {
  beforeEach(() => {
    (Budget.findAll as jest.Mock).mockReset();
    (Budget.findAll as jest.Mock).mockImplementation((options) => {
      const updatedBudgets = budgets.filter(
        (budget) => budget.userId === options.where.userId
      );
      return Promise.resolve(updatedBudgets);
    });
  }); // run before each test

  // beforeAll(() => {}) // run before all tests once

  // afterAll(() => {}) // run after all tests once
  // afterEach(() => {}) // run after each test

  it("should return retrieve 2 budgets for user with ID 1", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets",
      user: { id: 1 },
    });

    const res = createResponse();

    // (Budget.findAll as jest.Mock).mockResolvedValue(updatedBudgets);
    await BudgetController.getAll(req, res);

    const data = res._getJSONData();

    expect(data).toHaveLength(2);
    expect(res.statusCode).toBe(201);
    expect(res.statusCode).not.toBe(404);
  });

  it("should return retrieve a budget for user with ID 2", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets",
      user: { id: 2 },
    });

    const res = createResponse();

    await BudgetController.getAll(req, res);

    const data = res._getJSONData();

    expect(data).toHaveLength(1);
    expect(res.statusCode).toBe(201);
    expect(res.statusCode).not.toBe(404);
  });

  it("should return retrieve 0 budgets for user with ID 10", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets",
      user: { id: 10 },
    });

    const res = createResponse();

    await BudgetController.getAll(req, res);

    const data = res._getJSONData();

    expect(data).toHaveLength(0);
    expect(res.statusCode).toBe(201);
    expect(res.statusCode).not.toBe(404);
  });

  it("should handle errors when fetching budgets", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets",
      user: { id: 10 },
    });

    const res = createResponse();

    (Budget.findAll as jest.Mock).mockRejectedValue(new Error());
    await BudgetController.getAll(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: "it was an error" });
  });
});

describe("BudgetController.create", () => {
  it("shouuld create a new budget with statusCode 201", async () => {
    const mockBudget = {
      save: jest.fn().mockResolvedValue(true),
    };
    (Budget.create as jest.Mock).mockResolvedValue(mockBudget);
    const req = createRequest({
      method: "POST",
      url: "/api/budgets",
      user: { id: 1 },
      body: { name: "Test Budget", amount: 1000 },
    });

    const res = createResponse();

    // (Budget.findAll as jest.Mock).mockResolvedValue(updatedBudgets);
    await BudgetController.create(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(201);
    expect(data).toBe("Budget created succesfully");
    expect(data).toBe("Budget created succesfully");
    expect(mockBudget.save).toHaveBeenCalled();
    expect(mockBudget.save).toHaveBeenCalledTimes(1);
    expect(Budget.create).toHaveBeenCalledWith(req.body);
  });

  it("should handle errors when creating a budget", async () => {
    const mockBudget = {
      save: jest.fn(),
    };

    (Budget.create as jest.Mock).mockRejectedValue(new Error());
    const req = createRequest({
      method: "POST",
      url: "/api/budgets",
      user: { id: 1 },
      body: { name: "Test Budget", amount: 1000 },
    });

    const res = createResponse();

    // (Budget.findAll as jest.Mock).mockResolvedValue(updatedBudgets);
    await BudgetController.create(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(500);
    expect(data).toEqual({ message: "it was an error" });
    expect(mockBudget.save).not.toHaveBeenCalled();
    expect(Budget.create).toHaveBeenCalledWith(req.body);
  });
});

describe("BudgetController.getBudgetById", () => {
  beforeEach(() => {
    (Budget.findByPk as jest.Mock).mockImplementation((id) => {
      const budget = budgets.filter((b) => b.id === id)[0];
      return Promise.resolve(budget);
    });
  });

  it("should retrieve a budget with ID 1 and 3 expenses", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets/:id",
      budget: { id: 1 },
    });

    const res = createResponse();

    await BudgetController.getBudgetById(req, res);

    const { budget } = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(budget.expenses).toHaveLength(3);
    expect(Budget.findByPk).toHaveBeenCalled();
    expect(Budget.findByPk).toHaveBeenCalledTimes(1);
    expect(Budget.findByPk).toHaveBeenLastCalledWith(req.budget.id, {
      include: [Expense],
    });
  });

  it("should retrieve a budget with ID 2 and 2 expenses", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets/:id",
      budget: { id: 2 },
    });

    const res = createResponse();

    await BudgetController.getBudgetById(req, res);

    const { budget } = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(budget.expenses).toHaveLength(2);
  });

  it("should retrieve a budget with ID 3 and 0 expenses", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets/:id",
      budget: { id: 3 },
    });

    const res = createResponse();

    await BudgetController.getBudgetById(req, res);

    const { budget } = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(budget.expenses).toHaveLength(0);
  });
});

describe("BudgetController.updateBudgetById", () => {
  it("should update a budget with ID 1", async () => {
    const mockBudget = {
      update: jest.fn().mockResolvedValue(true),
    };

    const req = createRequest({
      method: "PUT",
      url: "/api/budgets/:budgetId",
      budget: mockBudget,
      body: { name: "Updated Budget", amount: 5000 },
    });

    const res = createResponse();

    await BudgetController.updateBudgetById(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual({
      message: "budget updated succesfully",
    });
    expect(mockBudget.update).toHaveBeenCalled();
    expect(mockBudget.update).toHaveBeenCalledTimes(1);
    expect(mockBudget.update).toHaveBeenCalledWith(req.body);
  });
});

describe("BudgetController.deleteBudgetById", () => {
  it("should delete a budget with ID 1", async () => {
    const mockBudget = {
      destroy: jest.fn().mockResolvedValue(true),
    };

    const req = createRequest({
      method: "DELETE",
      url: "/api/budgets/:budgetId",
      budget: mockBudget,
    });

    const res = createResponse();

    await BudgetController.deleteBudgetById(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual({
      message: "budget deleted succesfully",
    });
    expect(mockBudget.destroy).toHaveBeenCalled();
    expect(mockBudget.destroy).toHaveBeenCalledTimes(1);
  });
});
