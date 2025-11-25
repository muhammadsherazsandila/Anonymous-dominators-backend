import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
export function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request
    req.user = decoded;

    // Continue to next step
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
