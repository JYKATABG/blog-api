import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as authRepo from "../repositories/auth.repository.js";

export const register = async (username, email, password) => {
  const userExists = await authRepo.getUserByEmail(email);

  if (userExists.length > 0) {
    throw new HttpError("User already exists", 409, "USER_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await authRepo.register(username, email, passwordHash);

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return { user, token };
};

export const login = async (email, password) => {
  const userData = await authRepo.getUserByEmail(email);

  if (userData.length === 0) {
    throw new HttpError("Invalid credentials", 400, "INVALID_CREDENTIALS");
  }

  const user = userData[0];

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new HttpError("Invalid credentials", 400, "INVALID_CREDENTIALS");
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return { user, token };
};
