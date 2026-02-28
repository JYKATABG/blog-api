import { pool } from "../config/db.js";

export const findUserById = async (userId) => {
  const { rows } = await pool.query(
    `
        SELECT id, username, email, role FROM users
        WHERE id = $1
        `,
    [userId],
  );

  return rows[0] ?? null;
};

export const getUserRole = async (userId) => {
  const result = await pool.query(`SELECT role FROM users WHERE id = $1`, [
    userId,
  ]);

  return result.rows[0]?.role ?? null;
};

export const getPaginatedUsers = async (limit, offset) => {
  const result = await pool.query(
    `SELECT id, email, username, role, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
        `,
    [limit, offset],
  );
  return result.rows;
};

export const countUsers = async () => {
  const result = await pool.query(`SELECT COUNT(*) FROM users`);
  return parseInt(result.rows[0].count);
};

export const updateUser = async (username, email, userId) => {
  const result = await pool.query(
    `
       UPDATE users
        SET username = $1, email = $2
        WHERE id = $3
        RETURNING *`,
    [username, email, userId],
  );
  return result.rows[0];
};

export const deleteUser = async (userId) => {
  await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
};

export const searchUsers = async (q) => {
  const result = await pool.query(
    `SELECT id, email, username
        FROM users
        WHERE username ILIKE $1 OR email ILIKE $1`,
    [`%${q}%`],
  );

  return result.rows;
};

export const updateRole = async (role, userId) => {
  const result = await pool.query(
    `UPDATE users
        SET role = $1
        WHERE id = $2
        RETURNING id, username, email, role`,
    [role, userId],
  );

  return result.rows[0];
};
