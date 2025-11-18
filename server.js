import express from "express";
import dotenv from "dotenv";
import "./db/mongoose.js";
import user_router from "./routes/user.route.js";
import post_router from "./routes/post.route.js";
import home_router from "./routes/home.route.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", home_router);
app.use("/user", user_router);
app.use("/post", post_router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
