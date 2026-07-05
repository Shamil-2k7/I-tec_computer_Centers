import { Schema, model, Document, Types } from "mongoose";

export interface IEnrollment extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  enrolledBy: Types.ObjectId;
  status: "active" | "revoked";
  enrolledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    enrolledBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "revoked"], default: "active" },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default model<IEnrollment>("Enrollment", enrollmentSchema);
