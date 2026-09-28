"use client";

import { FormEvent, useEffect, useState } from "react";

type Todo = {
  _id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos");
      const data = await response.json();

      if (data.success) {
        setTodos(data.todos ?? []);
      }
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTodos();
  }, []);

  const handleAddTodo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setSaving(true);

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: trimmedTitle }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to create todo");
      }

      setTitle("");
      await fetchTodos();
    } catch (error) {
      console.error("Create todo failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      const response = await fetch(`/api/todos/${todo._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update todo");
      }

      await fetchTodos();
    } catch (error) {
      console.error("Update todo failed:", error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete todo");
      }

      await fetchTodos();
    } catch (error) {
      console.error("Delete todo failed:", error);
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo._id);
    setEditingText(todo.title);
  };

  const saveEdit = async (id: string) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: trimmed }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update todo");
      }

      setEditingId(null);
      setEditingText("");
      await fetchTodos();
    } catch (error) {
      console.error("Edit todo failed:", error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-lg">
        <header className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            MongoDB Todo App
          </p>
          <h1 className="mt-2 text-3xl font-bold">Todo List</h1>
        </header>

        <form onSubmit={handleAddTodo} className="mb-6 flex gap-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-400 focus:bg-white"
          />
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {saving ? "Saving..." : "Add Todo"}
          </button>
        </form>

        {loading ? (
          <p className="text-slate-500">Loading todos...</p>
        ) : todos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-slate-500">
            No todos yet. Add your first one.
          </p>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li
                key={todo._id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
              >
                <div className="flex flex-1 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo)}
                    className="h-4 w-4 accent-indigo-600"
                  />

                  {editingId === todo._id ? (
                    <input
                      value={editingText}
                      onChange={(event) => setEditingText(event.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
                    />
                  ) : (
                    <span
                      className={`flex-1 ${
                        todo.completed ? "text-slate-400 line-through" : "text-slate-700"
                      }`}
                    >
                      {todo.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editingId === todo._id ? (
                    <>
                      <button
                        onClick={() => saveEdit(todo._id)}
                        className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-400"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingText("");
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(todo)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteTodo(todo._id)}
                    className="rounded-lg bg-rose-500 px-3 py-2 text-sm font-medium text-white hover:bg-rose-400"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
