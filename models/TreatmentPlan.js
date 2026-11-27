import mongoose from "mongoose";

const TreatmentPlanSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PainAssessment",
      default: null,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    version: { type: Number, default: 1 },
    title: { type: String, required: true, trim: true },
    diagnosis: { type: String, required: true },
    goals: { type: String, default: "" },
    recommendations: { type: String, default: "" },
    medications: [
      {
        name: { type: String, required: true },
        dosage: { type: String, default: "" },
        frequency: { type: String, default: "" },
        duration: { type: String, default: "" },
        instructions: { type: String, default: "" },
        prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        prescribedByName: { type: String, default: "" },
        prescribedAt: { type: Date, default: Date.now },
      },
    ],
    startDate: { type: Date, default: Date.now },
    reviewDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["draft", "active", "on_hold", "completed", "discontinued"],
      default: "active",
      index: true,
    },
    discontinueReason: { type: String, default: "" },
    doctorNotes: { type: String, default: "" },
    sessions: [
      {
        sessionDate: { type: Date, default: Date.now },
        notes: { type: String, required: true },
        progressSummary: { type: String, default: "" },
        recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        recordedByName: { type: String, default: "" },
      },
    ],
    history: [
      {
        version: { type: Number },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        summary: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.TreatmentPlan ||
  mongoose.model("TreatmentPlan", TreatmentPlanSchema);
