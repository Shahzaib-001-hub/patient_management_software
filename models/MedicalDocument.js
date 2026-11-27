import mongoose from "mongoose";

const MedicalDocumentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        "mri",
        "xray",
        "ct_scan",
        "lab_report",
        "prescription",
        "referral",
        "discharge_summary",
        "other",
      ],
      default: "other",
    },
    documentDate: { type: Date, default: Date.now },
    description: { type: String, default: "" },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    bytes: { type: Number, default: 0 },
    storageProvider: {
      type: String,
      enum: ["cloudinary", "local"],
      required: true,
    },
    storageKey: { type: String, required: true },
    resourceType: { type: String, default: "raw" },
    sharedWithPatient: { type: Boolean, default: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.MedicalDocument ||
  mongoose.model("MedicalDocument", MedicalDocumentSchema);
