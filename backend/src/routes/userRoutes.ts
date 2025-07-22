import { Router, Request, Response } from "express";
import { signup, login } from "../controllers/userController";

const router = Router();

router.post("/signup", (req: Request, res: Response) => {
  signup(req, res);
});

router.post("/login", (req: Request, res: Response) => {
  login(req, res);
});

export default router;
