import { pool } from "../config/db.js";

export const getUserByEmail = async (email) => {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);

  return result.rows;
};

export const register = async (username, email, passwordHash) => {
  const result = await pool.query(
    `
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3) RETURNING id, username, email, created_at, role`,
    [username, email, passwordHash],
  );

  return result.rows[0];
};
