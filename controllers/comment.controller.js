import * as commentServ from "../services/comment.service.js";

export const getComments = async (req, res) => {
  const { postId } = req.params;

  const result = await commentServ.getComments(postId);

  res.json({
    success: true,
    count: result.length,
    data: result,
  });
};

export const createComment = async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;
  const userId = req.userId;

  const fullComment = await commentServ.createComment(content, postId, userId);

  res.status(201).json({
    success: true,
    message: "Comment successfully created",
    data: fullComment,
  });
};

export const updateComment = async (req, res, next) => {
  const { postId, commentId } = req.params;
  const { content } = req.body;
  const { userId, isAdmin } = req.user;

  const fullComment = await commentServ.updateComment(
    postId,
    commentId,
    content,
    userId,
    isAdmin,
  );

  res.json({
    success: true,
    message: "Comment updated successfully",
    data: fullComment,
  });
};

export const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId, isAdmin } = req.user;

  await commentServ.deleteComment(postId, commentId, userId, isAdmin);

  res.json({
    success: true,
    message: "Comment deleted successfully",
  });
};
