import { Schema, model, Document } from "mongoose";

export interface ITeam extends Document {
  name: string;
  role: string;
  bio: string;
  photo: string;
  order: number;
  socialLinks: { linkedin?: string; twitter?: string; github?: string };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    bio: { type: String, default: "" },
    photo: { type: String, default: "" },
    order: { type: Number, default: 0 },
    socialLinks: { linkedin: String, twitter: String, github: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<ITeam>("Team", teamSchema);
