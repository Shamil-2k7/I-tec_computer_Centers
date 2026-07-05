import { Schema, model, Document, Types } from "mongoose";

export interface IProgress extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  completedVideos: Types.ObjectId[];
  completedLessons: Types.ObjectId[];
  completedSections: Types.ObjectId[];
  lastWatchedVideo?: Types.ObjectId;
  lastWatchedPosition: number; // seconds
  bookmarkedLessons: Types.ObjectId[];
  percentage: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    completedVideos: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    completedLessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
    completedSections: [{ type: Schema.Types.ObjectId, ref: "Section" }],
    lastWatchedVideo: { type: Schema.Types.ObjectId, ref: "Video" },
    lastWatchedPosition: { type: Number, default: 0 },
    bookmarkedLessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

progressSchema.index({ student: 1, course: 1 }, { unique: true });

export default model<IProgress>("Progress", progressSchema);
