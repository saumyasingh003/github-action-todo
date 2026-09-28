import { NextResponse } from "next/server";

import { connectMongo } from "@/lib/mongodb";
import Todo from "@/models/Todo";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectMongo();
    const todo = await Todo.findById(id);

    if (!todo) {
      return NextResponse.json(
        { success: false, message: "Todo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, todo });
  } catch (error) {
    console.error("GET /api/todos/[id] failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch todo" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const payload: Record<string, unknown> = {};

    if (typeof body.title === "string") {
      payload.title = body.title.trim();
    }

    if (typeof body.completed === "boolean") {
      payload.completed = body.completed;
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json(
        { success: false, message: "No update fields provided" },
        { status: 400 }
      );
    }

    await connectMongo();
    const todo = await Todo.findByIdAndUpdate(id, payload, { new: true });

    if (!todo) {
      return NextResponse.json(
        { success: false, message: "Todo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, todo });
  } catch (error) {
    console.error("PUT /api/todos/[id] failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectMongo();
    const todo = await Todo.findByIdAndDelete(id);

    if (!todo) {
      return NextResponse.json(
        { success: false, message: "Todo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deletedTodo: todo });
  } catch (error) {
    console.error("DELETE /api/todos/[id] failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
