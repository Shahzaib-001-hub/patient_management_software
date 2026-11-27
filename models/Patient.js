import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    personalInfo: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      dateOfBirth: { type: Date, required: true },
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true,
      },
    },
    contact: {
      phone: { type: String, required: true, trim: true, index: true },
      email: { type: String, trim: true, lowercase: true, default: "" },
      address: { type: String, trim: true, default: "" },
      countryCode: { type: String, default: "+92" },
      timezone: { type: String, default: "Asia/Karachi" },
    },
    emergencyContact: {
      name: { type: String, trim: true, default: "" },
      relationship: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
    },
    patientType: {
      type: String,
      enum: ["physical", "online"],
      default: "physical",
    },
    medicalHistory: {
      previousIllnesses: [{ type: String }],
      surgicalHistory: [{ type: String }],
      allergies: [{ type: String }],
      currentMedications: [
        {
          name: { type: String },
          dosage: { type: String },
          frequency: { type: String },
        },
      ],
      previousInjuries: [
        {
          injuryType: { type: String },
          date: { type: String },
        },
      ],
    },
    registration: {
      date: { type: Date, default: Date.now },
      source: { type: String, default: "Walk-in" },
      assignedDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    consentRecords: [
      {
        version: { type: String, default: "1.0" },
        type: { type: String, default: "General & Telehealth" },
        consentedAt: { type: Date, default: Date.now },
      },
    ],
    internalNotes: [
      {
        note: { type: String },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdByName: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    correctionRequests: [
      {
        field: { type: String },
        requestedValue: { type: String },
        reason: { type: String },
        status: {
          type: String,
          enum: ["pending", "reviewed", "rejected"],
          default: "pending",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
      index: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

PatientSchema.index({
  "personalInfo.firstName": "text",
  "personalInfo.lastName": "text",
  patientId: "text",
  "contact.phone": "text",
});

export default mongoose.models.Patient ||
  mongoose.model("Patient", PatientSchema);
