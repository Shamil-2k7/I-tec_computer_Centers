import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import { env } from "./config/env";
import { globalLimiter } from "./middlewares/rateLimiter";
import { notFound, errorHandler } from "./middlewares/errorMiddleware";

import authRoutes from "./routes/authRoutes";
import sessionRoutes from "./routes/sessionRoutes";
import userRoutes from "./routes/userRoutes";
import courseRoutes from "./routes/courseRoutes";
import sectionRoutes from "./routes/sectionRoutes";
import lessonRoutes from "./routes/lessonRoutes";
import videoRoutes from "./routes/videoRoutes";
import enrollmentRoutes from "./routes/enrollmentRoutes";
import progressRoutes from "./routes/progressRoutes";
import homepageRoutes from "./routes/homepageRoutes";
import teamRoutes from "./routes/teamRoutes";
import testimonialRoutes from "./routes/testimonialRoutes";
import faqRoutes from "./routes/faqRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import searchRoutes from "./routes/searchRoutes";

const app: Application = express();

// --- Security & core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(globalLimiter);

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "AKM LMS API is running", timestamp: new Date().toISOString() });
});

// --- API routes ---
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/homepage", homepageRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/search", searchRoutes);

// --- 404 + error handler (must be last) ---
app.use(notFound);
app.use(errorHandler);

export default app;
