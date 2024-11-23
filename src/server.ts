import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";

import eventRoutes from "./routes/eventRoutes";
import participantRoutes from "./routes/participantRoutes";
import userRoutes from "./routes/userRoutes";

export const prisma = new PrismaClient();

const app = express();
const port = 8080;

async function main() {
  app.use(express.json());

  app.use("/uploads", express.static("uploads")); // Serve static files from the 'uploads' folder

  app.use("/api/events", eventRoutes);
  app.use("/api/participants", participantRoutes);
  app.use("/api/users", userRoutes);

  // Catch unregistered routes
  app.all("*", (req: Request, res: Response) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
  });

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

main()
  .then(async () => {
    await prisma.$connect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
