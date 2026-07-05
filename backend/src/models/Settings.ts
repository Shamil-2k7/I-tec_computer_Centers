import { Schema, model, Document } from "mongoose";

export interface ISettings extends Document {
  siteName: string;
  siteLogo: string;
  favicon: string;
  maintenanceMode: boolean;
  maxDevicesPerStudent: number;
  currency: string;
  updatedAt: Date;
}

/** Singleton document holding global platform settings. */
const settingsSchema = new Schema<ISettings>(
  {
    siteName: { type: String, default: "AKM LMS" },
    siteLogo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    maintenanceMode: { type: Boolean, default: false },
    maxDevicesPerStudent: { type: Number, default: 2 },
    currency: { type: String, default: "USD" },
  },
  { timestamps: true }
);

export default model<ISettings>("Settings", settingsSchema);
