import multer from "multer";
import { cloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.config";

const storage = cloudinaryStorage({
  cloudinary,
  parms: {
    folder: "anonymous_dominators",
    allowedFormats: ["jpg", "png", "jpeg", "gif"],
  },
});

const upload = multer({ storage });

export default upload;
