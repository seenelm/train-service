import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
} from "vitest";
import TrainClient from "./client/TrainClient.js";
import mongoose from "mongoose";
import TestUtil from "./util/TestUtil.js";
import UserTestFixture from "../fixtures/UserTestFixture.js";
import { UserResponse } from "@seenelm/train-core";
import UserProfileDataProvider from "./dataProviders/UserProfileDataProvider.js";

describe("User Profile Integration Tests", () => {
  let trainClient: TrainClient;
  let userResponse: UserResponse;

  beforeAll(async () => {
    trainClient = new TrainClient();
    const mongoUri =
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/?replicaSet=rs0&directConnection=true";
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await TestUtil.cleanupCollections();
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  });

  beforeEach(async () => {
    await TestUtil.cleanupCollections();

    // Register a user for testing
    const userRequest = UserTestFixture.createUserRequest({
      username: undefined,
      name: "Test User",
      password: "Password98!",
      isActive: undefined,
      email: "testuser@example.com",
      authProvider: "local",
    });

    userResponse = await trainClient.register(userRequest);
  });

  describe("createCustomSection", () => {
    describe("Success Cases", () => {
      it.each(UserProfileDataProvider.createCustomSectionSuccessCases())(
        "$description",
        async ({ request, expectedCreateResponse, expectedGetResponse }) => {
          // CREATE a custom section
          const response = await trainClient.createCustomSection(
            userResponse.userId,
            request
          );

          // Assert
          expect(response).toEqual(expectedCreateResponse);

          // GET the custom sections
          const customSections = await trainClient.getCustomSections(
            userResponse.userId
          );

          // Assert
          expect(customSections).toEqual(expectedGetResponse);

          // UPDATE the custom section

          // GET the custom sections

          // DELETE the custom section
          const deleteResponse = await trainClient.deleteCustomSection(
            userResponse.userId,
            expectedGetResponse[0].title
          );

          // GET the custom sections
          const updatedCustomSections = await trainClient.getCustomSections(
            userResponse.userId
          );

          // Assert
          expect(updatedCustomSections).toEqual([]);
        }
      );
    });
  });
});
