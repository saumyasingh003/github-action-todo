import { NextResponse } from "next/server";

import { MongoConfigurationError } from "@/lib/mongodb";

const MONGO_CONNECTIVITY_ERRORS = new Set([
  "MongooseServerSelectionError",
  "MongoServerSelectionError",
  "MongoNetworkError",
]);

export function apiErrorResponse(
  error: unknown,
  operation: string,
  fallbackMessage: string
) {
  console.error(`${operation} failed:`, error);

  if (error instanceof MongoConfigurationError) {
    return NextResponse.json(
      {
        success: false,
        code: "MONGODB_URI_MISSING",
        message: "Database configuration is missing. Set MONGODB_URI in the Vercel Production environment and redeploy.",
      },
      { status: 500 }
    );
  }

  if (error instanceof Error && MONGO_CONNECTIVITY_ERRORS.has(error.name)) {
    return NextResponse.json(
      {
        success: false,
        code: "DATABASE_UNAVAILABLE",
        message: "MongoDB is unreachable. Check the connection URI and Atlas Network Access allowlist.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: fallbackMessage,
    },
    { status: 500 }
  );
}