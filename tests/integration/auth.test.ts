import TrainClient from "./client/TrainClient.js";

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
} from "vitest";
import UserTestFixture from "../fixtures/UserTestFixture.js";
import mongoose from "mongoose";
import TestUtil from "./util/TestUtil.js";
import {
  UserResponse,
  UserRequest,
  UserLoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
  ResetPasswordWithCodeRequest,
} from "../../src/app/user/userDto.js";
import AuthDataProvider from "./dataProviders/AuthDataProvider.js";
import axios, { AxiosError } from "axios";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import {
  AuthErrorType,
  ValidatePasswordReset,
} from "../../src/common/enums.js";
import {
  RegisterUserAPIError,
  LoginUserAPIError,
} from "../../src/common/enums.js";

describe("Train Service Integration Tests", () => {
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

  describe("User Registration and Login", () => {
    let userResponse: UserResponse = UserTestFixture.createUserResponse();

    it("should register and login a user successfully", async () => {
      // Register a new user
      // Arrange
      const userRequest = UserTestFixture.createUserRequest({
        username: undefined,
        name: "Ryan Reynolds",
        password: "Password98!",
        isActive: undefined,
        email: "ryanReynolds1@gmail.com",
        authProvider: "local",
      });

      // Act
      const registerResponse = await trainClient.register(userRequest);
      userResponse = { ...registerResponse };

      // Assert
      expect(registerResponse.username).toBeDefined();
      expect(registerResponse.name).toBe(userRequest.name);
      expect(registerResponse.userId).toBeDefined();
      expect(registerResponse.accessToken).toBeDefined();

      // Login existing user
      // Arrange
      const userLoginRequest = UserTestFixture.createUserLoginRequest({
        email: "ryanReynolds1@gmail.com",
        password: "Password98!",
      });

      // Act
      const loginResponse = await trainClient.login(userLoginRequest);
      console.log("Response from login: ", loginResponse);

      // Assert
      expect(loginResponse.username).toBe(userResponse.username);
      expect(loginResponse.name).toBe(userResponse.name);
      expect(loginResponse.userId).toBe(userResponse.userId);
      expect(loginResponse.accessToken).toBeDefined();
    });

    describe("User Registration Error Cases", () => {
      it("should return 409 status code when user already exists with the same email", async () => {
        // First register a user
        const userRequest = UserTestFixture.createUserRequest({
          username: undefined,
          name: "Ryan Reynolds",
          password: "Password98!",
          isActive: undefined,
          email: "ryanReynolds1@gmail.com",
          authProvider: "local",
        });

        await trainClient.register(userRequest);

        // Try to register the same user again
        try {
          await trainClient.register(userRequest);
        } catch (error) {
          if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(HttpStatusCode.CONFLICT);
            expect(error.response?.data).toMatchObject({
              message: RegisterUserAPIError.UserAlreadyExists,
              errorCode: "CONFLICT",
            });
          }
        }
      });

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
              expect(errorResponse).toMatchObject(expectedErrorResponse);
            }
          }
        }
      );
    });

    describe("User Login Error Cases", () => {
      it("should return 404 status code when user is not found by email", async () => {
        const loginRequest = UserTestFixture.createUserLoginRequest({
          email: "ryanReynolds1@gmail.com",
          password: "Password98!",
        });

        try {
          await trainClient.login(loginRequest);
        } catch (error) {
          if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(HttpStatusCode.NOT_FOUND);
            expect(error.response?.data).toMatchObject({
              message: LoginUserAPIError.UserNotFound,
              errorCode: "NOT_FOUND",
            });
          }
        }
      });

      it("should return 500 status code when password is invalid", async () => {
        const userRequest = UserTestFixture.createUserRequest({
          username: undefined,
          name: "Ryan Reynolds",
          password: "Password98!",
          isActive: undefined,
          email: "ryanReynolds1@gmail.com",
          authProvider: "local",
        });

        await trainClient.register(userRequest);

        // Try to login with wrong password
        const loginRequest = UserTestFixture.createUserLoginRequest({
          email: "ryanReynolds1@gmail.com",
          password: "Password99!",
        });

        try {
          await trainClient.login(loginRequest);
        } catch (error) {
          if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(
              HttpStatusCode.INTERNAL_SERVER_ERROR
            );
            expect(error.response?.data).toMatchObject({
              message: LoginUserAPIError.InvalidPassword,
              errorCode: "INVALID_PASSWORD",
            });
          }
        }
      });
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
              expect(errorResponse).toMatchObject(expectedErrorResponse);
            }
          }
        }
      );
    });
  });

  describe("Token Refresh", () => {
    let userResponse: UserResponse;
    let refreshToken: string;
    let deviceId: string;

    beforeEach(async () => {
      deviceId = trainClient.generateDeviceId();
      // Register and login a user to get initial tokens
      const userRequest = UserTestFixture.createUserRequest({
        username: undefined,
        name: "Will Ferrell",
        password: "Password98!",
        isActive: undefined,
        email: "willFerrell1@gmail.com",
        authProvider: "local",
        deviceId: deviceId,
      });

      userResponse = await trainClient.register(userRequest);
      refreshToken = userResponse.refreshToken;
    });

    it("should successfully refresh tokens", async () => {
      // Arrange
      const refreshTokenRequest = UserTestFixture.createRefreshTokenRequest({
        refreshToken: refreshToken,
        deviceId: deviceId,
      });

      // Act
      const response = await trainClient.refreshTokens(refreshTokenRequest);

      // Assert
      expect(response.accessToken).toBeDefined();
      expect(response.refreshToken).toBeDefined();
      expect(response.accessToken).not.toBe(userResponse.accessToken);
      expect(response.refreshToken).not.toBe(refreshToken);
    });

    describe("Error Cases", () => {
      it("should return 403 when refresh token is expired", async () => {
        // 1. Register a user to get a valid refresh token
        const deviceId = trainClient.generateDeviceId();
        const userRequest = UserTestFixture.createUserRequest({
          username: undefined,
          name: "Ben Stiller",
          password: "Password98!",
          isActive: undefined,
          email: "benStiller1@gmail.com",
          authProvider: "local",
          deviceId: deviceId,
        });

        const registerResponse = await trainClient.register(userRequest);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        // 2. Expire the refresh token
        const refreshTokenRequest = UserTestFixture.createRefreshTokenRequest({
          refreshToken: registerResponse.refreshToken,
          deviceId: deviceId,
        });
        await trainClient.expireRefreshToken(refreshTokenRequest);

        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 1 second

        // 3. Try to use the expired token
        try {
          await trainClient.refreshTokens(refreshTokenRequest);
        } catch (error) {
          if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(HttpStatusCode.FORBIDDEN);
            expect(error.response?.data).toMatchObject({
              message: AuthErrorType.InvalidRefreshToken,
              errorCode: "FORBIDDEN",
            });
          }
        }
      });
      it.each(
        AuthDataProvider.refreshTokenErrorCases(async () => {
          const userRequest = UserTestFixture.createUserRequest({
            email: "refreshtest@example.com",
            password: "Password98!",
          });
          const registerResponse = await trainClient.register(userRequest);

          return {
            refreshToken: registerResponse.refreshToken,
            deviceId: UserTestFixture.DEVICE_ID,
          };
        })
      )("$description", async ({ request, status, expectedErrorResponse }) => {
        try {
          // Handle both static and async requests
          const finalRequest =
            typeof request === "function" ? await request() : request;

          await trainClient.refreshTokens(finalRequest as RefreshTokenRequest);
        } catch (error) {
          if (error instanceof AxiosError) {
            const axiosError = error as AxiosError;
            expect(axiosError.response?.status).toBe(status);

            const errorResponse = axiosError.response?.data;

            expect(errorResponse).toMatchObject(expectedErrorResponse);
          }
        }
      });
    });
  });

  describe("Password Reset", () => {
    let userResponse: UserResponse;
    let userRequest: UserRequest;
    let resetCode: string;
    let deviceId: string;

    beforeEach(async () => {
      deviceId = trainClient.generateDeviceId();
      userRequest = UserTestFixture.createUserRequest({
        username: undefined,
        name: "Will Ferrell",
        password: "Password98!",
        isActive: undefined,
        email: "willFerrell1@gmail.com",
        authProvider: "local",
      });

      userResponse = await trainClient.register(userRequest);
    });

    it("should successfully reset password with valid code", async () => {
      // 1. Request password reset
      await trainClient.requestPasswordReset({
        email: userRequest.email,
      });

      const resetCode = await trainClient.getResetCode(userResponse.userId);
      // 3. Reset password with the code
      const newPassword = "NewPassword123!";
      await trainClient.resetPasswordWithCode({
        email: userRequest.email,
        resetCode,
        newPassword,
      });

      // 4. Verify we can login with new password
      const loginResponse = await trainClient.login({
        email: userRequest.email,
        password: newPassword,
        deviceId: deviceId,
      });

      expect(loginResponse.username).toBe(userResponse.username);
      expect(loginResponse.name).toBe(userResponse.name);
      expect(loginResponse.userId).toBe(userResponse.userId);
      expect(loginResponse.accessToken).toBeDefined();
      expect(loginResponse.refreshToken).toBeDefined();
    });

    describe("Password Reset Error Cases", () => {
      it("should return 400 when email is missing", async () => {
        const requestPasswordResetRequest =
          UserTestFixture.createPasswordResetRequest({
            email: undefined,
          });

        try {
          await trainClient.requestPasswordReset(requestPasswordResetRequest);
        } catch (error) {
          if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(HttpStatusCode.BAD_REQUEST);
            expect(error.response?.data).toMatchObject({
              message: "Validation failed",
              errorCode: "BAD_REQUEST",
              details: [ValidatePasswordReset.EmailRequired],
            });
          }
        }
      });
    });

    describe("Reset Password with Code Error Cases", () => {
      it.each(AuthDataProvider.resetPasswordWithCodeErrorCases())(
        "$description",
        async ({ request, status, expectedErrorResponse }) => {
          try {
            await trainClient.resetPasswordWithCode(
              request as ResetPasswordWithCodeRequest
            );
          } catch (error) {
            if (error instanceof AxiosError) {
              const axiosError = error as AxiosError;
              expect(axiosError.response?.status).toBe(status);

              const errorResponse = axiosError.response?.data;
              expect(errorResponse).toMatchObject(expectedErrorResponse);
            }
          }
        }
      );
    });
  });

  describe("Logout", () => {
    let userResponse: UserResponse = UserTestFixture.createUserResponse();
    let deviceId: string;

    beforeEach(async () => {
      deviceId = trainClient.generateDeviceId();
      const userRequest = UserTestFixture.createUserRequest({
        username: undefined,
        name: "Will Ferrell",
        password: "Password98!",
        isActive: undefined,
        email: "willFerrell1@gmail.com",
        authProvider: "local",
        deviceId: deviceId,
      });

      userResponse = await trainClient.register(userRequest);
    });

    it("should successfully logout user", async () => {
      const logoutRequest = UserTestFixture.createLogoutRequest({
        refreshToken: userResponse.refreshToken,
        deviceId: deviceId,
      });
      await trainClient.logout(logoutRequest);

      // Verify refresh token is invalidated
      const refreshRequest = UserTestFixture.createRefreshTokenRequest({
        refreshToken: userResponse.refreshToken,
        deviceId: deviceId,
      });

      try {
        await trainClient.refreshTokens(refreshRequest);
      } catch (error) {
        if (error instanceof AxiosError) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(HttpStatusCode.FORBIDDEN);

          const errorResponse = axiosError.response?.data;
          console.log("Logout Error response: ", errorResponse);
          expect(errorResponse).toMatchObject({
            message: AuthErrorType.InvalidRefreshToken,
            errorCode: "FORBIDDEN",
          });
        }
      }
    });

    describe("Error Cases", () => {
      it.each(AuthDataProvider.logoutUserErrorCases())(
        "$description",
        async ({ request, status, expectedErrorResponse }) => {
          try {
            await trainClient.logout(request as LogoutRequest);
          } catch (error) {
            if (error instanceof AxiosError) {
              const axiosError = error as AxiosError;
              expect(axiosError.response?.status).toBe(status);
              const errorResponse = axiosError.response?.data;
              expect(errorResponse).toMatchObject(expectedErrorResponse);
            }
          }
        }
      );
    });
  });
});
