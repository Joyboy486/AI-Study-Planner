import mongoose from 'mongoose';

let dbError: string | null = null;
let connectionPromise: Promise<boolean> | null = null;

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    dbError = 'MONGODB_URI is not configured';
    return false;
  }

  // Reuse an existing MongoDB connection
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  // Reuse an ongoing connection attempt
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      mongoose.set('strictQuery', false);

      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      });

      dbError = null;
      console.log('[FocusFlow DB] MongoDB connected successfully');

      return true;
    } catch (err: unknown) {
      dbError = err instanceof Error ? err.message : String(err);

      console.error('[FocusFlow DB] Connection failed:', dbError);

      return false;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
}

export function getDBStatus() {
  const isConnected = mongoose.connection.readyState === 1;

  return {
    isConnected,
    mode: isConnected ? 'mongodb' : 'disconnected',
    error: dbError,
  };
}