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
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Todo title is required" },
        { status: 400 }
      );
    }

    await connectMongo();
    const todo = await Todo.create({ title, completed: Boolean(body.completed) });

    return NextResponse.json({ success: true, todo }, { status: 201 });
  } catch (error) {
    console.error("POST /api/todos failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create todo" },
      { status: 500 }
    );
  }
}
