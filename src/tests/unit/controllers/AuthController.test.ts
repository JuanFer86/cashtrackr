import { createRequest, createResponse } from "node-mocks-http";
import { AuthController } from "../../../controllers/AuthController";
import User from "../../../models/User";
import { checkPassword, hashPassword } from "../../../utils/auth";
import { generateToken } from "../../../utils/token";
import { AuthEmail } from "../../../emails/AuthEmail";
import { generateJWT } from "../../../utils/jwt";

// jest.mock("../../../models/User", () => ({
//     findOne: jest.fn(),
// }))
jest.mock("../../../models/User"); // automatically mocks all methods in User model
jest.mock("../../../utils/auth");
jest.mock("../../../utils/token");
jest.mock("../../../utils/jwt");

describe("AuthController.createAccount", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return 409 status an error message if email already exists", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(true);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/create-account",
      body: {
        email: "test@test.com",
        password: "testpassword",
      },
    });
    const res = createResponse();

    await AuthController.createAccount(req, res);

    expect(res.statusCode).toBe(409);
    expect(res._getJSONData()).toHaveProperty(
      "message",
      "Email already exists"
    );
    expect(User.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledTimes(1);
  });

  it("should register a new user and return a success message", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(false);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/create-account",
      body: {
        name: "Test name",
        email: "test@test.com",
        password: "testpassword",
      },
    });
    const res = createResponse();

    const mockUser = {
      ...req.body,
      save: jest.fn(),
    };

    (User.create as jest.Mock).mockResolvedValue(mockUser); //mockResolveValue for asynchronous functions
    (hashPassword as jest.Mock).mockResolvedValue("hashedpassword");
    (generateToken as jest.Mock).mockReturnValue("123456"); // mockReturnValue for synchronous functions
    jest
      .spyOn(AuthEmail, "sendConfirmationEmail")
      .mockImplementation(() => Promise.resolve());

    await AuthController.createAccount(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toHaveProperty(
      "message",
      "Account created successfully"
    );
    expect(User.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(User.create).toHaveBeenCalled();
    expect(User.create).toHaveBeenCalledTimes(1);
    expect(User.create).toHaveBeenCalledWith(req.body);
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockUser.save).toHaveBeenCalledTimes(1);
    expect(mockUser.password).toBe("hashedpassword");
    expect(mockUser.token).toBe("123456");
    expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1);
    expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({
      name: req.body.name,
      email: req.body.email,
      token: "123456",
    });
  });
});

describe("AuthController.login", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return 404 if user is not found", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(false);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "testpassword",
      },
    });
    const res = createResponse();

    await AuthController.login(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toHaveProperty("message", "User not found");
    expect(User.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledTimes(1);
  });

  it("should return 403 if user has not been confirmed", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      email: "test@test.com",
      password: "testpassword",
      confirmed: false,
    });

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "testpassword",
      },
    });
    const res = createResponse();

    await AuthController.login(req, res);

    expect(res.statusCode).toBe(403);
    expect(res._getJSONData()).toHaveProperty(
      "message",
      "User is not confirmed"
    );
    expect(User.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledTimes(1);
  });

  it("should return 401 if user password is wrong", async () => {
    const userMock = {
      id: 1,
      email: "test@test.com",
      password: "testpassword",
      confirmed: true,
    };
    (User.findOne as jest.Mock).mockResolvedValue(userMock);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "testpassword",
      },
    });
    const res = createResponse();
    (checkPassword as jest.Mock).mockResolvedValue(false);

    await AuthController.login(req, res);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData()).toHaveProperty(
      "message",
      "Password is incorrect"
    );
    expect(User.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenCalled();
    expect(checkPassword).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenLastCalledWith(
      req.body.password,
      userMock.password
    );
  });

  it("should authenticate user and return JWT", async () => {
    const userMock = {
      id: 1,
      email: "test@test.com",
      password: "testpassword",
      confirmed: true,
    };

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "testpassword",
      },
    });
    const res = createResponse();

    const fakeJwt = "fake_jwt";
    (User.findOne as jest.Mock).mockResolvedValue(userMock);
    (checkPassword as jest.Mock).mockResolvedValue(true);
    (generateJWT as jest.Mock).mockReturnValue(fakeJwt);

    await AuthController.login(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toHaveProperty("token", fakeJwt);
    expect(User.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenLastCalledWith(
      req.body.password,
      userMock.password
    );
    expect(generateJWT).toHaveBeenCalledTimes(1);
    expect(generateJWT).toHaveBeenLastCalledWith(userMock.id);
  });
});

describe("AuthController.updateUser", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return 409 status an error message if email already exists", async () => {
    const userMock = {
      id: 2,
      email: "testnew@test.com",
      password: "testnewpassword",
      confirmed: true,
    };

    const req = createRequest({
      method: "PUT",
      url: "/api/auth/user",
      body: {
        name: "new Test name",
        email: "testnew@test.com",
      },
    });

    const res = createResponse();

    (User.findOne as jest.Mock).mockResolvedValue(userMock);

    await AuthController.updateUser(req, res);

    expect(res.statusCode).toBe(409);
    expect(res._getJSONData()).toHaveProperty(
      "message",
      "Email already exists"
    );
    expect(User.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledTimes(1);
  });

  it("should update user and return a success message", async () => {
    const userMock = {
      id: 2,
      email: "test@test.com",
      password: "testpassword",
      confirmed: true,
      save: jest.fn(),
    };

    const req = createRequest({
      method: "PUT",
      url: "/api/auth/user",
      body: {
        name: "new Test name",
        email: "testnew@test.com",
      },
      user: { id: 1 },
    });

    const res = createResponse();

    (User.findOne as jest.Mock).mockResolvedValue(false);
    (User.findByPk as jest.Mock).mockResolvedValue(userMock);
    jest
      .spyOn(AuthEmail, "sendConfirmationNewEmail")
      .mockImplementation(() => Promise.resolve());

    await AuthController.updateUser(req, res);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toHaveProperty("message", "User updated");
  });
});
