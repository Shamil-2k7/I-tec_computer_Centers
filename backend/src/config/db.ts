import mongoose from "mongoose";

/**
 * Connects to MongoDB Atlas using the connection string in MONGO_URI.
 * Exits the process on failure so the app never runs without a DB.
 */
export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is not defined in environment variables");

    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(uri);

    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on("error", (err) => {
      console.error(`[MongoDB] Connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[MongoDB] Disconnected");
    });
  } catch (error: any) {
    console.error(`[MongoDB] Failed to connect: ${error.message}`);
    process.exit(1);
  }
};
