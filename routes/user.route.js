import express from "express";
import {
  login_user,
  register_user,
  token_based_authentication,
  upload_profile_picture,
} from "../controllers/user.controller.js";
import upload from "../config/multer.config.js";
const user_router = express.Router();

user_router.post("/login", login_user);
user_router.post("/register", register_user);
user_router.get("/authenticate-token", token_based_authentication);
user_router.post(
  "/upload-profile-picture",
  upload.single("profilePic"),
  upload_profile_picture
);

export default user_router;
