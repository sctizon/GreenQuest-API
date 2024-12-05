// src/controllers/leaderboardController.ts

import { Request, Response } from "express";
import { prisma } from "../index";

export const getLeaderboard = async (_: Request, res: Response) => {
    try {
        // Fetch top 10 users ordered by points in descending order
        const leaderboard = await prisma.user.findMany({
            orderBy: {
                points: "desc", // Order by points in descending order
        },
            take: 10, // Limit to top 10 users
            select: {
                id: true,
                fullName: true,
                points: true,
            },
        });

    return res.json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
