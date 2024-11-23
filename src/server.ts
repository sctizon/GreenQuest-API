import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express, { Request, Response } from "express";
import expressWinston from "express-winston";
import winston from "winston";

import eventRoutes from "./routes/eventRoutes";
import participantRoutes from "./routes/participantRoutes";
import userRoutes from "./routes/userRoutes";

export const prisma = new PrismaClient();

// comentario deploy

const app = express();
const port = 8080;

async function main() {
  app.use(cors());
  app.use(express.json());

  // Log the whole request and response body
  expressWinston.requestWhitelist.push("body");
  expressWinston.responseWhitelist.push("body");

  // Logger makes sense before the router
  app.use(
    expressWinston.logger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
      ),
      level: "info",
      meta: false,
      msg: "HTTP {{req.method}} {{req.url}}",
      colorize: false,
    })
  );

  app.use("/uploads", express.static("uploads")); // Serve static files from the 'uploads' folder

  app.use("/api/events", eventRoutes);
  app.use("/api/participants", participantRoutes);
  app.use("/api/users", userRoutes);

  // Catch unregistered routes
  app.all("*", (req: Request, res: Response) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
  });

  // Error logger makes sense after the router
  app.use(
    expressWinston.errorLogger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
      ),
    })
  );

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
