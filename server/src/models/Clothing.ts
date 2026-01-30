import mongoose, { Document, Schema } from "mongoose";

export interface IClothing extends Document {
  user: mongoose.Types.ObjectId;
  category: "top" | "bottom" | "footwear" | "accessory";
  subCategory: string;
  color: string;
  season: "summer" | "winter" | "all";
  occasion: "casual" | "formal" | "party";
  imageUrl: string;
}

const clothingSchema = new Schema<IClothing>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["top", "bottom", "footwear", "accessory"],
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    season: {
      type: String,
      enum: ["summer", "winter", "all"],
      default: "all",
    },
    occasion: {
      type: String,
      enum: ["casual", "formal", "party"],
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IClothing>("Clothing", clothingSchema);
