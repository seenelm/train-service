import express, { Application } from "express";
import MongoDB from "./infrastructure/database/db.js";
import routes from "./routes/index.js";
import { Logger } from "./common/logger.js";
import { errorHandler } from "./common/middleware/errorHandler.js";
import cors from "cors";
import "dotenv/config";

export default class TrainService {
  private static instance: TrainService;
  public app: Application;
  public db: MongoDB;
  private logger: Logger;

  private constructor() {
    this.app = express();
    this.db = new MongoDB(process.env.MONGO_URI);
    this.logger = Logger.getInstance();
    this.logger.info("Database uri: ", process.env.MONGO_URI);

    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandler();
  }

  public static getInstance(): TrainService {
    if (!TrainService.instance) {
      TrainService.instance = new TrainService();
    }
    return TrainService.instance;
  }

  public getApp(): Application {
    return this.app;
  }

  public async initializeDB(): Promise<void> {
    try {
      await this.db.connect();
    } catch (error) {
      this.logger.error("Failed to connect to the database", error);
      throw error;
    }
  }

  private configureMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private configureRoutes(): void {
    this.app.get("/health", (req, res) => res.send("OK"));
    this.app.use("/api", routes);
  }

  private configureErrorHandler(): void {
    this.app.use(errorHandler);
  }
}
