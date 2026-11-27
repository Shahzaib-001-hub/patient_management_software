import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, required: true, unique: true, index: true },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "PKR" },
    method: {
      type: String,
      enum: ["cash", "bank_transfer", "online"],
      required: true,
    },
    type: {
      type: String,
      enum: ["payment", "refund"],
      default: "payment",
    },
    reference: { type: String, default: "" },
    notes: { type: String, default: "" },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paidAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
