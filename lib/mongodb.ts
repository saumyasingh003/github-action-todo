import mongoose from "mongoose";

const MONGODB_URI = (process.env.MONGODB_URI ?? "").trim();

if (!MONGODB_URI) {
  console.warn(
    "MONGODB_URI is not defined. Falling back to localhost MongoDB."
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
  const mongoUri = (MONGODB_URI || "mongodb://127.0.0.1:27017/todoapp").replace(/\s+/g, "");

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
