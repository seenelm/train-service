import mongoose from "mongoose";

export default class TestUtil {
  static async cleanupCollections() {
    try {
      // Ensure we're connected
      if (mongoose.connection.readyState !== 1) {
        console.log("MongoDB connection not ready, skipping cleanup");
        return;
      }

      // Check if db is defined
      if (!mongoose.connection.db) {
        console.log("MongoDB database not available, skipping cleanup");
        return;
      }

      // Get all collection names directly from the database
      const collections = await mongoose.connection.db.collections();

      // List of collections to clean up
      const collectionsToClean = [
        "users", // User collection
        "userprofiles", // User profiles collection
        "follows", // Follows collection
        "usergroups", // User groups collection
      ];

      // Clean up each collection if it exists
      for (const collectionName of collectionsToClean) {
        const collection = collections.find(
          (c) => c.collectionName === collectionName
        );
        if (collection) {
          console.log(`Cleaning up ${collectionName} collection`);
          await collection.deleteMany({});
          const count = await collection.countDocuments({});
          console.log(`${collectionName} count after cleanup: ${count}`);
        }
      }

      console.log("Database cleanup completed");
    } catch (error) {
      console.error("Error during database cleanup:", error);
      throw error;
    }
  }

  static async closeConnection() {
    await mongoose.connection.close();
  }
}
