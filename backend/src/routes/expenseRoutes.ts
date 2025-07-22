import { Router, Request, Response } from "express";
import {
  createExpense,
  getUserExpenses,
  getAllExpenses,
  updateExpense,
  deleteExpense,
  categoryTotals,
  userTotals,
} from "../controllers/expenseController";
import auth from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(auth);

// CRUD routes for expenses
router.post("/", (req: Request, res: Response) => createExpense(req, res));
router.get("/", (req: Request, res: Response) => getUserExpenses(req, res));
router.get("/all", (req: Request, res: Response) => getAllExpenses(req, res));
router.put("/:id", (req: Request, res: Response) => updateExpense(req, res));
router.delete("/:id", (req: Request, res: Response) => deleteExpense(req, res));

// --- Admin Analytics ---
router.get("/admin/analytics/category-totals", (req: Request, res: Response) =>
  categoryTotals(req, res)
);
router.get("/admin/analytics/users", userTotals);

export default router;
