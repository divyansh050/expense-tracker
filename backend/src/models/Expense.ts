import { Schema, model, Document, Types } from "mongoose";

export interface IExpense extends Document {
  user: Types.ObjectId;
  category: string;
  amount: number;
  date: Date;
  description?: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt?: Date;
  updatedAt?: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Expense = model<IExpense>("Expense", expenseSchema);

export default Expense;
