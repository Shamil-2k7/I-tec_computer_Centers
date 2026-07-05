import { Schema, model, Document } from "mongoose";

export interface IFAQ extends Document {
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<IFAQ>("FAQ", faqSchema);
