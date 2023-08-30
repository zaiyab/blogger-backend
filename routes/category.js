import express from "express";
import PostCategories from "../models/PostCategories";

const router = express.Router();
import { authGuard, adminGuard } from "../middleware/authMiddleware";
import Post from "../models/Post";

router.post("/create", authGuard, adminGuard, async (req, res, next) => {
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

    res.status(200).json(newCategory);
  } catch (error) {
    next(error);
  }
});

router.post("/allcategories", authGuard, async (req, res, next) => {
  try {
    const page = parseInt(req.body.page) || 1;
    const pageSize = parseInt(req.body.limit) || 10;
    const skip = (page - 1) * pageSize;

    const searchKeyword = req.body.searchKeyword || ""; // Get the search keyword from the request body

    const query = {
      // Modify this condition to match the fields you want to search in
      name: { $regex: searchKeyword, $options: "i" },
    };

    let categories = await PostCategories.find(query)
      .limit(pageSize)
      .skip(skip)
      .lean();

    if (categories) {
      const total = await PostCategories.countDocuments(query); // Count documents based on query
      const pages = Math.ceil(total / pageSize);

      res.header({
        "x-totalcount": JSON.stringify(total),
        "x-currentpage": JSON.stringify(page),
        "x-pagesize": JSON.stringify(pageSize),
        "x-totalpagecount": JSON.stringify(pages),
      });

      return res.status(200).json({ categories });
    } else {
      let error = new Error("Categories not found");
      error.statusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});
router.post("/delete", authGuard, async (req, res, next) => {
  try {
    const catgory = await PostCategories.findOneAndDelete({ _id: req.body.id });

    if (!catgory) {
      const error = new Error("No category");
      return next(error);
    }

    await Post.deleteMany({ categories: catgory._id });

    return res.status(200).json(catgory);
  } catch (error) {
    next(error);
  }
});
router.post("/edit", authGuard, adminGuard, async (req, res, next) => {
  try {
    const catgory = await PostCategories.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { name: req.body.name } }, // Modify fields as needed
      { new: true } // Return the updated document
    );

    if (!catgory) {
      const error = new Error("No category");
      return next(error);
    }

    return res.status(200).json(catgory);
  } catch (error) {
    next(error);
  }
});
export default router;
