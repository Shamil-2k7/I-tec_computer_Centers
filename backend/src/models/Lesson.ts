import { Schema, model, Document, Types } from "mongoose";

export interface ILesson extends Document {
  section: Types.ObjectId;
  course: Types.ObjectId;
  title: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    section: { type: Schema.Types.ObjectId, ref: "Section", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model<ILesson>("Lesson", lessonSchema);
