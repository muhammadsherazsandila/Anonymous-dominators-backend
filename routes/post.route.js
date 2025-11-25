import express from "express";
import {
  create_post,
  delete_post,
  get_all_posts,
  update_post,
} from "../controllers/post.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import upload from "../config/multer.config.js";
const post_router = express.Router();

post_router.post(
  "/create",
  authMiddleware,
  upload.array("images"),
  create_post
);

post_router.get("/all", get_all_posts);
post_router.delete("/delete/:id", authMiddleware, delete_post);
post_router.put(
  "/update/:id",
  authMiddleware,
  upload.array("images"),
  update_post
);

export default post_router;
