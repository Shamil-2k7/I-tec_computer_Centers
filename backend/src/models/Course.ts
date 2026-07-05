import { Schema, model, Document, Types } from "mongoose";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  banner: string;
  instructor: Types.ObjectId;
  price: number;
  isFree: boolean;
  difficulty: Difficulty;
  category: string;
  language: string;
  duration: string;
  learningOutcomes: string[];
  requirements: string[];
  isPublished: boolean;
  totalEnrollments: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    thumbnail: { type: String, default: "" },
    banner: { type: String, default: "" },
    instructor: { type: Schema.Types.ObjectId, ref: "User" },
    price: { type: Number, default: 0, min: 0 },
    isFree: { type: Boolean, default: false },
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    category: { type: String, default: "General", index: true },
    language: { type: String, default: "English" },
    duration: { type: String, default: "" },
    learningOutcomes: [{ type: String }],
    requirements: [{ type: String }],
    isPublished: { type: Boolean, default: false, index: true },
    totalEnrollments: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

courseSchema.index({ title: "text", description: "text", category: "text" });

export default model<ICourse>("Course", courseSchema);
