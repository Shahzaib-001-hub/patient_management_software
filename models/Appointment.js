import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "in_clinic",
        "online_video",
        "follow_up",
        "rehab_session",
        "treatment_procedure",
      ],
      required: true,
      default: "in_clinic",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "checked_in",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
        "rescheduled",
      ],
      default: "pending",
      index: true,
    },
    scheduledAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, default: 30, min: 10, max: 180 },
    notes: { type: String, default: "" },
    cancellationReason: { type: String, default: "" },
    meetingLink: { type: String, default: "" },
    timezone: { type: String, default: "Asia/Karachi" },
    consultationNotes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

AppointmentSchema.index({ doctorId: 1, scheduledAt: 1 });

export default mongoose.models.Appointment ||
  mongoose.model("Appointment", AppointmentSchema);
