import express, { Application } from "express";
import envConfig from "./common/config/envConfig.js";
import MongoDB from "./infrastructure/database/db.js";
import routes from "./routes/index.js";
import { Logger } from "./common/logger.js";
import { errorHandler } from "./common/middleware/errorHandler.js";
import "dotenv/config";

export default class TrainService {
  private static instance: TrainService;
  public app: Application;
  public db: MongoDB;
  private logger: Logger;

  private constructor() {
    this.app = express();
    this.db = new MongoDB(envConfig.database.uri);
    this.logger = Logger.getInstance();

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
      this.logger.info("Database connected successfully");
    } catch (error) {
      this.logger.error("Failed to connect to the database", error);
      throw error;
    }
  }

  private configureMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private configureRoutes(): void {
    this.app.use("/api", routes);
  }

  private configureErrorHandler(): void {
    this.app.use(errorHandler);
  }
}

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.get("/", (req, res) => res.send("Hello, world!"));

// app.listen(PORT, () =>
//   console.log(`Server running on http://localhost:${PORT}`)
// );

// export default app;
