import { Router } from "express";
import {
  deleteUser,
  getUserById,
  paginateUsers,
  searchUsers,
  updateRole,
  updateUser,
} from "../controllers/userController.js";
import {
  createUserValidation,
  deleteUserValidation,
  getUserValidation,
  updateUserValidation,
  validate,
} from "../middlewares/validation.js";
import authenticate from "../middlewares/authenticate.js";
import { isAdmin } from "../middlewares/auth.js";

const userRouter = Router();

// GET ALL USERS WITH PAGINATION
userRouter.get("/", paginateUsers);

userRouter.get("/search", authenticate, isAdmin, searchUsers);

// GET USER BY ID
userRouter.get("/:userId", authenticate, isAdmin, getUserValidation, validate, getUserById);

// CREATE USER
// userRouter.post("/", createUserValidation, validate, createUser)

// UPDATE USER
userRouter.put(
  "/:userId",
  authenticate,
  isAdmin,
  updateUserValidation,
  validate,
  updateUser,
);

// DELETE USER
userRouter.delete(
  "/:userId",
  authenticate,
  isAdmin,
  deleteUserValidation,
  validate,
  deleteUser,
);

userRouter.patch("/:userId/role", authenticate, isAdmin, updateRole);
export default userRouter;
