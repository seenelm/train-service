import TrainService from "./app.js";
import { Application } from "express";
import mongoose from "mongoose";
import envConfig from "./common/config/envConfig.js";
import { Logger } from "./common/logger.js";

let server: any = null;
const port = envConfig.server.port || 3000;
const trainService = TrainService.getInstance();
const app: Application = trainService.getApp();
const logger = Logger.getInstance();

async function startServer() {
  try {
    // Initialize the application
    await trainService.initializeDB();

    // Configure mongoose
    // mongoose.set("debug", process.env.NODE_ENV !== "production");

    // Start the Express server
    server = app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });

    // Handle shutdown signals
    setupGracefulShutdown();
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown() {
  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection", new Error(String(reason)));
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception", error);
    gracefulShutdown(1);
  });

  // Handle termination signals
  const signals = ["SIGINT", "SIGTERM", "SIGQUIT"];
  signals.forEach((signal) => {
    process.on(signal, () => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      gracefulShutdown(0);
    });
  });
}

/**
 * Perform graceful shutdown
 */
async function gracefulShutdown(exitCode: number) {
  try {
    if (server) {
      // Close HTTP server
      await new Promise<void>((resolve) => {
        server.close(() => {
          logger.info("HTTP server closed");
          resolve();
        });
      });
    }

    // Close database connection
    await trainService.db.close();
    logger.info("Database connection closed");

    // Exit process
    process.exit(exitCode);
  } catch (error) {
    logger.error("Error during graceful shutdown", error);
    process.exit(1);
  }
}

// Start the server
startServer();

export { server };
