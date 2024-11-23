import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// const secret = process.env.JWT_SECRET

// if (!secret) {
//   throw new Error('JWT_SECRET is not defined in the environment variables');
// }

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    res.status(400).json({ message: "All fields are required." });
    return;
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Invalid email format." });
    return;
  }

  // Password strength validation
  if (password.length < 8) {
    res
      .status(400)
      .json({ message: "Password must be at least 8 characters long." });
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "Email is already registered." });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user
    const newUser = await prisma.user.create({
      data: { fullName, email, password: hashedPassword },
    });

    // Generate JWT token
    // const token = jwt.sign(
    //   { userId: newUser.id, email: newUser.email },
    //   secret,
    //   { expiresIn: '1h' }
    // );

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, fullName: user.fullName },
      process.env.JWT_SECRET || "fallback-secret-key",
      { expiresIn: "1d" } // Token validity: 1 day
    );

    // Include fullName and token in the response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        userId: user.id,
        email: user.email,
        fullName: user.fullName, // Include the user's full name
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-key"
    );
    console.log("Decoded token:", decoded);

    const userId = (decoded as { userId: number }).userId;
    console.log("Extracted userId:", userId);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: Invalid token." });
      return;
    }

    // Fetch user data from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Fetch events created by the user using `userId`
    const eventsCreatedCount = await prisma.event.count({
      where: { userId }, // Directly filter by `userId`
    });

    // Fetch events the user participated in using the `Participant` table
    const eventsParticipatedCount = await prisma.participant.count({
      where: { userId }, // Directly filter by `userId` in the `Participant` model
    });

    res.status(200).json({
      fullName: user.fullName,
      email: user.email,
      eventsCreated: eventsCreatedCount,
      eventsParticipated: eventsParticipatedCount,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
