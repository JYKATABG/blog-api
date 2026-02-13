import { Router } from "express";
import {
    deleteUser,
    getUserById,
    paginateUsers,
    searchUsers,
    updateUser
} from "../controllers/userController.js";
import {
    createUserValidation,
    deleteUserValidation,
    getUserValidation,
    updateUserValidation,
    validate
} from "../middlewares/validation.js";

const userRouter = Router();

// GET ALL USERS WITH PAGINATION
userRouter.get("/", paginateUsers);

userRouter.get("/search", searchUsers)

// GET USER BY ID
userRouter.get("/:userId", getUserValidation, validate, getUserById)

// CREATE USER
// userRouter.post("/", createUserValidation, validate, createUser)

// UPDATE USER
userRouter.put("/:userId", updateUserValidation, validate, updateUser)

// DELETE USER
userRouter.delete("/:userId", deleteUserValidation, validate, deleteUser)
export default userRouter;