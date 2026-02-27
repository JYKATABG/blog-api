import { pool } from "../config/db.js";
import { HttpError } from "../utils/HttpError.js";

export const isAdmin = async (req, res, next) => {
  const userId = req.userId;

  const result = await pool.query(`SELECT role FROM users WHERE id = $1`, [
    userId,
  ]);

  if (!result.rows[0]) {
    throw new HttpError("User not found", 404, "USER_NOT_FOUND");
  }

  if (result.rows[0].role !== "admin") {
    throw new HttpError("Access denied", 403, "FORBIDDEN");
  }

  next();
};
