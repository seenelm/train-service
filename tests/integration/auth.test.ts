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
    await mongoose.connect(mongoUri);
  });
  
  // Disconnect after all tests are done
  afterAll(async () => {
    await mongoose.connection.close();
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
    const collections = mongoose.connection.collections;
    
    // List of collections to clean up
    const collectionsToClean = [
      'users',          // User collection
      'userprofiles',   // User profiles collection
      'follows',        // Follows collection
      'usergroups'      // User groups collection (if it exists)
    ];
    
    // Clean up each collection if it exists
    for (const collectionName of collectionsToClean) {
      if (collections[collectionName]) {
        console.log(`Cleaning up ${collectionName} collection`);
        await collections[collectionName].deleteMany({});
      }
    }
    
    // Log the cleaned collections
    console.log('Database cleanup completed');
  }

  it("should register a user successfully", async () => {
    const userRequest = UserTestFixture.createUserRequest({
      username: undefined,
      name: "Test User",
      password: "Password98!1",
      isActive: undefined,
      email: "testuser@gmail.com",
      authProvider: "local",
    });

    const response = await trainClient.register(userRequest);
    console.log("Response from register: ", response);

    expect(response.username).toBeDefined();
    expect(response.name).toBe(userRequest.name);
    expect(response.userId).toBeDefined();
    expect(response.token).toBeDefined();
  });
});
