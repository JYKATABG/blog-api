import { Router } from "express";
import { login, register } from "../controllers/authController.js";
import { createUserValidation, loginValidation, validate } from "../middlewares/validation.js";

const authRouter = Router();

authRouter.post("/register", createUserValidation, validate, register);

authRouter.post("/login", loginValidation, validate, login);

export default authRouter;