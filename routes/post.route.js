import { Router } from "express";
import {
  createPost,
  deletePost,
  getPostById,
  paginatePosts,
  searchPost,
  updatePost,
} from "../controllers/post.controller.js";
import authenticate from "../middlewares/authenticate.js";
import {
  createAndUpdateComment,
  createPostValidation,
  deleteCommentValidation,
  deletePostValidation,
  getPostValidation,
  updatePostValidation,
  validate,
} from "../middlewares/validation.js";
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "../controllers/comment.controller.js";

const postRouter = Router();

postRouter.get("/", paginatePosts);

postRouter.get("/search", searchPost);

postRouter.get("/:postId", getPostValidation, validate, getPostById);

postRouter.post("/", authenticate, createPostValidation, validate, createPost);

postRouter.put(
  "/:postId",
  authenticate,
  updatePostValidation,
  validate,
  updatePost,
);

postRouter.delete(
  "/:postId",
  authenticate,
  deletePostValidation,
  validate,
  deletePost,
);

// Comment routes

postRouter.get("/:postId/comments", getComments);
postRouter.post(
  "/:postId/comments",
  authenticate,
  createAndUpdateComment,
  validate,
  createComment,
);
postRouter.put(
  "/:postId/comments/:commentId",
  authenticate,
  createAndUpdateComment,
  validate,
  updateComment,
);
postRouter.delete(
  "/:postId/comments/:commentId",
  authenticate,
  deleteCommentValidation,
  validate,
  deleteComment,
);

export default postRouter;
