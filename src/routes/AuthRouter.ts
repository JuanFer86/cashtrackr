import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { limiter } from "../config/limiter";
import { authenticate } from "../middleware/auth";

const router = Router();

//limit request in this router
router.post("/", limiter);

router.post(
  "/create-account",
  body("name").notEmpty().withMessage("Name can not be empty"),
  body("email").notEmpty().isEmail().withMessage("Email is not valid"),
  body("password")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  handleInputErrors,
  AuthController.createAccount
);

router.post(
  "/confirm-account",
  //   limiter,
  body("token")
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage("Token not valid"),
  handleInputErrors,
  AuthController.confirmAccount
);

router.post(
  "/login",
  body("email").notEmpty().isEmail().withMessage("Email is not valid"),
  body("password").notEmpty().withMessage("Password is required"),
  handleInputErrors,
  AuthController.login
);

router.post(
  "/forgot-password",
  body("email").notEmpty().isEmail().withMessage("Email is not valid"),
  handleInputErrors,
  AuthController.forgotPassword
);

router.post(
  "/validate-token",
  body("token")
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage("Token not valid"),
  handleInputErrors,
  AuthController.validateToken
);

router.post(
  "/reset-password/:token",
  param("token")
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage("Token not valid"),
  body("password")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  handleInputErrors,
  AuthController.resetPasswordWithToken
);

router.get("/user", authenticate, AuthController.user);

router.put(
  "/user",
  authenticate,
  body("name").notEmpty().withMessage("Name can not be empty"),
  body("email").notEmpty().isEmail().withMessage("Email is not valid"),
  handleInputErrors,
  AuthController.updateUser
);

router.post(
  "/update-password",
  authenticate,
  body("current_password")
    .notEmpty()
    .withMessage("Password must be at least 8 characters long"),
  body("password")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("New Password must be at least 8 characters long"),
  handleInputErrors,
  AuthController.updateCurrentUserPassword
);

router.post(
  "/check-password",
  authenticate,
  body("password")
    .notEmpty()
    .withMessage("Password must be at least 8 characters long"),
  handleInputErrors,
  AuthController.checkPassword
);

export default router;
