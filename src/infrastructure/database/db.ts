import mongoose from "mongoose";
import { Logger } from "../../common/logger.js";
class MongoDB {
  private dbUri: any;
  private logger: Logger;

  constructor(dbUri: any) {
    this.logger = Logger.getInstance();
    this.dbUri = dbUri;
  }

  async startSession(): Promise<mongoose.ClientSession> {
    if (mongoose.connection.readyState) {
      return await mongoose.startSession();
    }
    throw new Error("No active Mongoose Connection.");
  }

  /**
   * Connect to MongoDB database.
   */
  async connect(retries = 5, delay = 1000): Promise<void> {
    try {
      await mongoose.connect(this.dbUri);

      mongoose.connection.on("error", (err) => {
        this.logger.error("MongoDB connection error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        this.logger.warn("MongoDB disconnected. Attempting to reconnect...");
        setTimeout(() => this.connect(), 1000); // reconnect automatically
      });

      mongoose.connection.once("open", () => {
        this.logger.info("MongoDB connected successfully");
      });
    } catch (error) {
      this.logger.error("Error connecting to MongoDB:", error);
      if (retries > 0) {
        this.logger.info(`Retrying DB connection in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        await this.connect(retries - 1, delay * 2); // exponential backoff
      } else {
        throw error;
      }
    }
  }

  // Close connection to MongoDB database.
  async close(): Promise<void> {
    await mongoose.connection.close().catch((error) => {
      this.logger.error("Error closing MongoDB connection: ", error);
    });
  }
}

export default MongoDB;
