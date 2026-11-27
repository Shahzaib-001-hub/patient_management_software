import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      enum: [
        "therapeutic_oil",
        "pain_relief_gel",
        "braces_supports",
        "rehab_equipment",
        "supplements",
      ],
      required: true,
      index: true,
    },
    description: { type: String, default: "" },
    usageInstructions: { type: String, default: "" },
    volumeOrSize: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "PKR" },
    stockQuantity: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
