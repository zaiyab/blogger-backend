import { uploadPicture } from "../middleware/uploadPictureMiddleware";
import Post from "../models/Post";
import Comment from "../models/Comment";
import { fileRemover } from "../utils/fileRemover";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
const createPost = async (req, res, next) => {
  try {
    const post = new Post({
      title: req.body.title,
      caption: req.body.caption,
      slug: req.body.slug,
      body: {
        type: "doc",
        content: [],
      },
      links: req.body.links,
      photo: "",
      user: req.user._id,
      categories: req.body.category,
      tags: req.body.tags,
    });
    const createdPost = await post.save();

    return res.json(createdPost);
  } catch (error) {
    next(error);
  }
};
const approvePost = async (req, res, next) => {
  try {
    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { active: req.body.active } }, // Modify fields as needed
      { new: true } // Return the updated document
    );
    if (!updatePost) {
      const error = new Error("No Post");
      return next(error);
    }

    return res.json(updatedPost);
  } catch (error) {
    next(error);
  }
};
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });

    if (!post) {
      const error = new Error("Post aws not found");
      next(error);
      return;
    }

    const upload = uploadPicture.single("postPicture");

    const handleUpdatePostData = async (data) => {
      const { title, caption, slug, body, tags, categories, links } =
        JSON.parse(data);
      post.title = title || post.title;
      post.caption = caption || post.caption;
      post.slug = slug || post.slug;
      post.body = body || post.body;
      post.tags = JSON.parse(req.body.tags) || post.tags;
      post.categories = categories || post.categories;
      post.links = JSON.parse(req.body.links);
      const updatedPost = await post.save();
      return res.json(updatedPost);
    };

    upload(req, res, async function (err) {
      if (err) {
        const error = new Error(
          "An unknown error occured when uploading " + err.message
        );
        next(error);
      } else {
        // every thing went well
        if (req.file) {
          let filename;
          filename = post.photo;
          if (filename) {
            fileRemover(filename);
          }
          post.photo = req.file.filename;
          handleUpdatePostData(req.body.document);
        } else {
          let filename;
          filename = post.photo;
          post.photo = "";
          fileRemover(filename);
          handleUpdatePostData(req.body.document);
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findOneAndDelete({ slug: req.params.slug });

    if (!post) {
      const error = new Error("Post aws not found");
      return next(error);
    }

    await Comment.deleteMany({ post: post._id });

    return res.json({
      message: "Post is successfully deleted",
    });
  } catch (error) {
    next(error);
  }
};

// const getPost = async (req, res, next) => {
//   try {
//     const post = await Post.findOne({ slug: req.params.slug }).populate([
//       {
//         path: "user",
//         select: ["avatar", "name"],
//       },
//       {
//         path: "comments",
//         match: {
//           check: true,
//           parent: null,
//         },
//         populate: [
//           {
//             path: "user",
//             select: ["avatar", "name"],
//           },
//           {
//             path: "replies",
//             match: {
//               check: true,
//             },
//             populate: [
//               {
//                 path: "user",
//                 select: ["avatar", "name"],
//               },
//             ],
//           },
//         ],
//       },
//     ]);

//     if (!post) {
//       const error = new Error("Post was not found");
//       return next(error);
//     }

//     return res.json(post);
//   } catch (error) {
//     next(error);
//   }
// };
const getPost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate([
      {
        path: "user",
        select: ["avatar", "name"],
      },
      {
        path: "categories", // Populate categories field
      },
      {
        path: "comments",
        match: {
          check: true,
          parent: null,
        },
        populate: [
          {
            path: "user",
            select: ["avatar", "name"],
          },
          {
            path: "replies",
            match: {
              check: true,
            },
            populate: [
              {
                path: "user",
                select: ["avatar", "name"],
              },
            ],
          },
        ],
      },
    ]);

    if (!post) {
      const error = new Error("Post was not found");
      return next(error);
    }

    return res.json(post);
  } catch (error) {
    next(error);
  }
};

// const getAllPosts = async (req, res, next) => {
//   try {
//     const filter = req.query.searchKeyword;
//     let where = {};
//     if (filter) {
//       where.title = { $regex: filter, $options: "i" };
//     }
//     let query = Post.find(where);
//     const page = parseInt(req.query.page) || 1;
//     const pageSize = parseInt(req.query.limit) || 12;
//     const skip = (page - 1) * pageSize;
//     const total = await Post.find(where).countDocuments();
//     const pages = Math.ceil(total / pageSize);

//     res.header({
//       "x-filter": filter,
//       "x-totalcount": JSON.stringify(total),
//       "x-currentpage": JSON.stringify(page),
//       "x-pagesize": JSON.stringify(pageSize),
//       "x-totalpagecount": JSON.stringify(pages),
//     });

//     if (page > pages) {
//       return res.json([]);
//     }

//     const result = await query
//       .skip(skip)
//       .limit(pageSize)
//       .populate([
//         {
//           path: "user",
//           select: ["avatar", "name", "verified"],
//         },
//         {
//           path: "categories", // Populate categories field
//         },
//       ])
//       .sort({ updatedAt: "desc" });

//     return res.json(result);
//   } catch (error) {
//     next(error);
//   }
// };
const getAllPosts = async (req, res, next) => {
  try {
    const filter = req.query.searchKeyword;
    let where = {};
    if (filter) {
      where.title = { $regex: filter, $options: "i" };
    }

    if (req.query.category) {
      const categoryId = mongoose.Types.ObjectId(req.query.category);

      where.categories = categoryId; // Filter by category
    }

    let query = Post.find(where);

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * pageSize;
    const total = await Post.find(where).countDocuments();
    const pages = Math.ceil(total / pageSize);

    res.header({
      "x-filter": filter,
      "x-totalcount": JSON.stringify(total),
      "x-currentpage": JSON.stringify(page),
      "x-pagesize": JSON.stringify(pageSize),
      "x-totalpagecount": JSON.stringify(pages),
    });

    if (page > pages) {
      return res.json([]);
    }

    const result = await query
      .skip(skip)
      .limit(pageSize)
      .populate([
        {
          path: "user",
          select: ["avatar", "name", "verified"],
        },
        {
          path: "categories",
        },
      ])
      .sort({ updatedAt: "desc" });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export {
  createPost,
  updatePost,
  deletePost,
  getPost,
  getAllPosts,
  approvePost,
};
