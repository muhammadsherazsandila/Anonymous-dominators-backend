import express from "express";
import {
  create_post,
  delete_extra_images,
  delete_post,
  get_all_posts,
  update_post,
} from "../controllers/post.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const post_router = express.Router();

post_router.post("/create", authMiddleware, create_post);

post_router.get("/all", get_all_posts);
post_router.delete("/delete/:id", authMiddleware, delete_post);
post_router.put("/update/:id", authMiddleware, update_post);

post_router.post("/delete-extra-images", authMiddleware, delete_extra_images);

export default post_router;
