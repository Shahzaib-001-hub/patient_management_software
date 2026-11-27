import mongoose from "mongoose";

const DayHoursSchema = new mongoose.Schema(
  {
    open: { type: String, default: "09:00" },
    close: { type: String, default: "18:00" },
    closed: { type: Boolean, default: false },
  },
  { _id: false }
);

const ClinicSettingsSchema = new mongoose.Schema(
  {
    clinicName: {
      type: String,
      default: "Pain Relief & Wellness Center",
    },
    clinicCode: { type: String, default: "PRWC" },
    phone: { type: String, default: "+92-300-0000000" },
    email: { type: String, default: "info@prwc-clinic.com" },
    address: { type: String, default: "Main Boulevard, Lahore, Pakistan" },
    defaultCurrency: { type: String, default: "PKR" },
    defaultConsultationDuration: { type: Number, default: 30 },
    workingHours: {
      monday: { type: DayHoursSchema, default: () => ({ open: "09:00", close: "18:00", closed: false }) },
      tuesday: { type: DayHoursSchema, default: () => ({ open: "09:00", close: "18:00", closed: false }) },
      wednesday: { type: DayHoursSchema, default: () => ({ open: "09:00", close: "18:00", closed: false }) },
      thursday: { type: DayHoursSchema, default: () => ({ open: "09:00", close: "18:00", closed: false }) },
      friday: { type: DayHoursSchema, default: () => ({ open: "09:00", close: "18:00", closed: false }) },
      saturday: { type: DayHoursSchema, default: () => ({ open: "10:00", close: "15:00", closed: false }) },
      sunday: { type: DayHoursSchema, default: () => ({ open: "00:00", close: "00:00", closed: true }) },
    },
    holidays: [{ date: String, name: String }],
  },
  { timestamps: true }
);

export default mongoose.models.ClinicSettings ||
  mongoose.model("ClinicSettings", ClinicSettingsSchema);
