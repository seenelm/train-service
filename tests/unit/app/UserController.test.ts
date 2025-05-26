import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  MockedObject,
  afterEach,
} from "vitest";
import { NextFunction, Request, Response } from "express";

import UserController from "../../../src/app/user/UserController.js";
import { mockUserService } from "../../mocks/userMocks.js";
import UserTestFixture from "../../fixtures/UserTestFixture.js";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { DatabaseError } from "../../../src/common/errors/DatabaseError.js";
import { DecodedIdToken } from "firebase-admin/auth";
import { GoogleAuthRequest } from "../../../src/app/user/userDto.js";

describe("UserController", () => {
  let userController: UserController;
  let mockRequest: MockedObject<Request>;
  let mockResponse: MockedObject<Response>;
  let mockNext: MockedObject<NextFunction>;

  beforeEach(() => {
    userController = new UserController(mockUserService);
    mockRequest = {
      body: {},
      params: {},
      firebaseUser: {} as DecodedIdToken,
    } as unknown as MockedObject<Request>;
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as MockedObject<Response>;
    mockNext = vi.fn() as unknown as MockedObject<NextFunction>;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should register a user successfully and return 201 status", async () => {
      // Arrange
      const userRequest = UserTestFixture.createUserRequest();
      const expectedResponse = UserTestFixture.createUserResponse();

      mockRequest.body = userRequest;

      vi.spyOn(mockUserService, "registerUser").mockResolvedValueOnce(
        expectedResponse
      );

      // Act
      await userController.register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(mockUserService.registerUser).toHaveBeenCalledWith(userRequest);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
      expect(mockNext).not.toHaveBeenCalled();
    });
    it("should pass any errors to the next middleware", async () => {
      // Arrange
      const userRequest = UserTestFixture.createUserRequest();
      const expectedError = new DatabaseError("Database error");

      mockRequest.body = userRequest;

      vi.spyOn(mockUserService, "registerUser").mockRejectedValueOnce(
        expectedError
      );

      // Act
      await userController.register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockUserService.registerUser).toHaveBeenCalledWith(userRequest);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expectedError);
    });
  });

  describe("login", () => {
    it("should log in a user successfully and return 200 status", async () => {
      // Arrange
      const userLoginRequest = UserTestFixture.createUserLoginRequest();
      const expectedResponse = UserTestFixture.createUserResponse();

      mockRequest.body = userLoginRequest;

      vi.spyOn(mockUserService, "loginUser").mockResolvedValueOnce(
        expectedResponse
      );

      // Act
      await userController.login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(mockUserService.loginUser).toHaveBeenCalledWith(userLoginRequest);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should pass any errors to the next middleware", async () => {
      // Arrange
      const userLoginRequest = UserTestFixture.createUserLoginRequest();
      const expectedError = new DatabaseError("Database error");

      mockRequest.body = userLoginRequest;

      vi.spyOn(mockUserService, "loginUser").mockRejectedValueOnce(
        expectedError
      );

      // Act
      await userController.login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(mockUserService.loginUser).toHaveBeenCalledWith(userLoginRequest);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expectedError);
    });
  });

  describe("googleAuth", () => {
    it("should authenticate a user with Google and return 200 status", async () => {
      // Arrange
      const googleAuthRequest = UserTestFixture.createGoogleAuthRequest();
      const decodedToken = UserTestFixture.createDecodedIdToken();
      const expectedResponse = UserTestFixture.createUserResponse();

      mockRequest.body = googleAuthRequest;
      mockRequest.firebaseUser = decodedToken;

      vi.spyOn(mockUserService, "authenticateWithGoogle").mockResolvedValueOnce(
        expectedResponse
      );

      // Act
      await userController.googleAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(mockUserService.authenticateWithGoogle).toHaveBeenCalledWith(
        decodedToken,
        googleAuthRequest
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should pass any errors to the next middleware", async () => {
      // Arrange
      const googleAuthRequest = UserTestFixture.createGoogleAuthRequest();
      const decodedToken = UserTestFixture.createDecodedIdToken();
      const expectedError = new DatabaseError("Database error");

      mockRequest.body = googleAuthRequest;
      mockRequest.firebaseUser = decodedToken;

      vi.spyOn(mockUserService, "authenticateWithGoogle").mockRejectedValueOnce(
        expectedError
      );

      // Act
      await userController.googleAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(mockUserService.authenticateWithGoogle).toHaveBeenCalledWith(
        decodedToken,
        googleAuthRequest
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expectedError);
    });
  });

  describe("logout", () => {
    it("should log out a user successfully and return 200 status", async () => {
      // Arrange
      const logoutRequest = UserTestFixture.createLogoutRequest();
      const expectedResponse = { message: "User logged out successfully" };

      mockRequest.body = logoutRequest;

      vi.spyOn(mockUserService, "logoutUser").mockResolvedValueOnce(undefined);

      // Act
      await userController.logout(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(mockUserService.logoutUser).toHaveBeenCalledWith(logoutRequest);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should pass any errors to the next middleware", async () => {
      // Arrange
      const logoutRequest = UserTestFixture.createLogoutRequest();
      const expectedError = new DatabaseError("Database error");

      mockRequest.body = logoutRequest;

      vi.spyOn(mockUserService, "logoutUser").mockRejectedValueOnce(
        expectedError
      );

      // Act
      await userController.logout(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(mockUserService.logoutUser).toHaveBeenCalledWith(logoutRequest);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expectedError);
    });
  });

  describe("refreshTokens", () => {
    it("should refresh tokens successfully and return 200 status", async () => {
      // Arrange
      const refreshTokenRequest = UserTestFixture.createRefreshTokenRequest();
      const expectedResponse = UserTestFixture.createRefreshTokenResponse({
        accessToken: "newAccessToken",
        refreshToken: "newRefreshToken",
      });

      mockRequest.body = refreshTokenRequest;

      vi.spyOn(mockUserService, "refreshTokens").mockResolvedValueOnce(
        expectedResponse
      );

      // Act
      await userController.refreshTokens(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(mockUserService.refreshTokens).toHaveBeenCalledWith(
        refreshTokenRequest
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should pass any errors to the next middleware", async () => {
      // Arrange
      const refreshTokenRequest = UserTestFixture.createRefreshTokenRequest();
      const expectedError = new DatabaseError("Database error");

      mockRequest.body = refreshTokenRequest;

      vi.spyOn(mockUserService, "refreshTokens").mockRejectedValueOnce(
        expectedError
      );

      // Act
      await userController.refreshTokens(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // Assert
      expect(mockUserService.refreshTokens).toHaveBeenCalledWith(
        refreshTokenRequest
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expectedError);
    });
  });

  // describe("requestPasswordReset", () => {
  //   it("should request a password reset successfully and return 200 status", async () => {
  //     // Arrange
  //     const requestPasswordResetRequest =
  //       UserTestFixture.createRequestPasswordResetRequest();
  //     const expectedResponse = {
  //       message: "Password reset request sent successfully",
  //     };

  //     mockRequest.body = requestPasswordResetRequest;
  //   });
  // });
});
