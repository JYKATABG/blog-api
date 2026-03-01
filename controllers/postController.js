import * as postService from "../services/post.service.js";

export const paginatePosts = async (req, res) => {
  const minPageValue = req.query.page || 1;
  const minLimitValue = req.query.limit || 10;

  const result = await postService.paginatePosts(minPageValue, minLimitValue);

  res.json({
    success: true,
    data: result.posts,
    pagination: result.pagination,
  });
};

export const getPostById = async (req, res) => {
  const { postId } = req.params;

  const post = await postService.getPostById(postId);

  res.json({
    success: true,
    data: post,
  });
};

export const createPost = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.userId;

  const result = await postService.createPost(userId, title, content);

  res.status(201).json({
    success: true,
    message: "Post created successfully",
    data: result,
  });
};

export const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;
  const user = req.user;

  const result = await postService.updatePost(postId, user, title, content);

  res.json({
    success: true,
    message: "Post updated successfully",
    data: result,
  });
};

export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId;

  await postService.deletePost(postId, userId);

  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
};

export const searchPost = async (req, res) => {
  const { q } = req.query;

  const result = await postService.searchPost(q);

  res.json({
    success: true,
    count: result.rows.length,
    data: result.rows,
  });
};
