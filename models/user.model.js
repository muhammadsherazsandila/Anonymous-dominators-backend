import mongoose from "mongoose";

const userShema = new mongoose.Schema({
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
  reset_token: { type: String, required: false },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
});

const User = mongoose.model("User", userShema);

export default User;
