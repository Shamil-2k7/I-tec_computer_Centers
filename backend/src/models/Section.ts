import { Schema, model, Document, Types } from "mongoose";

export interface ISection extends Document {
  course: Types.ObjectId;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const sectionSchema = new Schema<ISection>(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model<ISection>("Section", sectionSchema);
