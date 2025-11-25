import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { formate_date_time } from "../utils/date_time_formater.js";
import { delete_cloudinary_image } from "../utils/delete_cloudinary_image.js";
import { verify_jwt_token } from "../utils/token.js";

export const create_post = async (req, res) => {
  const { description, code, day } = req.body;
  const post = await Post.findOne({ day });
  const user = await User.findOne({ email: req.user.email });
  if (post && post.user.toString() === user._id.toString()) {
    return res
      .status(200)
      .json({ message: "Post for this day already exists." });
  }

  const updated_user = await User.findOne({ email: req.user.email });
  const new_post = new Post({
    description,
    images: req.files
      ? req.files.map((file) => {
          return { url: file.path, public_id: file.filename };
        })
      : [],
    code,
    day,
    user: updated_user._id,
  });
  await new_post.save();

  updated_user.posts.push(new_post._id);
  await updated_user.save();

  res
    .status(200)
    .json({ message: "Post created successfully", post: new_post });
};

export const delete_post = async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
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
  await Post.findByIdAndDelete(id);
  user.posts.pull(post._id);
  await user.save();
  res.status(200).json({ message: "Post deleted successfully", status: 200 });
};

export const get_all_posts = async (req, res) => {
  const posts = await Post.find().populate("user");
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

export const update_post = async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
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
  const { description, code, day, existingImages, removedImages } = req.body;
  const newImages = req.files;
  const updatedImages = [...JSON.parse(existingImages)];

  for (const image of newImages) {
    updatedImages.push({ url: image.path, public_id: image.filename });
  }
  post.description = description;
  post.code = code;
  post.day = day;
  post.images = updatedImages;
  post.updatedAt = Date.now();
  await post.save();

  for (const image of JSON.parse(removedImages)) {
    await delete_cloudinary_image(image.public_id);
  }

  res.status(200).json({ message: "Post updated successfully", post });
};
