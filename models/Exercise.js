import mongoose from "mongoose";

const ExerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    bodyArea: {
      type: String,
      enum: ["knee", "back", "neck", "shoulder", "hip", "ankle", "general"],
      required: true,
      index: true,
    },
    injuryCategory: { type: String, default: "" },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    instructions: { type: String, default: "" },
    defaultSets: { type: Number, default: 3 },
    defaultReps: { type: String, default: "10" },
    durationMinutes: { type: Number, default: 10 },
    frequency: { type: String, default: "Daily" },
    precautions: { type: String, default: "" },
    equipmentRequired: { type: String, default: "None" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Exercise ||
  mongoose.model("Exercise", ExerciseSchema);
