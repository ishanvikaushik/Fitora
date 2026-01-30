import { Response } from "express";
import cloudinary from "../config/cloudinary";
import { AuthRequest } from "../middleware/auth.middleware";

export const uploadImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "fitora" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(req.file!.buffer);
    });

    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: "Image upload failed", error });
  }
};
//after this file make upload routes file