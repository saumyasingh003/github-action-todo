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
    throw new Error(
      "MONGODB_URI is missing. Add it in Vercel / GitHub environment variables before deploying."
    );
  }

  return await connectWithRetry(mongoUri);
}
