import Comment from "../models/Comment";
import Post from "../models/Post";
import User from "../models/User";

const createComment = async (req, res, next) => {
  try {
    const { desc, slug, parent, replyOnUser } = req.body;

    const post = await Post.findOne({ slug: slug });

    if (!post) {
      const error = new Error("Post was not found");
      return next(error);
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User was not found");
      return next(error);
    }
    const newComment = new Comment({
      user: req.user._id,
      username: user.name,
      desc,
      post: post._id,
      parent,
      replyOnUser,
    });

    const savedComment = await newComment.save();
    return res.json(savedComment);
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { desc } = req.body;

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      const error = new Error("Comment was not found");
      return next(error);
    }

    comment.desc = desc || comment.desc;

    const updatedComment = await comment.save();
    return res.json(updatedComment);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.commentId);
    await Comment.deleteMany({ parent: comment._id });

    if (!comment) {
      const error = new Error("Comment was not found");
      return next(error);
    }

    return res.json({
      message: "Comment is deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getComments = async (req, res, next) => {
  try {
    const comment = await Comment.find({ post: req.body.pid });

    if (!comment) {
      const error = new Error("No comments");
      return next(error);
    }

    return res.json(comment);
  } catch (error) {
    next(error);
  }
};
export { createComment, updateComment, deleteComment, getComments };
