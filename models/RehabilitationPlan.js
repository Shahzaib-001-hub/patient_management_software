import mongoose from "mongoose";

const RehabilitationPlanSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bundleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExerciseBundle",
      default: null,
    },
    title: { type: String, required: true, trim: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    frequency: { type: String, default: "Daily" },
    doctorInstructions: { type: String, default: "" },
    reviewDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["active", "paused", "completed", "revoked"],
      default: "active",
      index: true,
    },
    exercises: [
      {
        exerciseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        phaseName: { type: String, default: "General" },
        sets: { type: Number, default: 3 },
        reps: { type: String, default: "10" },
        notes: { type: String, default: "" },
      },
    ],
    logs: [
      {
        exerciseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        completedAt: { type: Date, default: Date.now },
        painAfter: { type: Number, min: 0, max: 10, default: 0 },
        difficulty: {
          type: String,
          enum: ["easy", "moderate", "hard", "painful"],
          default: "moderate",
        },
        feedback: { type: String, default: "" },
        status: {
          type: String,
          enum: ["completed", "skipped"],
          default: "completed",
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.RehabilitationPlan ||
  mongoose.model("RehabilitationPlan", RehabilitationPlanSchema);
