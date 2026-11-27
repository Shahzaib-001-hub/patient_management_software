import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter =
  mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

export async function getNextSequence(prefix) {
  const year = new Date().getFullYear();
  const key = `${prefix}-${year}`;
  const doc = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const padded = String(doc.seq).padStart(5, "0");
  return `${prefix}-${year}-${padded}`;
}
