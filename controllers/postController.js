import { pool } from "../config/db.js";
import { HttpError } from "../utils/HttpError.js";

export const findPostById = async (postId) => {
    const { rows } = await pool.query(`SELECT id, user_id, title, content FROM posts WHERE id = $1`, [postId])

    return rows[0] ?? null;
}

export const paginatePosts = async (req, res) => {
    const minPageValue = req.query.page || 1;
    const minLimitValue = req.query.limit || 10;
    const page = Math.max(1, parseInt(minPageValue));
    const limit = Math.min(100, Math.max(1, parseInt(minLimitValue)));
    const offset = (page - 1) * limit;

    const countResult = await pool.query(`SELECT COUNT(*) FROM posts`);
    const totalPosts = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalPosts / limit);

    if (page > totalPages && totalPosts > 0) {
        throw new HttpError(`Page ${page} does not exist. Total pages: ${totalPages}`, 400, "PAGE_NOT_EXIST")
    }

    const result = await pool.query(
        `
        SELECT users.id as user_id, posts.id as post_id, title, content, posts.created_at
        FROM users JOIN posts
        ON users.id = posts.user_id
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
        `, [limit, offset]
    )

    res.json({
        success: true,
        data: result.rows,
        pagination: {
            currentPage: page,
            perPage: limit,
            totalPosts: totalPosts,
            totalPages: totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    })
}

export const getPostById = async (req, res) => {
    const { postId } = req.params;

    const post = await findPostById(postId);

    if (!post) {
        throw new HttpError('Post not found', 404, "POST_NOT_FOUND")
    }

    const commentsResult = await pool.query(
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

    post.comments = commentsResult.rows;

    res.json({
        success: true,
        data: post
    })
}

export const createPost = async (req, res) => {
    const { title, content } = req.body;
    const userId = req.userId;


    const duplicate = await pool.query(`
            SELECT id, user_id, title, content
            FROM posts
            WHERE title ILIKE $1
            `, [title])

    if (duplicate.rows.length > 0) {
        throw new HttpError("Post with this title already exists", 409, 'DUPLICATE_POST_TITLE')
    }

    const result = await pool.query(`
            INSERT INTO posts (user_id, title, content)
            VALUES ($1, $2, $3)
            RETURNING *
            `, [userId, title, content])

    res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: result.rows[0]
    })
}

export const updatePost = async (req, res) => {
    const { postId } = req.params;
    const { title, content } = req.body;
    const userId = req.userId;


    const post = await findPostById(postId);

    if (!post) {
        throw new HttpError('Post not found', 404, "POST_NOT_FOUND")
    }

    if (post.user_id !== userId) {
        throw new HttpError("This user is not allowed to update this post", 403, "FORBIDDEN")
    }

    let updates = []
    let values = []
    let paramCount = 1;

    if (title !== undefined) {
        updates.push(`title = $${paramCount}`)
        values.push(title)
        paramCount++;
    }

    if (content !== undefined) {
        updates.push(`content = $${paramCount}`)
        values.push(content)
        paramCount++;
    }

    values.push(postId);

    console.log(values.join(", "));


    const result = await pool.query(`
            UPDATE posts
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
            `, values)

    res.json({
        success: true,
        message: "Post updated successfully",
        data: result.rows[0]
    })
}

export const deletePost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.userId;

    const post = await findPostById(postId);

    if (!post) {
        throw new HttpError('Post not found', 404, "POST_NOT_FOUND")
    }

    if (post.user_id !== userId) {
        throw new HttpError("This user is not allowed to delete this post", 403, "FORBIDDEN")
    }

    await pool.query(`DELETE FROM posts WHERE user_id = $1`, [userId])

    res.status(200).json({
        success: true,
        message: "Post deleted successfully"
    })
}

export const searchPost = async (req, res) => {
    const { q } = req.query;

    if (!q) {
        throw new HttpError("Search query 'q' is required", 400, "SEARCH_QUERY_REQUIRED")
    }

    const result = await pool.query(
        `
        SELECT id, user_id, title, content, created_at
        FROM posts
        WHERE title ILIKE $1 OR content ILIKE $1
        ORDER BY created_at DESC
        `, [`%${q}%`]
    )

    res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
    })
}

// Comment controller

const verifyCommentOwnership = (userId, ownerId) => {
    if (ownerId !== userId) {
        throw new HttpError("You are not allowed to modify this comment", 403, "FORBIDDEN");
    }
}

const findCommentById = async (commentId) => {
    const result = await pool.query(`
        SELECT * FROM comments WHERE id = $1
        `, [commentId]);

    return result.rows[0] || null;
}

const getFullComment = async (commentId) => {
    const result = await pool.query(`
        SELECT c.id, c.content, c.post_id, c.owner_id, c.created_at, u.username, u.email
        FROM comments c
        JOIN users u
        ON c.owner_id = u.id
        WHERE c.id = $1
        `, [commentId])
    return result.rows[0];
}

export const getComments = async (req, res) => {
    const { postId } = req.params;

    const post = await findPostById(postId);

    if (!post) {
        throw new HttpError("Post not found", 404, "POST_NOT_FOUND");
    }

    const result = await pool.query(`
        SELECT c.id, c.content, c.post_id, c.owner_id, c.created_at, u.username, u.email
        FROM comments c
        JOIN users u
        ON c.owner_id = u.id
        WHERE c.post_id = $1
        ORDER BY created_at DESC
        `, [postId])

    res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
    })
}

export const createComment = async (req, res) => {
    const { content } = req.body;
    const { postId } = req.params;
    const userId = req.userId;

    const post = await findPostById(postId);

    if (!post) {
        throw new HttpError("Post not found", 404, "POST_NOT_FOUND");
    }

    const result = await pool.query(`
        INSERT INTO comments (content, post_id, owner_id)
        VALUES ($1, $2, $3)
        RETURNING id, content, post_id, owner_id, created_at
        `, [content, postId, userId]);

    const commentId = result.rows[0].id;

    const fullComment = await getFullComment(commentId);

    res.status(201).json({
        success: true,
        message: "Comment successfully created",
        data: fullComment
    })
}

export const updateComment = async (req, res, next) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    const post = await findPostById(postId);

    if (!post) {
        throw new HttpError("Post not found", 404, "POST_NOT_FOUND");
    }

    const comment = await findCommentById(commentId);

    if (!comment) {
        throw new HttpError("Comment not found", 404, "COMMENT_NOT_FOUND");
    }

    verifyCommentOwnership(userId, comment.owner_id);

    await pool.query(`
        UPDATE comments
        SET content = $1
        WHERE id = $2
        RETURNING id, content, post_id, owner_id, created_at
        `, [content, commentId])


    const fullComment = await getFullComment(commentId);

    res.json({
        success: true,
        message: "Comment updated successfully",
        data: fullComment
    })
}

export const deleteComment = async (req, res) => {
    const { postId, commentId } = req.params;
    const userId = req.userId;

    const post = await findPostById(postId);

    if (!post) {
        throw new HttpError("Post not found", 404, "POST_NOT_FOUND");
    }

    const comment = await findCommentById(commentId);

    if (!comment) {
        throw new HttpError("Comment not found", 404, "COMMENT_NOT_FOUND");
    }

    verifyCommentOwnership(userId, comment.owner_id);

    await pool.query(`DELETE FROM comments WHERE id = $1`, [commentId]);

    res.json({
        success: true,
        message: "Comment deleted successfully"
    })
}