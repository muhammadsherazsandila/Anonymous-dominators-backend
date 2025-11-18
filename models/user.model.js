import mongoose from "mongoose";

const userShema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: {
      type: {
        url: String,
        public_id: String,
      },
      required: false,
    },
    OTP: { type: String, required: false },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userShema);

export default User;
