import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import expressWinston from "express-winston";
import winston from "winston";

import eventRoutes from "./routes/eventRoutes";
import participantRoutes from "./routes/participantRoutes";
import userRoutes from "./routes/userRoutes";

export const prisma = new PrismaClient();
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

async function main() {
  app.use(cors());
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: false })); // Create application/x-www-form-urlencoded parser

  // Log the whole request and response body
  expressWinston.requestWhitelist.push("body");
  expressWinston.responseWhitelist.push("body");

  // Logger
  app.use(
    expressWinston.logger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
      ),
      meta: false,
      msg: "HTTP {{req.method}} {{req.url}}",
      colorize: false,
    })
  );

  app.get("/", (_: Request, res: Response) => {
    // Route to test if the server is running
    res.send("Hello World!");
  });

  app.use("/uploads", express.static("uploads")); // Serve static files from the 'uploads' folder

  app.use("/api/events", eventRoutes);
  app.use("/api/participants", participantRoutes);
  app.use("/api/users", userRoutes);

  // Catch unregistered routes
  app.all("*", (req: Request, res: Response) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
  });

  // Error logger
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
