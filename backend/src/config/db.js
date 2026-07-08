import mongoose from "mongoose";
import { config } from "./env.js";

const resolveDatabaseName = (mongoUri, fallbackDbName) => {
  try {
    const { pathname } = new URL(mongoUri);
    const uriDbName = pathname.replace(/^\/+/, "").trim();
    return uriDbName || fallbackDbName;
  } catch {
    return fallbackDbName;
  }
};

const connectDB = async () => {
  try {
    const dbName = resolveDatabaseName(config.MONGO_URI, config.MONGO_DB_NAME);

    await mongoose.connect(config.MONGO_URI, {
      dbName,
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected to ${mongoose.connection.name}`);
    return mongoose.connection;
  } catch (error) {
    throw error;
  }
};

export default connectDB;
