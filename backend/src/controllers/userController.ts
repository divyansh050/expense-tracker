import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import validateUser from "../utils/validateUser";

const JWT_SECRET = process.env.JWT_SECRET as string;

// Register (Sign up)
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { username, password, name, email, role } = req.body;
  const errors = validateUser(req.body, { isSignup: true });

  if (errors.length > 0) {
    res.status(400).json({
      status: 400,
      message: errors.join(", "),
    });
    return;
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      res.status(409).json({
        status: 409,
        message: "Username or Email already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      name,
      email,
      role: role || "employee",
    });

    await user.save();

    const token = jwt.sign(
      { _id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      status: 201,
      message: "User registered successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validateUser(req.body);

  if (errors.length > 0) {
    res.status(400).json({
      status: 400,
      message: errors.join(", "),
    });
    return;
  }

  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({
        status: 401,
        message: "Invalid username or password",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        status: 401,
        message: "Invalid username or password",
      });
      return;
    }

    const token = jwt.sign(
      { _id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      status: 200,
      message: "Login successful",
    });
  } catch (error: any) {
    res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
};
