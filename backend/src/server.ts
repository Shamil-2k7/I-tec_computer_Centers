import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

const start = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`[Server] AKM LMS API running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  process.on("unhandledRejection", (err: any) => {
    console.error(`[Unhandled Rejection] ${err.message}`);
    server.close(() => process.exit(1));
  });
};

start();
