import { Response } from "express";
import Clothing from "../models/Clothing";
import { AuthRequest } from "../middleware/auth.middleware";

export const addClothing = async (req: AuthRequest, res: Response) => {
  try {
    const clothing = await Clothing.create({
      ...req.body,
      user: req.userId,
    });

    res.status(201).json(clothing);
  } catch (error) {
    res.status(500).json({ message: "Failed to add clothing", error });
  }
};

export const getClothes = async (req: AuthRequest, res: Response) => {
  try {
    const clothes = await Clothing.find({ user: req.userId });
    res.json(clothes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch clothes", error });
  }
};
