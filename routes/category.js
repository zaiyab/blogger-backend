import express from "express";
import PostCategories from "../models/PostCategories";

const router = express.Router();
import { authGuard, adminGuard } from "../middleware/authMiddleware";

router.post(
  "/createcategory",
  authGuard,
  adminGuard,
  async (req, res, next) => {
    try {
      const categoryName = req.body.name;

      // Check if the category name is provided
      if (!categoryName) {
        const error = new Error("Category name is required");
        return next(error);
      }

      // Check if the category already exists
      const existingCategory = await PostCategories.findOne({
        name: categoryName,
      });
      if (existingCategory) {
        const error = new Error("Category already exists");
        return next(error);
      }

      // Create a new category
      const newCategory = new PostCategories({ name: categoryName });
      await newCategory.save();

      res.status(201).json({
        message: "Category created successfully.",
        category: newCategory,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/allcategories", authGuard, async (req, res, next) => {
  try {
    const categories = await PostCategories.find().lean();
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
