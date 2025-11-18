import User from "../models/user.model";
import { generate_jwt_token } from "../utils/token";
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
  });
};
