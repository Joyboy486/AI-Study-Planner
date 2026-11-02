import mongoose from 'mongoose';

let isConnected = false;
let dbError: string | null = null;

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    isConnected = false;
    dbError = null;
    return false;
  }
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 1500,
    });
    isConnected = true;
    dbError = null;
    console.log(`[FocusFlow DB] Successfully connected to MongoDB at ${uri}`);
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    isConnected = false;
    dbError = message;
    console.warn(`[FocusFlow DB] MongoDB not reachable (${message}). Running with embedded high-speed storage fallback.`);
    return false;
  }
}

export function getDBStatus() {
  return {
    isConnected,
    mode: isConnected ? 'mongodb' : 'embedded',
    error: dbError,
  };
}
