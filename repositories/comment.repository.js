import { pool } from "../config/db.js";

export const findCommentById = async (commentId) => {
  const result = await pool.query(
    `
    SELECT * FROM comments WHERE id = $1
    `,
    [commentId],
  );

  return result.rows[0] || null;
};

export const getFullComment = async (commentId) => {
  const result = await pool.query(
    `
        SELECT c.id, c.content, c.post_id, c.owner_id, c.created_at, u.username, u.email
        FROM comments c
        JOIN users u
        ON c.owner_id = u.id
        WHERE c.id = $1
        `,
    [commentId],
  );
  return result.rows[0];
};

export const getComments = async (postId) => {
  const result = await pool.query(
    `
        SELECT c.id, c.content, c.post_id, c.owner_id, c.created_at, u.username, u.email
        FROM comments c
        JOIN users u
        ON c.owner_id = u.id
        WHERE c.post_id = $1
        ORDER BY created_at DESC
        `,
    [postId],
  );

  return result.rows;
};

export const createComment = async (content, postId, userId) => {
  const result = await pool.query(
    `
        INSERT INTO comments (content, post_id, owner_id)
        VALUES ($1, $2, $3)
        RETURNING id, content, post_id, owner_id, created_at
        `,
    [content, postId, userId],
  );

  return result.rows[0];
};

export const updateComment = async (content, commentId) => {
  return await pool.query(
    `
        UPDATE comments
        SET content = $1
        WHERE id = $2
        RETURNING id, content, post_id, owner_id, created_at
        `,
    [content, commentId],
  );
};

export const deleteComment = async (commentId) => {
  return await pool.query(`DELETE FROM comments WHERE id = $1`, [commentId]);
};
