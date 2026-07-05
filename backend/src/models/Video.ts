import { Schema, model, Document, Types } from "mongoose";

export interface IVideo extends Document {
  lesson: Types.ObjectId;
  section: Types.ObjectId;
  course: Types.ObjectId;
  title: string;
  youtubeUrl: string;
  embedUrl: string;
  duration: string;
  order: number;
  accessType: "preview" | "locked";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Only the original YouTube URL is stored, per spec.
 * embedUrl is derived at save-time (see controllers/videoController.ts)
 * and cached here for fast reads on the player page.
 */
const videoSchema = new Schema<IVideo>(
  {
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true, index: true },
    section: { type: Schema.Types.ObjectId, ref: "Section", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    title: { type: String, required: true, trim: true },
    youtubeUrl: { type: String, required: true },
    embedUrl: { type: String, required: true },
    duration: { type: String, default: "" },
    order: { type: Number, default: 0 },
    accessType: { type: String, enum: ["preview", "locked"], default: "locked" },
  },
  { timestamps: true }
);

export default model<IVideo>("Video", videoSchema);
