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
  async connect(): Promise<void> {
    const db = mongoose.connection;

    db.on("error", (err) => {
      this.logger.error("Error connecting to Database: ", err);
    });

    db.once("open", () => {
      this.logger.info("Database connected successfully!!");
    });

    try {
      this.logger.info("Mongodb connection URI: ", this.dbUri);
      await mongoose.connect(this.dbUri);
    } catch (error) {
      this.logger.error("Error on initial connection: ", error);
      throw error;
    }
  }

  // Close connection to MongoDB database.
  async close(): Promise<void> {
    await mongoose.connection.close().catch((error) => {
      console.error(error);
    });
  }
}

export default MongoDB;
