import mongoose from "mongoose";

const MONGODB_URI = (process.env.MONGODB_URI ?? "").trim();
const isProduction = process.env.NODE_ENV === "production";
const LOCAL_MONGODB_URI = "mongodb://127.0.0.1:27017/todoapp";

if (!MONGODB_URI && !isProduction) {
  console.warn(
    "MONGODB_URI is not defined. Falling back to localhost MongoDB in development."
  );
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

export class MongoConfigurationError extends Error {
  constructor() {
    super(
      "MONGODB_URI is missing. Add it in Vercel / GitHub environment variables before deploying."
    );
    this.name = "MongoConfigurationError";
  }
}

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache;
};

const cached =
  globalWithMongoose.mongoose ??= {
    conn: null,
    promise: null,
  };

async function connectWithRetry(uri: string) {
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: "todoapp",
      connectTimeoutMS: 8000,
      serverSelectionTimeoutMS: 8000,
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

export async function connectMongo() {
  if (cached.conn) {
    return cached.conn;
  }

  const mongoUri = MONGODB_URI || (isProduction ? "" : LOCAL_MONGODB_URI);

  if (!mongoUri) {
    throw new MongoConfigurationError();
  }

  try {
    return await connectWithRetry(mongoUri);
  } catch (error) {
    const shouldFallbackToLocal =
      !isProduction && MONGODB_URI && mongoUri !== LOCAL_MONGODB_URI;

    if (!shouldFallbackToLocal) {
      throw error;
    }

    console.warn(
      "Configured MongoDB connection failed. Falling back to localhost MongoDB in development.",
      error
    );

    return await connectWithRetry(LOCAL_MONGODB_URI);
  }
}
