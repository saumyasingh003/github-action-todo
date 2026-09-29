import { NextResponse } from "next/server";

import { connectMongo } from "@/lib/mongodb";
import Todo from "@/models/Todo";

export async function GET() {
  try {
    await connectMongo();
    const todos = await Todo.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, todos });
  } catch (error) {
    console.error("GET /api/todos failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Request body must be a JSON object" },
        { status: 400 }
      );
    }

    const payload = body as Record<string, unknown>;
    const title = typeof payload.title === "string" ? payload.title.trim() : "";

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Todo title is required" },
        { status: 400 }
      );
    }

    if (payload.completed !== undefined && typeof payload.completed !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Todo completed must be a boolean" },
        { status: 400 }
      );
    }

    await connectMongo();
    const todo = await Todo.create({
      title,
      completed: payload.completed ?? false,
    });

    return NextResponse.json({ success: true, todo }, { status: 201 });
  } catch (error) {
    console.error("POST /api/todos failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create todo" },
      { status: 500 }
    );
  }
}
