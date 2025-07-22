import { Request, Response } from "express";
import Expense from "../models/Expense";
import validateExpense from "../utils/validateExpense";

// Create a new expense
export const createExpense = async (req: Request, res: Response) => {
  const errors = validateExpense(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      status: 400,
      message: errors.join(", "),
    });
  }

  try {
    const expense = new Expense({
      ...req.body,
      // @ts-ignore
      user: req.user._id, // req.user is set by auth middleware
    });
    await expense.save();
    res.status(201).json({
      data: [expense],
      status: 201,
    });
  } catch (error: any) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

// Get current user's expenses
export const getUserExpenses = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const expenses = await Expense.find({ user: req.user._id });
    res.status(200).json({
      data: expenses,
      status: 200,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Get all expenses (admin only)
export const getAllExpenses = async (req: Request, res: Response) => {
  // @ts-ignore
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      status: 403,
      message: "Access denied. Admins only.",
    });
  }

  try {
    const expenses = await Expense.find({}).populate("user", "name email");
    res.status(200).json({
      data: expenses,
      status: 200,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Update expense
export const updateExpense = async (req: Request, res: Response) => {
  const keys = Object.keys(req.body);

  if (keys.length === 1 && keys[0] === "status") {
    try {
      const expense = await Expense.findOneAndUpdate(
        { _id: req.params.id },
        { status: req.body.status },
        { new: true }
      );
      if (!expense) {
        return res.status(404).json({
          status: 404,
          message: "Expense not found",
        });
      }
      return res.status(200).json({
        data: [expense],
        status: 200,
      });
    } catch (error: any) {
      return res.status(400).json({
        status: 400,
        message: error.message,
      });
    }
  }

  const errors = validateExpense(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      status: 400,
      message: errors.join(", "),
    });
  }

  try {
    const expense = await Expense.findOneAndUpdate(
      // @ts-ignore
      { _id: req.params.id, user: req.user._id, status: "Pending" },
      req.body,
      { new: true }
    );
    if (!expense) {
      return res.status(404).json({
        status: 404,
        message: "Expense not found",
      });
    }
    res.status(200).json({
      data: [expense],
      status: 200,
    });
  } catch (error: any) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

// Delete expense
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      // @ts-ignore
      user: req.user._id,
    });
    if (!expense) {
      return res.status(404).json({
        status: 404,
        message: "Expense not found",
      });
    }
    res.status(200).json({
      status: 200,
      message: "Expense deleted",
    });
  } catch (error: any) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

// Admin: Category totals
export const categoryTotals = async (req: Request, res: Response) => {
  // @ts-ignore
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      status: 403,
      message: "Access denied. Admins only.",
    });
  }

  try {
    const results = await Expense.aggregate([
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $project: { _id: 0, category: "$_id", total: 1 } },
      { $sort: { total: -1 } },
    ]);
    res.json({ data: results });
  } catch {
    res.status(500).json({ message: "Failed to get category totals." });
  }
};

// Admin: User totals
export const userTotals = async (req: Request, res: Response) => {
  // @ts-ignore
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      status: 403,
      message: "Access denied. Admins only.",
    });
  }

  try {
    const results = await Expense.aggregate([
      { $group: { _id: "$user", total: { $sum: "$amount" } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userId: "$_id",
          total: 1,
          name: "$userInfo.name",
          username: "$userInfo.username",
        },
      },
      { $sort: { total: -1 } },
    ]);
    res.json({ data: results });
  } catch {
    res.status(500).json({ message: "Failed to get user totals." });
  }
};
