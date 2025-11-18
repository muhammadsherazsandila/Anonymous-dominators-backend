import { v2 as cloudinary } from "cloudinary";

export const delete_cloudinary_image = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
  }
};
