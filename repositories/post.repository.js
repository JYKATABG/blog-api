import { pool } from "../config/db.js"

export const findPostById = async (postId) => {
    const result = await pool.query(
        `SELECT id, user_id, title, content
        FROM posts
        WHERE id = $1`, [postId]
    )

    return result.rows[0] ?? null;
}

export const countPosts = async () => {
    const result = await pool.query(`SELECT COUNT(*) FROM posts`)

    return result.rows[0].count;
}

export const paginatePosts = async (limit, offset) => {
    const result = await pool.query(
        `SELECT users.id as user_id, posts.id as post_id, title, content, posts.created_at
        FROM users JOIN posts
        ON users.id = posts.user_id
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2`
        , [limit, offset]
    )

    return result.rows;
}

export const getComments = async (postId) => {
    const result = await pool.query(
        `
        SELECT 
        c.id, c.content, c.owner_id, c.created_at,
        u.username, u.email
        FROM comments c
        JOIN users u
        ON c.owner_id = u.id
        WHERE post_id = $1
        ORDER BY created_at DESC
        `, [postId]
    )

    return result.rows;
}

export const getDuplicatePost = async (title) => {
    const result = await pool.query(
        `
        SELECT id, user_id, title, content
        FROM posts
        WHERE title ILIKE $1
        `, [title]
    )

    return result;
}

export const createPost = async (userId, title, content) => {
    const result = await pool.query(
        `
        INSERT INTO posts (user_id, title, content)
        VALUES ($1, $2, $3)
        RETURNING *
        `, [userId, title, content]
    )

    return result.rows[0];
}

export const updatePost = async (updates, values, paramCount) => {
    const result = await pool.query(
        `
        UPDATE posts
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
        `, values
    )

    return result.rows[0];
}

export const deletePost = async (userId) => {
    await pool.query(`DELETE FROM posts WHERE user_id = $1`, [userId])
}

export const searchPost = async (q) => {
    const result = await pool.query(
        `
        SELECT id, user_id, title, content, created_at
        FROM posts
        WHERE title ILIKE $1 OR content ILIKE $1
        ORDER BY created_at DESC
        `, [`%${q}%`]
    )

    return result.rows
}