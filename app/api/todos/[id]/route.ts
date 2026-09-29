import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { apiErrorResponse } from "@/lib/api-error";
import { connectMongo } from "@/lib/mongodb";
import Todo from "@/models/Todo";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid todo ID" },
        { status: 400 }
      );
    }

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
    return apiErrorResponse(error, "GET /api/todos/[id]", "Failed to fetch todo");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid todo ID" },
        { status: 400 }
      );
    }

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

    const requestBody = body as Record<string, unknown>;
    const payload: Record<string, unknown> = {};

    if (requestBody.title !== undefined) {
      if (typeof requestBody.title !== "string" || !requestBody.title.trim()) {
        return NextResponse.json(
          { success: false, message: "Todo title must be a non-empty string" },
          { status: 400 }
        );
      }

      payload.title = requestBody.title.trim();
    }

    if (requestBody.completed !== undefined) {
      if (typeof requestBody.completed !== "boolean") {
        return NextResponse.json(
          { success: false, message: "Todo completed must be a boolean" },
          { status: 400 }
        );
      }

      payload.completed = requestBody.completed;
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json(
        { success: false, message: "No update fields provided" },
        { status: 400 }
      );
    }

    await connectMongo();
    const todo = await Todo.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!todo) {
      return NextResponse.json(
        { success: false, message: "Todo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, todo });
  } catch (error) {
    return apiErrorResponse(error, "PUT /api/todos/[id]", "Failed to update todo");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid todo ID" },
        { status: 400 }
      );
    }

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
    return apiErrorResponse(error, "DELETE /api/todos/[id]", "Failed to delete todo");
  }
}
