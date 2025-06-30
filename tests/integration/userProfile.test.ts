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
  });

  describe("Custom Section CRUD", () => {
    describe("Create Custom Section", () => {
      it.each(UserProfileDataProvider.createCustomSectionSuccessCases())(
        "$description",
        async ({ createRequest, expectedResponse }) => {
          const userRequest = UserTestFixture.createUserRequest({
            username: undefined,
            name: "Test User",
            password: "Password98!",
            isActive: undefined,
            email: "testuser@example.com",
            authProvider: "local",
          });

          const userResponse = await trainClient.register(userRequest);

          // CREATE a custom section
          const createResponse = await trainClient.createCustomSection(
            userResponse.userId,
            createRequest
          );

          // Assert create response
          expect(createResponse).toEqual({ success: true });

          // GET the custom sections to verify creation
          const customSections = await trainClient.getCustomSections(
            userResponse.userId
          );

          expect(customSections).toEqual(expectedResponse);
        }
      );
    });

    describe("Update Custom Section", () => {
      it.each(UserProfileDataProvider.updateCustomSectionSuccessCases())(
        "$description",
        async ({ createRequest, updateRequest, expectedResponse }) => {
          const userRequest = UserTestFixture.createUserRequest({
            username: undefined,
            name: "Test User",
            password: "Password98!",
            isActive: undefined,
            email: "testuser@example.com",
            authProvider: "local",
          });

          const userResponse = await trainClient.register(userRequest);

          // Create a custom section
          const createResponse = await trainClient.createCustomSection(
            userResponse.userId,
            createRequest
          );
          expect(createResponse).toEqual({ success: true });

          // Update the custom section
          const updateResponse = await trainClient.updateCustomSection(
            userResponse.userId,
            updateRequest!
          );
          expect(updateResponse).toEqual({ success: true });

          // Verify the update by getting the custom sections
          const updatedCustomSections = await trainClient.getCustomSections(
            userResponse.userId
          );
          expect(updatedCustomSections).toEqual(expectedResponse);
        }
      );
    });

    describe("Delete Custom Section", () => {
      it.each(UserProfileDataProvider.deleteCustomSectionSuccessCases())(
        "$description",
        async ({ createRequest, sectionTitleToDelete }) => {
          const userRequest = UserTestFixture.createUserRequest({
            username: undefined,
            name: "Test User",
            password: "Password98!",
            isActive: undefined,
            email: "testuser@example.com",
            authProvider: "local",
          });

          const userResponse = await trainClient.register(userRequest);

          // First create a custom section
          const createResponse = await trainClient.createCustomSection(
            userResponse.userId,
            createRequest
          );
          expect(createResponse).toEqual({ success: true });

          // // Verify the section exists
          // const sectionsBeforeDelete = await trainClient.getCustomSections(
          //   userResponse.userId
          // );
          // expect(sectionsBeforeDelete).toHaveLength(1);
          // expect(sectionsBeforeDelete[0].title).toBe(createRequest.title);

          // Delete the custom section
          const deleteResponse = await trainClient.deleteCustomSection(
            userResponse.userId,
            sectionTitleToDelete
          );
          expect(deleteResponse).toEqual({ success: true });

          // Verify the section was deleted
          const sectionsAfterDelete = await trainClient.getCustomSections(
            userResponse.userId
          );
          expect(sectionsAfterDelete).toHaveLength(0);
        }
      );
    });
  });
});
