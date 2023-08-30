import express from "express";
const router = express.Router();
import {
  registerUser,
  loginUser,
  userProfile,
  updateProfile,
  updateProfilePicture,
  getUsers,
  deleteUser,
  approveUsers,
} from "../controllers/userControllers";
import { authGuard, adminGuard } from "../middleware/authMiddleware";

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authGuard, userProfile);
router.put("/updateProfile", authGuard, updateProfile);
router.put("/updateProfilePicture", authGuard, updateProfilePicture);
router.post("/getusers", authGuard, getUsers);
router.post("/approveusers", authGuard, adminGuard, approveUsers);
router.post("/deleteusers", authGuard, adminGuard, deleteUser);

export default router;
