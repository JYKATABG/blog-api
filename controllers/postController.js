import { pool } from "../config/db.js";
import { HttpError } from "../utils/HttpError.js";
import * as postService from "../services/post.service.js"

export const findPostById = async (postId) => {
    const { rows } = await pool.query(`SELECT id, user_id, title, content FROM posts WHERE id = $1`, [postId])

    return rows[0] ?? null;
}

export const paginatePosts = async (req, res) => {
    const minPageValue = req.query.page || 1;
    const minLimitValue = req.query.limit || 10;

    const result = await postService.paginatePosts(minPageValue, minLimitValue);

    res.json({
        success: true,
        data: result.posts,
        pagination: result.pagination
    })
}

export const getPostById = async (req, res) => {
    const { postId } = req.params;

    const post = await postService.getPostById(postId);

    res.json({
        success: true,
        data: post
    })
}

export const createPost = async (req, res) => {
    const { title, content } = req.body;
    const userId = req.userId;

    const result = await postService.createPost(userId, title, content)

    res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: result
    })
}

export const updatePost = async (req, res) => {
    const { postId } = req.params;
    const { title, content } = req.body;
    const user = req.user;

    const result = await postService.updatePost(postId, user, title, content);

    res.json({
        success: true,
        message: "Post updated successfully",
        data: result
    })
}

export const deletePost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.userId;

    await postService.deletePost(postId, userId);

    res.status(200).json({
        success: true,
        message: "Post deleted successfully"
    })
}

export const searchPost = async (req, res) => {
    const { q } = req.query;

    const result = await postService.searchPost(q);

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