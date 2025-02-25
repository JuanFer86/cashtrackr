import { createRequest, createResponse } from "node-mocks-http";
import {
  hasAccessToBudget,
  validateBudgetExist,
} from "../../../middleware/budget";
import Budget from "../../../models/Budget";
import { budgets } from "../../mocks/budgets";

jest.mock("../../../models/Budget", () => ({
  findByPk: jest.fn(),
}));

describe("budget middleware - validateBudgetExist", () => {
  it("should handle non-existent budget", async () => {
    (Budget.findByPk as jest.Mock).mockResolvedValue(null);

    const request = createRequest({
      params: {
        budgetId: 1,
      },
    });

    const response = createResponse();
    const next = jest.fn();

    await validateBudgetExist(request, response, next);

    expect(response.statusCode).toBe(404);
    expect(response._getJSONData()).toEqual({ message: "Budget not found" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should proceed to next middleware if budget exists", async () => {
    (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0]);

    const request = createRequest({
      params: {
        budgetId: 1,
      },
    });

    const response = createResponse();
    const next = jest.fn();

    await validateBudgetExist(request, response, next);

    expect(next).toHaveBeenCalled();
    expect(request.budget).toEqual(budgets[0]);
  });

  it("should have an error 500", async () => {
    (Budget.findByPk as jest.Mock).mockRejectedValue(new Error());

    const request = createRequest({
      params: {
        budgetId: 1,
      },
    });

    const response = createResponse();
    const next = jest.fn();

    await validateBudgetExist(request, response, next);

    expect(response.statusCode).toBe(500);
    expect(response._getJSONData()).toEqual({ message: "it was an error" });
    expect(next).not.toHaveBeenCalled();
  });
});

describe("budget middleware - hasAccessToBudget", () => {
  it("shouldn't call next() if user does not having access to budget", async () => {
    const next = jest.fn();
    const request = createRequest({
      user: {
        id: 1,
      },
      budget: budgets[2],
    });

    const response = createResponse();
    await hasAccessToBudget(request, response, next);

    expect(response.statusCode).toBe(401);
    expect(response._getJSONData()).toEqual({
      message: "You don't have access to this budget",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() if user have access to budget", async () => {
    const next = jest.fn();
    const request = createRequest({
      user: {
        id: 1,
      },
      budget: budgets[0],
    });

    const response = createResponse();
    await hasAccessToBudget(request, response, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
