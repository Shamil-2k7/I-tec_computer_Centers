import { Schema, model, Document, Types } from "mongoose";

export interface ISession extends Document {
  user: Types.ObjectId;
  deviceId: string;
  browser: string;
  os: string;
  device: string;
  ip: string;
  refreshToken: string;
  loginAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

/**
 * One document per logged-in device. Used to enforce the
 * "max 2 devices per student" rule and to power the
 * admin "manage devices" screen.
 */
const sessionSchema = new Schema<ISession>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    deviceId: { type: String, required: true },
    browser: { type: String, default: "Unknown" },
    os: { type: String, default: "Unknown" },
    device: { type: String, default: "Desktop" },
    ip: { type: String, default: "" },
    refreshToken: { type: String, required: true, select: false },
    loginAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

sessionSchema.index({ user: 1, deviceId: 1 }, { unique: true });

export default model<ISession>("Session", sessionSchema);
