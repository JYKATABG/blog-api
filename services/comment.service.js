import * as commentRepo from "../repositories/comment.repository.js";
import { getPostOrThrow } from "../services/post.service.js";
import { HttpError } from "../utils/HttpError.js";

const verifyCommentOwnership = (userId, ownerId, isAdmin) => {
  if (ownerId !== userId && !isAdmin) {
    throw new HttpError(
      "You are not allowed to modify this comment",
      403,
      "FORBIDDEN",
    );
  }
};

export const getComments = async (postId) => {
  await getPostOrThrow(postId);

  const result = await commentRepo.getComments(postId);

  return result;
};

export const createComment = async (content, postId, userId) => {
  await getPostOrThrow(postId);

  const newComment = await commentRepo.createComment(content, postId, userId);

  const fullComment = await commentRepo.getFullComment(newComment.id);

  return fullComment;
};

export const updateComment = async (
  postId,
  commentId,
  content,
  userId,
  isAdmin,
) => {
  await getPostOrThrow(postId);

  const comment = await commentRepo.findCommentById(commentId);

  if (!comment) {
    throw new HttpError("Comment not found", 404, "COMMENT_NOT_FOUND");
  }

  verifyCommentOwnership(userId, comment.owner_id, isAdmin);

  await commentRepo.updateComment(content, commentId);

  const fullComment = await commentRepo.getFullComment(commentId);

  return fullComment;
};

export const deleteComment = async (postId, commentId, userId, isAdmin) => {
  await getPostOrThrow(postId);

  const comment = await commentRepo.findCommentById(commentId);

  if (!comment) {
    throw new HttpError("Comment not found", 404, "COMMENT_NOT_FOUND");
  }

  verifyCommentOwnership(userId, comment.owner_id, isAdmin);

  await commentRepo.deleteComment(commentId);
};
