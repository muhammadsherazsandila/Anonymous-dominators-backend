import express from "express";
import upload from "../config/multer.config.js";
import {
  delete_account,
  get_all_profiles,
  get_user_profile,
  login_user,
  register_user,
  reset_password,
  send_reset_password_email,
  token_based_authentication,
  updateName,
  upload_profile_picture,
  verify_reset_pass_link,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const user_router = express.Router();

user_router.post("/login", login_user);
user_router.post("/register", register_user);
user_router.get("/authenticate-token", token_based_authentication);
user_router.put(
  "/upload-profile-picture",
  upload.single("profilePic"),
  upload_profile_picture
);

user_router.get("/profile", get_user_profile);
user_router.get("/all", get_all_profiles);
user_router.post("/reset-password-email", send_reset_password_email);
user_router.get("/verify-reset-pass-link/:data", verify_reset_pass_link);
user_router.put("/reset-password", reset_password);
user_router.put("/update/name", authMiddleware, updateName);
user_router.delete("/delete-account", authMiddleware, delete_account);
export default user_router;
