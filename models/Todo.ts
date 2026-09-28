import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ITodo extends Document {
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new Schema<ITodo>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const TodoModel = (mongoose.models.Todo as Model<ITodo>) ||
  mongoose.model<ITodo>("Todo", TodoSchema);

export default TodoModel;
