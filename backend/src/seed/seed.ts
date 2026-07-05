import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db";
import { env } from "../config/env";
import User from "../models/User";
import Homepage from "../models/Homepage";
import Settings from "../models/Settings";
import Team from "../models/Team";
import Testimonial from "../models/Testimonial";
import FAQ from "../models/FAQ";
import mongoose from "mongoose";

const seed = async () => {
  await connectDB();
  console.log("[Seed] Connected. Seeding initial data...");

  const existingAdmin = await User.findOne({ email: env.ADMIN_EMAIL });
  if (!existingAdmin) {
    await User.create({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(`[Seed] Admin created: ${env.ADMIN_EMAIL} / ${env.ADMIN_PASSWORD}`);
  } else {
    console.log("[Seed] Admin already exists, skipping.");
  }

  const homepageCount = await Homepage.countDocuments();
  if (homepageCount === 0) {
    await Homepage.create({
      heroTitle: "Learn Without Limits",
      heroSubtitle: "Master in-demand skills with expert-led, self-paced courses.",
      heroCtaText: "Browse Courses",
      heroCtaLink: "/courses",
      aboutTitle: "About AKM LMS",
      aboutContent: "We build practical, project-based courses taught by working professionals.",
      contactEmail: "hello@akmlms.com",
      contactPhone: "+1 (555) 010-0100",
      contactAddress: "123 Learning Ave, Remote City",
      footerText: "© AKM LMS. All rights reserved.",
    });
    console.log("[Seed] Homepage content created.");
  }

  const settingsCount = await Settings.countDocuments();
  if (settingsCount === 0) {
    await Settings.create({ siteName: "AKM LMS", maxDevicesPerStudent: env.MAX_DEVICES_PER_STUDENT });
    console.log("[Seed] Settings created.");
  }

  const teamCount = await Team.countDocuments();
  if (teamCount === 0) {
    await Team.insertMany([
      { name: "Aisha Khan", role: "Founder & Lead Instructor", order: 0, bio: "10+ years building developer education programs." },
      { name: "Marcus Lee", role: "Curriculum Director", order: 1, bio: "Former engineering manager turned course designer." },
    ]);
    console.log("[Seed] Team members created.");
  }

  const testimonialCount = await Testimonial.countDocuments();
  if (testimonialCount === 0) {
    await Testimonial.insertMany([
      { name: "Priya S.", designation: "Frontend Developer", message: "The courses are structured so well I could apply what I learned the same day.", rating: 5, order: 0 },
      { name: "Daniel O.", designation: "Backend Engineer", message: "Clear explanations and real projects, not just theory.", rating: 5, order: 1 },
    ]);
    console.log("[Seed] Testimonials created.");
  }

  const faqCount = await FAQ.countDocuments();
  if (faqCount === 0) {
    await FAQ.insertMany([
      { question: "How do I enroll in a course?", answer: "Enrollment is managed by our admin team. Once you register, an admin will grant you access to your course.", order: 0 },
      { question: "How many devices can I log in from?", answer: `You can be logged in from up to ${env.MAX_DEVICES_PER_STUDENT} devices at a time.`, order: 1 },
    ]);
    console.log("[Seed] FAQs created.");
  }

  console.log("[Seed] Done.");
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("[Seed] Failed:", err);
  process.exit(1);
});
