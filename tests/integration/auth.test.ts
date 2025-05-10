import TrainClient from "./client/TrainClient.js";

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import UserTestFixture from "../fixtures/UserTestFixture.js";
import mongoose from "mongoose";
import TestUtil from "./util/TestUtil.js";
import {
  UserResponse,
  UserRequest,
  UserLoginRequest,
} from "../../src/app/user/userDto.js";
import AuthDataProvider from "./dataProviders/AuthDataProvider.js";
import axios, { AxiosError } from "axios";

describe("Train Service Integration Tests", () => {
  let trainClient: TrainClient;
  let userResponse: UserResponse = UserTestFixture.createUserResponse();

  beforeAll(async () => {
    trainClient = new TrainClient();
    const mongoUri =
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/?replicaSet=rs0&directConnection=true";
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Initial cleanup to ensure a clean state
    await TestUtil.cleanupCollections();
  });

  afterAll(async () => {
    await TestUtil.cleanupCollections();
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  });

  it("should register a user successfully", async () => {
    const userRequest = UserTestFixture.createUserRequest({
      username: undefined,
      name: "Ryan Reynolds",
      password: "Password98!",
      isActive: undefined,
      email: "ryanReynolds1@gmail.com",
      authProvider: "local",
    });

    const response = await trainClient.register(userRequest);
    console.log("Response from register: ", response);
    userResponse = { ...response };

    expect(response.username).toBeDefined();
    expect(response.name).toBe(userRequest.name);
    expect(response.userId).toBeDefined();
    expect(response.token).toBeDefined();
  });

  it("should login a user successfully", async () => {
    // Arrange
    const userLoginRequest = UserTestFixture.createUserLoginRequest({
      email: "ryanReynolds1@gmail.com",
      password: "Password98!",
    });

    // Act
    const response = await trainClient.login(userLoginRequest);
    console.log("Response from login: ", response);

    // Assert
    expect(response.username).toBe(userResponse.username);
    expect(response.name).toBe(userResponse.name);
    expect(response.userId).toBe(userResponse.userId);
    expect(response.token).toBeDefined();
  });

  describe("User Registration Error Cases", () => {
    it.each(AuthDataProvider.registerUserErrorCases())(
      "$description",
      async ({ request, status, expectedErrorResponse }) => {
        try {
          await trainClient.register(request as UserRequest);
        } catch (error) {
          if (error instanceof AxiosError) {
            const axiosError = error as AxiosError;
            expect(axiosError.response?.status).toBe(status);

            const errorResponse = axiosError.response?.data;
            console.log("Register Error response: ", errorResponse);
            expect(errorResponse).toMatchObject(expectedErrorResponse);
          }
        }
      }
    );
  });

  describe("User Login Error Cases", () => {
    it.each(AuthDataProvider.loginUserErrorCases())(
      "$description",
      async ({ request, status, expectedErrorResponse }) => {
        try {
          await trainClient.login(request as UserLoginRequest);
        } catch (error) {
          if (error instanceof AxiosError) {
            const axiosError = error as AxiosError;
            expect(axiosError.response?.status).toBe(status);

            const errorResponse = axiosError.response?.data;
            console.log("Login Error response: ", errorResponse);
            expect(errorResponse).toMatchObject(expectedErrorResponse);
          }
        }
      }
    );
  });
});
