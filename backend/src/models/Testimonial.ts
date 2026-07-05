import { Schema, model, Document } from "mongoose";

export interface ITestimonial extends Document {
  name: string;
  designation: string;
  photo: string;
  message: string;
  rating: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true },
    designation: { type: String, default: "" },
    photo: { type: String, default: "" },
    message: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<ITestimonial>("Testimonial", testimonialSchema);
