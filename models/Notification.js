import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
    type: {
      type: String,
      enum: [
        "appointment_confirmed",
        "appointment_reminder",
        "appointment_cancelled",
        "follow_up_reminder",
        "exercise_assigned",
        "treatment_updated",
        "payment_confirmed",
        "payment_pending",
        "general",
      ],
      default: "general",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    channel: {
      type: String,
      enum: ["in_app", "email", "whatsapp", "sms"],
      default: "in_app",
    },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
