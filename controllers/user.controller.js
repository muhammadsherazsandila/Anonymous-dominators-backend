import bcrypt from "bcrypt";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { delete_cloudinary_image } from "../utils/delete_cloudinary_image.js";
import { generate_jwt_token, verify_jwt_token } from "../utils/token.js";

export const register_user = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(200).json({ message: "All fields are required" });
  }
  if (password.length < 6) {
    return res
      .status(200)
      .json({ message: "Password must be at least 6 characters long" });
  }
  const user = await User.findOne({ email });
  if (user) {
    return res.status(200).json({ message: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();
  res.status(200).json({
    message: "User registered successfully",
    token: generate_jwt_token({ email: newUser.email }),
    user: {
      _id: newUser._id,
      name: newUser.name,
      posts: newUser.posts,
      profilePic: newUser.profilePic,
    },
  });
};

export const login_user = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({ message: "Invalid email" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(200).json({ message: "Invalid password" });
  }
  res.status(200).json({
    message: "User logged in successfully",
    token: generate_jwt_token({ email: user.email }),
    user: {
      _id: user._id,
      name: user.name,
      posts: user.posts,
      profilePic: user.profilePic,
    },
  });
};

export const token_based_authentication = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
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
  res.status(200).json({
    message: "User authenticated successfully",
    user: {
      _id: user._id,
      name: user.name,
      posts: user.posts,
      profilePic: user.profilePic,
    },
  });
};

export const upload_profile_picture = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
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

  const picData = req.body;
  if (!picData || !picData.url || !picData.public_id) {
    return res.status(200).json({ message: "Invalid picture data" });
  }

  if (user.profilePic && user.profilePic.public_id) {
    await delete_cloudinary_image(user.profilePic.public_id);
  }

  user.profilePic = {
    url: picData.url,
    public_id: picData.public_id,
  };

  await user.save();

  res.status(200).json({
    message: "Profile picture uploaded successfully",
    user: {
      _id: user._id,
      name: user.name,
      posts: user.posts,
      profilePic: user.profilePic,
    },
  });
};

export const get_user_profile = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }
  const payload = verify_jwt_token(token);
  if (!payload) {
    return res.status(401).json({ message: "Invalid token" });
  }
  const user = await User.findOne({ email: payload.email });
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  res.status(200).json({
    message: "User profile fetched successfully",
    user: {
      _id: user._id,
      name: user.name,
      posts: user.posts,
      profilePic: user.profilePic,
    },
  });
};

export const get_all_profiles = async (req, res) => {
  const users = await User.find().select(
    "-password -__v -email -reset_token -posts"
  );
  res.status(200).json({ message: "All profiles fetched successfully", users });
};

export const send_reset_password_email = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({ message: "User not found" });
  }
  const token = bcrypt.hashSync(email, 10);
  const pass_reset_hash = generate_jwt_token({ email, token });
  user.reset_token = token;
  await user.save();
  res.status(200).json({
    message: "Reset password email sent successfully",
    pass_reset_hash,
  });
};

export const verify_reset_pass_link = async (req, res) => {
  const payload = verify_jwt_token(req.params.data);
  if (!payload) {
    return res.status(200).json({ message: "Invalid token", valid: false });
  }
  const { email, token } = payload;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({ message: "User not found", valid: false });
  }
  if (user.reset_token !== token) {
    return res.status(200).json({ message: "Invalid token", valid: false });
  }
  res.status(200).json({
    message: "Reset password link verified successfully",
    valid: true,
  });
};

export const reset_password = async (req, res) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({ message: "User not found", changed: false });
  }
  const hash_password = bcrypt.hashSync(newPassword, 10);
  user.password = hash_password;
  await user.save();
  res
    .status(200)
    .json({ message: "Password reset successfully", changed: true });
};

export const updateName = async (req, res) => {
  const { name } = req.body;
  const user = await User.findOne({ email: req.user.email });
  if (!user) {
    return res.status(200).json({ message: "User not found" });
  }
  user.name = name;
  await user.save();
  res.status(200).json({
    message: "Name updated successfully",
    user: {
      _id: user._id,
      name: user.name,
      posts: user.posts,
      profilePic: user.profilePic,
    },
  });
};

export const delete_account = async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
  if (!user) {
    return res.status(200).json({ message: "User not found", deleted: false });
  }

  if (user.profilePic && user.profilePic.public_id) {
    await delete_cloudinary_image(user.profilePic.public_id);
  }

  const user_posts = await Post.find({ user: user._id });
  for (const post of user_posts) {
    for (const image of post.images) {
      await delete_cloudinary_image(image.public_id);
    }
  }
  await Post.deleteMany({ user: user._id });

  await User.findByIdAndDelete(user._id);
  res
    .status(200)
    .json({ message: "Account deleted successfully", deleted: true });
};
