import express from "express";
const router = express.Router();
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  updatePost,
  approvePost,
} from "../controllers/postControllers";
import { authGuard, adminGuard } from "../middleware/authMiddleware";

router.route("/").post(authGuard, adminGuard, createPost).get(getAllPosts);
router.post("/approvePost", authGuard, approvePost);

router
  .route("/:slug")
  .put(authGuard, adminGuard, updatePost)
  .delete(authGuard, adminGuard, deletePost)
  .get(getPost);

export default router;
