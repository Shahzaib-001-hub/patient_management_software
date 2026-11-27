import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: [
        "super_admin",
        "clinic_admin",
        "doctor",
        "receptionist",
        "rehab_staff",
        "accountant",
        "patient",
      ],
      required: true,
      default: "patient",
    },
    phone: { type: String, trim: true, default: "" },
    specialization: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
    patientProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    notificationPreferences: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, isActive: 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);
