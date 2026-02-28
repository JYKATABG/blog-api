import * as postRepo from "../repositories/post.repository.js"
import { HttpError } from "../utils/HttpError.js";

export const paginatePosts = async (minPageValue, minLimitValue) => {
    const page = Math.max(1, parseInt(minPageValue));
    const limit = Math.min(100, Math.max(1, parseInt(minLimitValue)));
    const offset = (page - 1) * limit;

    const totalPosts = await postRepo.countPosts()
    const totalPages = Math.ceil(totalPosts / limit);

    if (page > totalPages && totalPosts > 0)
        throw new HttpError(`Page ${page} does not exist. Total pages: ${totalPages}`, 400, "PAGE_NOT_EXIST")


    const posts = await postRepo.paginatePosts(limit, offset);

    return {
        posts,
        pagination: {
            currentPage: page,
            perPage: limit,
            totalPosts: totalPosts,
            totalPages: totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    }
}

export const getPostById = async (postId) => {
    const post = await postRepo.findPostById(postId);

    if (!post)
        throw new HttpError('Post not found', 404, "POST_NOT_FOUND")

    const commentsResult = await postRepo.getComments(postId);

    post.comments = commentsResult;

    return post;
}

export const createPost = async (userId, title, content) => {
    const result = await postRepo.createPost(userId, title, content)

    return result.rows[0]
}

export const updatePost = async (
    postId,
    user,
    title,
    content) => {
    const post = await postRepo.findPostById(postId);

    if (!post) {
        throw new HttpError('Post not found', 404, "POST_NOT_FOUND")
    }

    if (post.user_id !== user.userId && !user.isAdmin) {
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

    if (updates.length === 0) {
        throw new HttpError("No fields provided for update", 400, "EMPTY_FIELDS");
    }

    values.push(postId);

    const result = await postRepo.updatePost(updates, values, paramCount);

    return result;
}

export const deletePost = async (postId, userId) => {
    const post = await findPostById(postId);

    if (!post) {
        throw new HttpError('Post not found', 404, "POST_NOT_FOUND")
    }

    if (post.user_id !== userId) {
        throw new HttpError("This user is not allowed to delete this post", 403, "FORBIDDEN")
    }

    return await postRepo.deletePost(userId);
}

export const searchPost = async (q) => {
    if (!q) {
        throw new HttpError("Search query 'q' is required", 400, "SEARCH_QUERY_REQUIRED")
    }

    const result = await postRepo.searchPost(q);

    return result;
}