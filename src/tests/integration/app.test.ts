import request from "supertest";
import app, { connectDb } from "../../server";
import { AuthController } from "../../controllers/AuthController";
import { response } from "express";
import User from "../../models/User";
import * as authUtils from "../../utils/auth";
import * as jwtUtils from "../../utils/jwt";

describe("Authentication - Create Account", () => {
  beforeAll(async () => {
    await connectDb();
  });

  test("It should display validation error when form is empty", async () => {
    const response = await request(app)
      .post("/api/auth/create-account")
      .send({});

    const createAccountMock = jest.spyOn(AuthController, "createAccount");

    expect(response.status).toBe(400);
    expect(response.status).not.toBe(201);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(5);
    expect(response.body.errors).not.toHaveLength(3);
    expect(createAccountMock).not.toHaveBeenCalled();
  });

  test("It should return 400 status code when te email is invalid", async () => {
    const response = await request(app).post("/api/auth/create-account").send({
      name: "Juan",
      password: "12345678",
      email: "juan.com",
    });

    const createAccountMock = jest.spyOn(AuthController, "createAccount");

    expect(response.status).toBe(400);
    expect(response.status).not.toBe(201);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("Email is not valid");
    expect(response.body.errors).not.toHaveLength(2);
    expect(createAccountMock).not.toHaveBeenCalled();
  });

  test("It should return 400 status code when te password is less than 8 characters", async () => {
    const response = await request(app).post("/api/auth/create-account").send({
      name: "Juan",
      password: "123456",
      email: "juan@correo.com",
    });

    const createAccountMock = jest.spyOn(AuthController, "createAccount");

    expect(response.status).toBe(400);
    expect(response.status).not.toBe(201);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe(
      "Password must be at least 8 characters long"
    );
    expect(response.body.errors).not.toHaveLength(2);
    expect(createAccountMock).not.toHaveBeenCalled();
  });

  test("It should register a new user successfully", async () => {
    const response = await request(app).post("/api/auth/create-account").send({
      name: "Juan",
      password: "12345678",
      email: "juan@correo.com",
    });

    expect(response.status).toBe(201);

    expect(response.status).not.toBe(400);
    expect(response.body).not.toHaveProperty("errors");
  });

  test("It should return 409 conflict when a user is already registered", async () => {
    const response = await request(app).post("/api/auth/create-account").send({
      name: "Juan",
      password: "12345678",
      email: "juan@correo.com",
    });

    const createAccountMock = jest.spyOn(AuthController, "createAccount");

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Email already exists");

    expect(response.status).not.toBe(400);
    expect(response.status).not.toBe(201);
    expect(response.body).not.toHaveProperty("errors");
  });
});

describe("Authentication - confirm account", () => {
  it("It should return 400 status code when token is empty or not valid", async () => {
    const response = await request(app).post("/api/auth/confirm-account").send({
      token: "not_valid",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("Token not valid");
  });

  it("It should return 400 status code when token is not valid", async () => {
    const response = await request(app).post("/api/auth/confirm-account").send({
      token: "123456",
    });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Token not valid");
    expect(response.status).not.toBe(200);
  });

  it("It should confirm an account with valid token", async () => {
    const token = globalThis.cashTrackrConfirmationToken;

    const response = await request(app).post("/api/auth/confirm-account").send({
      token,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Account confirmed");
    expect(response.status).not.toBe(400);
  });
});

describe("Authentication - Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("It should display 400 validation errors when the form is empty", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "",
      password: "",
    });

    const loginMock = jest.spyOn(AuthController, "login");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(3);
    expect(loginMock).not.toHaveBeenCalled;
  });

  it("It should display 400 validation errors when the email is not", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "correo.com",
      password: "12345678",
    });

    const loginMock = jest.spyOn(AuthController, "login");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(loginMock).not.toHaveBeenCalled;
  });

  it("It should display 404 error when user is not found", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "user_not_found@correo.com",
      password: "12345678",
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("User not found");

    expect(response.status).not.toBe(201);
  });

  it("It should display 403 error when user is not confirmed", async () => {
    (jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue({
      id: 1,
      confirmed: false,
      password: "hashed_password",
      email: "user_not_confirmed@correo.com",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "user_not_confirmed@correo.com",
      password: "12345678",
    });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("User is not confirmed");

    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(404);
  });

  it("It should display 403 error when user is not confirmed without Mock", async () => {
    const userData = {
      name: "Test",
      confirmed: false,
      password: "hashed_password",
      email: "user_not_confirmed@correo.com",
    };
    await request(app).post("/api/auth/create-account").send(userData);

    const response = await request(app).post("/api/auth/login").send({
      email: userData.email,
      password: userData.password,
    });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("User is not confirmed");

    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(404);
  });

  it("It should display 401 error when user put the wrong password", async () => {
    const finOne = (jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue(
      {
        id: 1,
        confirmed: true,
        password: "12345678",
        email: "juan@correo.com",
      }
    );

    const checkPassword = (
      jest.spyOn(authUtils, "checkPassword") as jest.Mock
    ).mockResolvedValue(false);

    const response = await request(app).post("/api/auth/login").send({
      email: "juan@correo.com",
      password: "wrongPassword",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Password is incorrect");

    expect(finOne).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenCalledTimes(1);

    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(404);
  });

  it("It should login successfully", async () => {
    const finOne = (jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue(
      {
        id: 1,
        confirmed: true,
        password: "12345678",
        email: "juan@correo.com",
      }
    );

    const checkPassword = (
      jest.spyOn(authUtils, "checkPassword") as jest.Mock
    ).mockResolvedValue(true);

    const generateJWT = jest
      .spyOn(jwtUtils, "generateJWT")
      .mockReturnValue("jsonwebtoken");

    const response = await request(app).post("/api/auth/login").send({
      email: "juan@correo.com",
      password: "correctPassword",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body.token).toBe("jsonwebtoken");

    expect(finOne).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenCalledWith("correctPassword", "12345678");
    expect(generateJWT).toHaveBeenCalledTimes(1);
    expect(generateJWT).toHaveBeenLastCalledWith(1);

    expect(response.status).not.toBe(400);
    expect(response.status).not.toBe(404);
  });
});

let jwt: string;
const authenticateUser = async () => {
  jest.restoreAllMocks(); // restore function from jest.spyOn to original implementation

  const response = await request(app).post("/api/auth/login").send({
    email: "juan@correo.com",
    password: "12345678",
  });

  jwt = response.body.token;
  expect(response.status).toBe(201);
};

describe("GET /api/budgets", () => {
  beforeAll(async () => {
    await authenticateUser();
  });

  it("It should reject unauthenticated access to budgets without a jwt", async () => {
    const response = await request(app).get("/api/budgets");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Not authorized");
  });

  it("It should unauthenticated access to budgets without a valid JWT", async () => {
    const response = await request(app)
      .get("/api/budgets")
      .auth("not_valid", { type: "bearer" });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("token no valido");
  });

  it("It should allow to get budgets with a valid JWT", async () => {
    const response = await request(app)
      .get("/api/budgets")
      .auth(jwt, { type: "bearer" });

    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(0);
    expect(response.status).not.toBe(401);
  });
});

describe("POST /api/budgets", () => {
  beforeAll(async () => {
    await authenticateUser();
  });

  it("It should reject unauthenticated post request to budgets without a jwt", async () => {
    const response = await request(app).post("/api/budgets");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Not authorized");
  });

  it("It should display validation when the form is submitted with invalid data", async () => {
    const response = await request(app)
      .post("/api/budgets")
      .auth(jwt, { type: "bearer" })
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(4);
  });

  it("It should create a budget", async () => {
    const response = await request(app)
      .post("/api/budgets")
      .auth(jwt, { type: "bearer" })
      .send({
        name: "Gastos Semana",
        amount: 400,
      });

    expect(response.status).toBe(201);
    expect(response.body).toBe("Budget created succesfully");
  });
});

describe("GET /api/budgets/:budgetId", () => {
  beforeAll(async () => {
    await authenticateUser();
  });

  it("It should reject unauthenticated get request to budgets id without a jwt", async () => {
    const response = await request(app).get("/api/budgets/1");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Not authorized");
  });

  it("It should return 400 bad request when id is not valid", async () => {
    const response = await request(app)
      .get("/api/budgets/not_valid")
      .auth(jwt, { type: "bearer" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toBeTruthy();
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("ID no valid");
  });

  it("It should return 400 bad request when id is not valid", async () => {
    const response = await request(app)
      .get("/api/budgets/300")
      .auth(jwt, { type: "bearer" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toBeTruthy();
    expect(response.body.message).toBe("Budget not found");
  });

  it("It should return budget by ID", async () => {
    const response = await request(app)
      .get("/api/budgets/1")
      .auth(jwt, { type: "bearer" });

    expect(response.status).toBe(201);

    expect(response.status).not.toBe(400);
    expect(response.status).not.toBe(404);
  });
});

describe("PUT /api/budgets/:budgetId", () => {
  beforeAll(async () => {
    await authenticateUser();
  });

  it("It should reject unauthenticated put request to budgets id without a jwt", async () => {
    const response = await request(app).get("/api/budgets/1");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Not authorized");
  });

  it("It should return 400 bad request when id is not valid", async () => {
    const response = await request(app)
      .put("/api/budgets/not_valid")
      .auth(jwt, { type: "bearer" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toBeTruthy();
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("ID no valid");
  });

  it("It should display validation errors if the form is empty", async () => {
    const response = await request(app)
      .put("/api/budgets/300")
      .auth(jwt, { type: "bearer" })
      .send({});

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toBeTruthy();
    expect(response.body.message).toBe("Budget not found");
  });

  it("It should return budget by ID", async () => {
    const response = await request(app)
      .put("/api/budgets/1")
      .auth(jwt, { type: "bearer" })
      .send({
        name: "Gastos trimestrales",
        amount: 100000,
      });

    expect(response.status).toBe(201);

    expect(response.status).not.toBe(400);
    expect(response.status).not.toBe(404);
  });
});

describe("DELETE /api/budgets/:budgetId", () => {
  beforeAll(async () => {
    await authenticateUser();
  });

  it("It should reject unauthenticated delete request to budgets id without a jwt", async () => {
    const response = await request(app).delete("/api/budgets/1");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Not authorized");
  });

  it("It should return 400 bad request when id is not valid", async () => {
    const response = await request(app)
      .delete("/api/budgets/not_valid")
      .auth(jwt, { type: "bearer" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toBeTruthy();
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("ID no valid");
  });

  it("It should delete a budget by ID", async () => {
    const response = await request(app)
      .delete("/api/budgets/1")
      .auth(jwt, { type: "bearer" });

    expect(response.status).toBe(201);

    expect(response.status).not.toBe(400);
    expect(response.status).not.toBe(404);
  });
});
