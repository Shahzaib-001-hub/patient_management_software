import mongoose from "mongoose";

const ExerciseBundleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    bodyArea: {
      type: String,
      enum: ["knee", "back", "neck", "shoulder", "hip", "ankle", "general"],
      default: "general",
    },
    phases: [
      {
        phaseName: { type: String, required: true },
        exercises: [
          {
            exerciseId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Exercise",
              required: true,
            },
            sets: { type: Number, default: 3 },
            reps: { type: String, default: "10" },
            notes: { type: String, default: "" },
          },
        ],
      },
    ],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.ExerciseBundle ||
  mongoose.model("ExerciseBundle", ExerciseBundleSchema);
