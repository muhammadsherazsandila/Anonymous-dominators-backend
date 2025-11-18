import Post from "../models/post.model";
import User from "../models/user.model";
import { formate_date_time } from "../utils/date_time_formater";
import { delete_cloudinary_image } from "../utils/delete_cloudinary_image";
import { verify_jwt_token } from "../utils/token";

export const create_post = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(200).json({ message: "Token not found" });
  }
  const payload = verify_jwt_token(token);
  if (!payload) {
    return res.status(200).json({ message: "Invalid token" });
  }
  const user = await User.findOne({ email: payload.email });
  if (!user) {
    return res.status(200).json({ message: "User not found" });
  }

  const { description, code, day } = req.body;
  const post = await Post.findOne({ day });
  if (post) {
    return res
      .status(200)
      .json({ message: "Post for this day already exists." });
  }
  const new_post = new Post({
    description,
    images: req.files
      ? req.files.map((file) => {
          return { url: file.path, public_id: file.filename };
        })
      : [],
    code,
    day,
    user: user._id,
  });
  await new_post.save();

  user.posts.push(new_post._id);
  await user.save();

  res
    .status(200)
    .json({ message: "Post created successfully", post: new_post });
};

export const delete_post = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(200).json({ message: "Token not found" });
  }
  const payload = verify_jwt_token(token);
  if (!payload) {
    return res.status(200).json({ message: "Invalid token" });
  }
  const user = await User.findOne({ email: payload.email });
  if (!user) {
    return res.status(200).json({ message: "User not found" });
  }
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) {
    return res.status(200).json({ message: "Post not found" });
  }
  if (post.user.toString() !== user._id.toString()) {
    return res.status(200).json({ message: "Unauthorized" });
  }
  for (const image of post.images) {
    await delete_cloudinary_image(image.public_id);
  }
  await post.remove();
  user.posts.pull(post._id);
  await user.save();
  res.status(200).json({ message: "Post deleted successfully" });
};

export const get_all_posts = async (req, res) => {
  const posts = await Post.find().populate("user", "name email");
  const formatted_posts = posts.map((post) => ({
    ...post,
    user: {
      ...post.user,
      createdAt: formate_date_time(post.user.createdAt),
      updatedAt: formate_date_time(post.user.updatedAt),
    },
    createdAt: formate_date_time(post.createdAt),
    updatedAt: formate_date_time(post.updatedAt),
  }));
  res.status(200).json({ posts: formatted_posts });
};
