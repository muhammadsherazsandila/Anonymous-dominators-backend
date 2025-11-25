import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import "./db/mongoose.js";
import home_router from "./routes/home.route.js";
import post_router from "./routes/post.route.js";
import user_router from "./routes/user.route.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = [
  "http://localhost:3000",
  "https://anonymousdominators.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser requests (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", home_router);
app.use("/user", user_router);
app.use("/post", post_router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
