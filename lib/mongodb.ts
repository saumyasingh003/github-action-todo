import mongoose from "mongoose";

const MONGODB_URI = (process.env.MONGODB_URI ?? "").trim();
const isProduction = process.env.NODE_ENV === "production";

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

export async function connectMongo() {
  const mongoUri = MONGODB_URI
    ? MONGODB_URI.replace(/\s+/g, "")
    : isProduction
      ? ""
      : "mongodb://127.0.0.1:27017/todoapp";

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI is missing. Add it in Vercel / GitHub environment variables before deploying."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      dbName: "todoapp",
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
