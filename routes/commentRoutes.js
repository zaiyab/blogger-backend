import express from "express";

const router = express.Router();
import {
  createComment,
  deleteComment,
  updateComment,
  getComments,
  approveComments,
  delComments,
} from "../controllers/commentControllers";
import { authGuard, adminGuard } from "../middleware/authMiddleware";

router.post("/", authGuard, createComment);
router
  .route("/:commentId")
  .put(authGuard, updateComment)
  .delete(authGuard, deleteComment);

router.post("/getcomments", authGuard, getComments);
router.post("/approvecomments", authGuard, adminGuard, approveComments);
router.post("/delcomments", authGuard, adminGuard, delComments);

export default router;
