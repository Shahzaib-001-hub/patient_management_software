import mongoose from "mongoose";

const PainAssessmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    painInfo: {
      primaryComplaint: { type: String, required: true },
      location: { type: String, default: "" },
      onset: { type: String, default: "" },
      duration: { type: String, default: "" },
      frequency: { type: String, default: "" },
      characteristics: [{ type: String }],
      aggravatingFactors: [{ type: String }],
      relievingFactors: [{ type: String }],
      previousTreatment: { type: String, default: "" },
    },
    painScores: {
      current: { type: Number, min: 0, max: 10, required: true },
      average24h: { type: Number, min: 0, max: 10, default: 0 },
      worst: { type: Number, min: 0, max: 10, default: 0 },
      atRest: { type: Number, min: 0, max: 10, default: 0 },
      duringActivity: { type: Number, min: 0, max: 10, default: 0 },
    },
    painLocations: [
      {
        bodyRegion: { type: String, required: true },
        view: { type: String, enum: ["front", "back"], default: "front" },
        side: {
          type: String,
          enum: ["left", "right", "center"],
          default: "center",
        },
        painType: { type: String, default: "aching" },
        severity: { type: Number, min: 1, max: 10, default: 5 },
      },
    ],
    functionalAssessment: {
      walkingAbility: { type: String, default: "" },
      sittingTolerance: { type: String, default: "" },
      standingTolerance: { type: String, default: "" },
      sleepQuality: { type: String, default: "" },
      dailyActivityLimitations: { type: String, default: "" },
      rangeOfMotion: { type: String, default: "" },
      workLifestyleImpact: { type: String, default: "" },
    },
    clinicalAssessment: {
      examinationNotes: { type: String, default: "" },
      findings: { type: String, default: "" },
      provisionalDiagnosis: { type: String, default: "" },
      confirmedDiagnosis: { type: String, default: "" },
      differentialDiagnoses: [{ type: String }],
      recommendedInvestigations: [{ type: String }],
    },
    assessedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.PainAssessment ||
  mongoose.model("PainAssessment", PainAssessmentSchema);
