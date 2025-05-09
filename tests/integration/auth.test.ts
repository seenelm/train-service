import TrainClient from "./client/TrainClient.js";
import mongoose from "mongoose";

import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  MockedObject,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";
import UserTestFixture from "../fixtures/UserTestFixture.js";

describe("Train Service Integration Tests", () => {
  let trainClient: TrainClient;
  
  // Connect to the database before all tests
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/?replicaSet=rs0&directConnection=true";
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
    
    // Initial cleanup to ensure a clean state
    await cleanupCollections();
  });
  
  // Disconnect after all tests are done
  afterAll(async () => {
    // Final cleanup before disconnecting
    await cleanupCollections();
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
  });
  
  // Clean up collections before each test
  beforeEach(async () => {
    trainClient = new TrainClient();
    
    // Clean up all collections that might affect your tests
    await cleanupCollections();
  });
  
  // Clean up collections after each test
  afterEach(async () => {
    // Clean up all collections after the test completes
    await cleanupCollections();
  });
  
  // Helper function to clean up collections
  async function cleanupCollections() {
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
        'users',          // User collection
        'userprofiles',   // User profiles collection
        'follows',        // Follows collection
        'usergroups'      // User groups collection
      ];
      
      // Clean up each collection if it exists
      for (const collectionName of collectionsToClean) {
        const collection = collections.find(c => c.collectionName === collectionName);
        if (collection) {
          console.log(`Cleaning up ${collectionName} collection`);
          await collection.deleteMany({});
          const count = await collection.countDocuments({});
          console.log(`${collectionName} count after cleanup: ${count}`);
        }
      }
      
      console.log('Database cleanup completed');
    } catch (error) {
      console.error('Error during database cleanup:', error);
      throw error;
    }
  }

  it("should register a user successfully", async () => {
    // Generate a unique email for each test run to avoid conflicts
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const uniqueEmail = `testuser_${uniqueId}@example.com`;
    
    const userRequest = UserTestFixture.createUserRequest({
      username: undefined,
      name: "Test User",
      password: "Password98!1",
      isActive: undefined,
      email: uniqueEmail,
      authProvider: "local",
    });

    console.log(`Attempting to register user with email: ${uniqueEmail}`);
    const response = await trainClient.register(userRequest);
    console.log("Response from register: ", response);

    expect(response.username).toBeDefined();
    expect(response.name).toBe(userRequest.name);
    expect(response.userId).toBeDefined();
    expect(response.token).toBeDefined();
  });
  
  it("should register and then delete a user successfully", async () => {
    // Generate a unique email for this test
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const uniqueEmail = `deletetest_${uniqueId}@example.com`;
    
    // 1. Register a new user
    const userRequest = UserTestFixture.createUserRequest({
      username: undefined,
      name: "Delete Test User",
      password: "Password98!1",
      isActive: undefined,
      email: uniqueEmail,
      authProvider: "local",
    });

    console.log(`Registering user for deletion test with email: ${uniqueEmail}`);
    const registerResponse = await trainClient.register(userRequest);
    
    // Verify registration was successful
    expect(registerResponse.userId).toBeDefined();
    expect(registerResponse.username).toBeDefined();
    
    // 2. Delete the user we just created
    console.log(`Deleting user with ID: ${registerResponse.userId}`);
    const deleteResponse = await trainClient.deleteUser(registerResponse.userId);
    
    // 3. Verify deletion was successful
    expect(deleteResponse.success).toBe(true);
    expect(deleteResponse.message).toBe("User deleted successfully");
    
    // 4. Verify we can't log in with the deleted user's credentials
    try {
      await trainClient.login({
        email: uniqueEmail,
        password: "Password98!1"
      });
      // If login succeeds, the test should fail
      expect(true).toBe(false); // This will always fail if reached
    } catch (error) {
      // Type assertion for the error to access axios error properties
      const axiosError = error as { response: { status: number } };
      // Login should fail with a 404 Not Found error
      expect(axiosError.response.status).toBe(404);
    }
  });
});
