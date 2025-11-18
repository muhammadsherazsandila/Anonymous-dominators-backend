import mongoose from "mongoose";
import { use } from "react";

const postSchema = new mongoose.Schema(
  {
    description: { type: String, required: false },
    images: [
      {
        type: {
          url: String,
          public_id: String,
        },
        required: false,
      },
    ],
    code: { type: String, required: false },
    day: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
