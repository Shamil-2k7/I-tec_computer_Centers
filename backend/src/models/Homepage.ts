import { Schema, model, Document } from "mongoose";

export interface IHomepage extends Document {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroCtaText: string;
  heroCtaLink: string;
  aboutTitle: string;
  aboutContent: string;
  aboutImage: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  footerText: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  updatedAt: Date;
}

/**
 * Singleton document (only one row ever exists) that drives every
 * editable section of the public homepage.
 */
const homepageSchema = new Schema<IHomepage>(
  {
    heroTitle: { type: String, default: "Learn Without Limits" },
    heroSubtitle: { type: String, default: "Master new skills with expert-led courses." },
    heroImage: { type: String, default: "" },
    heroCtaText: { type: String, default: "Browse Courses" },
    heroCtaLink: { type: String, default: "/courses" },
    aboutTitle: { type: String, default: "About Us" },
    aboutContent: { type: String, default: "" },
    aboutImage: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    contactAddress: { type: String, default: "" },
    footerText: { type: String, default: "" },
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
      youtube: String,
    },
  },
  { timestamps: true }
);

export default model<IHomepage>("Homepage", homepageSchema);
