import mongoose from "mongoose";

const PromptSchema = new mongoose.Schema(
  {
    number: { type: String, required: true }, // e.g. "#5"
    numberInt: { type: Number, required: true, index: true }, // 5 — used for ordering
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    tags: { type: [String], default: [] },
    prompt: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent duplicate numbers within a category
PromptSchema.index({ category: 1, numberInt: 1 }, { unique: true });

export default mongoose.models.Prompt || mongoose.model("Prompt", PromptSchema);
