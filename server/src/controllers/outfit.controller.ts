import { Response } from "express";
import Clothing from "../models/Clothing";
import { AuthRequest } from "../middleware/auth.middleware";

export const generateOutfit = async (req: AuthRequest, res: Response) => {
  try {
    const { occasion, season } = req.body;

    const clothes = await Clothing.find({
      user: req.userId,
      occasion,
      season: { $in: [season, "all"] },
    });

    const tops = clothes.filter(c => c.category === "top");
    const bottoms = clothes.filter(c => c.category === "bottom");
    const footwear = clothes.filter(c => c.category === "footwear");

    if (!tops.length || !bottoms.length || !footwear.length) {
      return res.status(400).json({
        message: "Not enough items to generate outfit",
      });
    }

    const outfit = {
      top: tops[Math.floor(Math.random() * tops.length)],
      bottom: bottoms[Math.floor(Math.random() * bottoms.length)],
      footwear: footwear[Math.floor(Math.random() * footwear.length)],
    };

    res.json(outfit);
  } catch (error) {
    res.status(500).json({ message: "Outfit generation failed", error });
  }
};
