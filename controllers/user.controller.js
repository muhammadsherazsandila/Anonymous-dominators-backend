import User from "../models/user.model.js";
import { delete_cloudinary_image } from "../utils/delete_cloudinary_image.js";
import { generate_jwt_token, verify_jwt_token } from "../utils/token.js";
import bcrypt from "bcrypt";

export const register_user = async (req, res) => {
  const { name, email, password } = req.body;
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
    user: newUser,
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
    user,
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
  res.status(200).json({ message: "User authenticated successfully", user });
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
  const file = req.file;
  if (!file) {
    return res.status(200).json({ message: "File not found" });
  }

  if (user.profilePic && user.profilePic.public_id) {
    await delete_cloudinary_image(user.profilePic.public_id);
  }

  user.profilePic = {
    url: file.path,
    public_id: file.filename, // Assuming you have the public_id or filename from the upload process
  };

  await user.save();
  res
    .status(200)
    .json({ message: "Profile picture uploaded successfully", user });
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
      ...user._doc,
      password: undefined,
    },
  });
};

export const get_other_profiles = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Token not found" });
  }

  const payload = verify_jwt_token(token);
  if (!payload) {
    res.status(401).json({ message: "Invalid token" });
  }

  const users = await User.find({ email: { $ne: payload.email } }).select(
    "-password"
  );
  res
    .status(200)
    .json({ message: "Other profiles fetched successfully", users });
};
