import express from "express";
import { home_page_data } from "../controllers/home.controller.js";
const home_router = express.Router();

home_router.get("/", home_page_data);

export default home_router;
