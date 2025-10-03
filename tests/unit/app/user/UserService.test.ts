import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  MockedObject,
  afterEach,
} from "vitest";
import {
  mockUserRepository,
  mockUserProfileRepository,
  mockUserGroupsRepository,
  mockFollowRepository,
  mockPasswordResetRepository,
  mockEmailService,
} from "../../../mocks/userMocks.js";
import UserService from "../../../../src/app/user/UserService.js";
import { ClientSession } from "mongoose";
import mongoose from "mongoose";
import UserTestFixture from "../../../fixtures/UserTestFixture.js";
import { UserRequest } from "@seenelm/train-core";
import User from "../../../../src/infrastructure/database/entity/user/User.js";
import BcryptUtil from "../../../../src/common/utils/BcryptUtil.js";
import JWTUtil from "../../../../src/common/utils/JWTUtil.js";
import { APIError } from "../../../../src/common/errors/APIError.js";
import { AuthError } from "../../../../src/common/errors/AuthError.js";
import { JsonWebTokenError } from "jsonwebtoken";
import { Error as MongooseError } from "mongoose";
import { DatabaseError } from "../../../../src/common/errors/DatabaseError.js";
import { IRefreshToken } from "../../../../src/infrastructure/database/models/user/userModel.js";
import {
  RegisterUserAPIError,
  LoginUserAPIError,
  GoogleAuthAPIError,
  AuthErrorType,
  APIErrorType,
} from "../../../../src/common/enums.js";
import { MongoServerError } from "mongodb";
import PasswordReset from "../../../../src/infrastructure/database/entity/user/PasswordReset.js";
import { Types } from "mongoose";

describe("UserService", () => {
  let userService: UserService;
  let mockSession: MockedObject<ClientSession>;

  beforeEach(() => {
    process.env.SECRET_CODE = "test-secret-key";
    process.env.ACCESS_TOKEN_EXPIRY = "15m";
    process.env.REFRESH_TOKEN_EXPIRY = "30";

    userService = new UserService(
      mockUserRepository,
      mockUserProfileRepository,
      mockUserGroupsRepository,
      mockFollowRepository,
      mockPasswordResetRepository,
      mockEmailService
    );

    mockSession = {
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      abortTransaction: vi.fn(),
      endSession: vi.fn(),
    } as unknown as MockedObject<ClientSession>;

    vi.spyOn(mongoose, "startSession").mockResolvedValue(mockSession);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should successfully register a user", async () => {
      // Arrange
      const userRequest: UserRequest = UserTestFixture.createUserRequest();
      const user: User = UserTestFixture.createUserEntity();
      const mockPasswordHash = "hashedPassword";
      const userDocument = UserTestFixture.createUserDocument();
      const expectedUserResponse = UserTestFixture.createUserResponse();
      const refreshToken = UserTestFixture.createRefreshToken();

      vi.spyOn(mockUserRepository, "findOne").mockResolvedValueOnce(null);
      vi.spyOn(BcryptUtil, "hashPassword").mockResolvedValueOnce(
        mockPasswordHash
      );

      const expectedUniqueUsername = `${
        userRequest.email.split("@")[0]
      }_mockedUniqueId`;
      vi.spyOn(userService, "generateUniqueUsername").mockReturnValue(
        expectedUniqueUsername
      );
      vi.spyOn(mockUserRepository, "toDocument").mockReturnValueOnce(
        userDocument
      );

      vi.spyOn(mockUserRepository, "create").mockResolvedValueOnce(user);
      vi.spyOn(mockUserProfileRepository, "create").mockResolvedValueOnce(
        {} as any
      );
      vi.spyOn(mockUserGroupsRepository, "create").mockResolvedValueOnce(
        {} as any
      );
      vi.spyOn(mockFollowRepository, "create").mockResolvedValueOnce({} as any);

      vi.spyOn(JWTUtil, "sign").mockResolvedValueOnce(
        UserTestFixture.ACCESS_TOKEN
      );
      vi.spyOn(mockUserRepository, "toResponse").mockReturnValueOnce(
        expectedUserResponse
      );

      // Act
      const result = await userService.registerUser(userRequest);

      // Assert
      expect(result).toEqual(expectedUserResponse);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        $or: [{ email: userRequest.email }, { username: expect.any(String) }],
      });
      expect(BcryptUtil.hashPassword).toHaveBeenCalledWith(
        userRequest.password
      );
      expect(mockUserRepository.toDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          username: expectedUniqueUsername,
          name: userRequest.name,
          password: mockPasswordHash,
          isActive: true,
          email: userRequest.email,
          authProvider: userRequest.authProvider,
          deviceId: userRequest.deviceId,
        }),
        expect.objectContaining({
          token: expect.any(String), // uuidv4() in createRefreshToken
          deviceId: userRequest.deviceId, // Passed from userRequest to createRefreshToken
          expiresAt: expect.any(Date),
        })
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith(userDocument, {
        session: mockSession,
      });
      expect(mockUserProfileRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.getId(),
          name: userRequest.name,
          username: user.getUsername(),
        }),
        { session: mockSession }
      );
      expect(mockUserGroupsRepository.create).toHaveBeenCalledWith(
        { userId: user.getId() },
        { session: mockSession }
      );

      expect(mockFollowRepository.create).toHaveBeenCalledWith(
        { userId: user.getId() },
        { session: mockSession }
      );
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(mockUserRepository.toResponse).toHaveBeenCalledWith(
        user,
        UserTestFixture.ACCESS_TOKEN,
        userRequest.name,
        expect.any(String) // refreshToken
      );
    });

    it("should throw a conflict error if the user already exists", async () => {
      // Arrange
      const userRequest: UserRequest = UserTestFixture.createUserRequest();
      const existingUser = UserTestFixture.createUserEntity();
      const expectedUsername = "username_001";
      const email = userRequest.email;

      vi.spyOn(userService, "generateUniqueUsername").mockReturnValue(
        expectedUsername
      );

      vi.spyOn(mockUserRepository, "findOne").mockResolvedValueOnce(
        existingUser
      );

      // Act & Assert
      await expect(userService.registerUser(userRequest)).rejects.toThrowError(
        APIError.Conflict(RegisterUserAPIError.UserAlreadyExists)
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        $or: [{ email: userRequest.email }, { username: expect.any(String) }],
      });
    });

    it("should throw an auth error if the password hashing fails", async () => {
      // Arrange
      const userRequest: UserRequest = UserTestFixture.createUserRequest();
      const expectedError = AuthError.InvalidPassword({
        email: userRequest.email,
        password: "******", // masked for security
      });

      vi.spyOn(userService, "generateUniqueUsername").mockReturnValue(
        "test_011"
      );
      vi.spyOn(mockUserRepository, "findOne").mockResolvedValueOnce(null);
      vi.spyOn(BcryptUtil, "hashPassword").mockRejectedValueOnce(expectedError);

      // Act & Assert
      await expect(userService.registerUser(userRequest)).rejects.toThrow(
        expectedError
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        $or: [{ email: userRequest.email }, { username: "test_011" }],
      });
      expect(BcryptUtil.hashPassword).toHaveBeenCalledWith(
        userRequest.password
      );
    });

    it("should throw an auth error if unable to create jwt token", async () => {
      // Arrange
      const userRequest: UserRequest = UserTestFixture.createUserRequest();
      const user: User = UserTestFixture.createUserEntity();
      const mockPasswordHash = "hashedPassword";
      const userDocument = UserTestFixture.createUserDocument();

      vi.spyOn(mockUserRepository, "findOne").mockResolvedValueOnce(null);
      vi.spyOn(BcryptUtil, "hashPassword").mockResolvedValueOnce(
        mockPasswordHash
      );
      vi.spyOn(mockUserRepository, "toDocument").mockReturnValueOnce(
        userDocument
      );

      vi.spyOn(mockUserRepository, "create").mockResolvedValueOnce(user);
      vi.spyOn(mockUserProfileRepository, "create").mockResolvedValueOnce(
        {} as any
      );
      vi.spyOn(mockUserGroupsRepository, "create").mockResolvedValueOnce(
        {} as any
      );
      vi.spyOn(mockFollowRepository, "create").mockResolvedValueOnce({} as any);

      const expectedError = new JsonWebTokenError("Token creation failed");
      vi.spyOn(JWTUtil, "sign").mockRejectedValueOnce(expectedError);

      // Act & Assert
      await expect(userService.registerUser(userRequest)).rejects.toThrow(
        AuthError.handleJWTError(expectedError)
      );

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it("should handle database errors when creating a new user", async () => {
      // Arrange
      const expectedUsername = "username_001";
      const userRequest: UserRequest = UserTestFixture.createUserRequest();

      const mockPasswordHash = "hashedPassword";
      const userDocument = UserTestFixture.createUserDocument({
        username: expectedUsername,
        isActive: true,
        password: mockPasswordHash,
      });
      const dbError = new MongooseError.DocumentNotFoundError("User not found");

      vi.spyOn(userService, "generateUniqueUsername").mockReturnValue(
        expectedUsername
      );
      vi.spyOn(mockUserRepository, "findOne").mockResolvedValueOnce(null);
      vi.spyOn(BcryptUtil, "hashPassword").mockResolvedValueOnce(
        mockPasswordHash
      );
      vi.spyOn(mockUserRepository, "toDocument").mockReturnValueOnce(
        userDocument
      );

      vi.spyOn(mockUserRepository, "create").mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(userService.registerUser(userRequest)).rejects.toThrowError(
        MongooseError.DocumentNotFoundError
      );
    });
  });

  describe("loginUser", () => {
    it("should successfully login a user", async () => {
      // Arrange
      const userLoginRequest = UserTestFixture.createUserLoginRequest();
      const user = UserTestFixture.createUserEntity();
      const userProfile = UserTestFixture.createUserProfile();
      const expectedUserResponse = UserTestFixture.createUserResponse({
        name: userProfile.getName(),
      });

      vi.spyOn(mockUserRepository, "findOne").mockResolvedValueOnce(user);
      vi.spyOn(BcryptUtil, "comparePassword").mockResolvedValueOnce(true);
      vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValueOnce(
        userProfile
      );
      vi.spyOn(JWTUtil, "sign").mockResolvedValueOnce(
        UserTestFixture.ACCESS_TOKEN
      );
      vi.spyOn(mockUserRepository, "toResponse").mockReturnValueOnce(
        expectedUserResponse
      );

      // Act
      const result = await userService.loginUser(userLoginRequest);

      // Assert
      expect(result).toEqual(expectedUserResponse);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        email: userLoginRequest.email,
      });
      expect(BcryptUtil.comparePassword).toHaveBeenCalledWith(
        userLoginRequest.password,
        user.getPassword()
      );
      expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
        userId: user.getId(),
      });

      expect(mockUserRepository.toResponse).toHaveBeenCalledWith(
        user,
        UserTestFixture.ACCESS_TOKEN,
        userProfile.getName(),
        expect.any(String) // refreshToken
      );
    });

    it("should throw a conflict error if the user is not found", async () => {
      // Arrange
      const userLoginRequest = UserTestFixture.createUserLoginRequest();
      const expectedError = APIError.NotFound(LoginUserAPIError.UserNotFound);

      vi.spyOn(mockUserRepository, "findOne").mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        userService.loginUser(userLoginRequest)
      ).rejects.toThrowError(expectedError);
    });

    it("should throw an auth error if the password is incorrect", async () => {
      // Arrange
      const userLoginRequest = UserTestFixture.createUserLoginRequest();
      const user = UserTestFixture.createUserEntity();
      const expectedError = AuthError.InvalidPassword(
        LoginUserAPIError.InvalidPassword
      );

      vi.spyOn(mockUserRepository, "findOne").mockResolvedValueOnce(user);
      vi.spyOn(BcryptUtil, "comparePassword").mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        userService.loginUser(userLoginRequest)
      ).rejects.toThrowError(expectedError);
    });

    it("should handle database errors when logging in", async () => {
      // Arrange
      const userLoginRequest = UserTestFixture.createUserLoginRequest();
      const dbError = new MongooseError.DocumentNotFoundError("User not found");

      vi.spyOn(mockUserRepository, "findOne").mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(
        userService.loginUser(userLoginRequest)
      ).rejects.toThrowError(DatabaseError.handleMongoDBError(dbError));
    });
  });

  describe("authenticateWithGoogle", () => {
    it("should successfully authenticate a new user with Google", async () => {
      // Arrange
      const decodedToken = UserTestFixture.createDecodedIdToken();
      const googleAuthRequest = UserTestFixture.createGoogleAuthRequest();
      const user = UserTestFixture.createUserEntity();
      const expectedUsername = "username_001";
      const userDocument = UserTestFixture.createUserDocument({
        username: expectedUsername,
        isActive: true,
        email: decodedToken.email,
        authProvider: "google",
        googleId: decodedToken.uid,
      });
      const expectedUserResponse = UserTestFixture.createUserResponse({
        username: expectedUsername,
      });

      vi.spyOn(userService, "generateUniqueUsername").mockReturnValue(
        expectedUsername
      );
      vi.spyOn(mockUserRepository, "findOne")
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      vi.spyOn(mockUserRepository, "toDocument").mockReturnValueOnce(
        userDocument
      );
      vi.spyOn(mockUserRepository, "create").mockResolvedValueOnce(user);
      vi.spyOn(mockUserProfileRepository, "create").mockResolvedValueOnce(
        {} as any
      );
      vi.spyOn(mockUserGroupsRepository, "create").mockResolvedValueOnce(
        {} as any
      );
      vi.spyOn(mockFollowRepository, "create").mockResolvedValueOnce({} as any);
      vi.spyOn(JWTUtil, "sign").mockResolvedValueOnce(
        UserTestFixture.ACCESS_TOKEN
      );
      vi.spyOn(mockUserRepository, "toResponse").mockReturnValueOnce(
        expectedUserResponse
      );

      // Act
      const result = await userService.authenticateWithGoogle(
        decodedToken,
        googleAuthRequest
      );

      // Assert
      expect(result).toEqual(expectedUserResponse);
      expect(userService.generateUniqueUsername).toHaveBeenCalledWith(
        decodedToken.email
      );
      expect(mockUserRepository.toDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          username: expectedUsername,
          isActive: true,
          email: decodedToken.email,
          authProvider: "google",
        }),
        expect.objectContaining({
          token: expect.any(String), // uuidv4() in createRefreshToken
          deviceId: googleAuthRequest.deviceId,
          expiresAt: expect.any(Date),
        }),
        decodedToken.uid
      );
      expect(mockUserRepository.toResponse).toHaveBeenCalledWith(
        user,
        UserTestFixture.ACCESS_TOKEN,
        UserTestFixture.NAME,
        expect.any(String) // refreshToken
      );
    });

    it("should successfully authenticate an existing user with Google", async () => {
      // Arrange
      const decodedToken = UserTestFixture.createDecodedIdToken();
      const googleAuthRequest = UserTestFixture.createGoogleAuthRequest();
      const user = UserTestFixture.createUserEntity();
      const userProfile = UserTestFixture.createUserProfile();
      const expectedUserResponse = UserTestFixture.createUserResponse({
        name: userProfile.getName(),
      });

      vi.spyOn(mockUserRepository, "findOne").mockResolvedValueOnce(user);
      vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValueOnce(
        userProfile
      );
      vi.spyOn(JWTUtil, "sign").mockResolvedValueOnce(
        UserTestFixture.ACCESS_TOKEN
      );
      vi.spyOn(mockUserRepository, "toResponse").mockReturnValueOnce(
        expectedUserResponse
      );

      // Act
      const result = await userService.authenticateWithGoogle(
        decodedToken,
        googleAuthRequest
      );

      // Assert
      expect(result).toEqual(expectedUserResponse);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        googleId: decodedToken.uid,
      });
      expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({
        userId: user.getId(),
      });
      expect(mockUserRepository.toResponse).toHaveBeenCalledWith(
        user,
        UserTestFixture.ACCESS_TOKEN,
        userProfile.getName(),
        expect.any(String) // refreshToken
      );
    });

    it("should throw a conflict error if the user already exists", async () => {
      // Arrange
      const decodedToken = UserTestFixture.createDecodedIdToken();
      const googleAuthRequest = UserTestFixture.createGoogleAuthRequest();
      const existingUser = UserTestFixture.createUserEntity();
      const expectedUsername = "username_001";
      const email = decodedToken.email;

      vi.spyOn(userService, "generateUniqueUsername").mockReturnValue(
        expectedUsername
      );
      vi.spyOn(mockUserRepository, "findOne")
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingUser);

      // Act & Assert
      await expect(
        userService.authenticateWithGoogle(decodedToken, googleAuthRequest)
      ).rejects.toThrowError(
        APIError.Conflict(GoogleAuthAPIError.UserAlreadyExists)
      );
    });

    it("should handle database errors when authenticating with Google", async () => {
      // Arrange
      const decodedToken = UserTestFixture.createDecodedIdToken();
      const googleAuthRequest = UserTestFixture.createGoogleAuthRequest();
      const dbError = new MongooseError.DocumentNotFoundError("User not found");

      vi.spyOn(mockUserRepository, "findOne").mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(
        userService.authenticateWithGoogle(decodedToken, googleAuthRequest)
      ).rejects.toThrowError(DatabaseError.handleMongoDBError(dbError));
    });
  });

  describe("refreshTokens", () => {
    it("should successfully refresh tokens", async () => {
      // Arrange
      const refreshTokenRequest = UserTestFixture.createRefreshTokenRequest();
      const newRefreshToken = UserTestFixture.createRefreshToken({
        token: "new-refresh-token",
        deviceId: "new-device-id",
      });
      const newAccessToken = "new-access-token";
      const existingUser: User = UserTestFixture.createUserEntity();
      const updatedUser: User = UserTestFixture.createUserEntity();
      updatedUser.setRefreshTokens([newRefreshToken]);

      const refreshTokenResponse = UserTestFixture.createRefreshTokenResponse({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken.token,
      });

      vi.spyOn(mockUserRepository, "findOne").mockResolvedValue(existingUser);
      // vi.spyOn(mockUserRepository, "findOneAndUpdate").mockResolvedValue(
      //   updatedUser
      // );

      // Act
      const result = await userService.refreshTokens(refreshTokenRequest);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        "refreshTokens.token": UserTestFixture.REFRESH_TOKEN,
        "refreshTokens.deviceId": UserTestFixture.DEVICE_ID,
      });

      expect(result).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    it("should throw Forbidden error if user is not found with refresh token and deviceId", async () => {
      // Arrange
      const refreshTokenRequest = UserTestFixture.createRefreshTokenRequest();
      vi.spyOn(mockUserRepository, "findOne").mockResolvedValue(null);

      // Act & Assert
      await expect(
        userService.refreshTokens(refreshTokenRequest)
      ).rejects.toThrowError(
        AuthError.Forbidden(AuthErrorType.InvalidRefreshToken)
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        "refreshTokens.token": UserTestFixture.REFRESH_TOKEN,
        "refreshTokens.deviceId": UserTestFixture.DEVICE_ID,
      });
    });

    it("should throw Forbidden error if refresh token is expired", async () => {
      // Arrange
      const refreshTokenRequest = UserTestFixture.createRefreshTokenRequest();
      const expiredRefreshToken = UserTestFixture.createRefreshToken({
        expiresAt: new Date(Date.now() - 1000), // Expired
      });

      const user = UserTestFixture.createUserEntity();
      user.setRefreshTokens([expiredRefreshToken]);

      vi.spyOn(mockUserRepository, "findOne").mockResolvedValue(user);
      vi.spyOn(mockUserRepository, "findByIdAndUpdate").mockResolvedValue(null);

      // Act & Assert
      await expect(
        userService.refreshTokens(refreshTokenRequest)
      ).rejects.toThrowError(
        AuthError.Forbidden(AuthErrorType.InvalidRefreshToken)
      );

      expect(mockUserRepository.findByIdAndUpdate).toHaveBeenCalledWith(
        user.getId(),
        {
          $pull: {
            refreshTokens: {
              token: UserTestFixture.REFRESH_TOKEN,
              deviceId: UserTestFixture.DEVICE_ID,
            },
          },
        }
      );
    });

    it("should handle database errors", async () => {
      // Arrange
      const refreshTokenRequest = UserTestFixture.createRefreshTokenRequest();
      const dbError = new MongooseError.DocumentNotFoundError("User not found");
      vi.spyOn(mockUserRepository, "findOne").mockRejectedValueOnce(dbError);

      // Act & Assert
      await expect(
        userService.refreshTokens(refreshTokenRequest)
      ).rejects.toThrowError(DatabaseError.handleMongoDBError(dbError));
    });
  });

  describe("logoutUser", () => {
    it("should successfully logout a user", async () => {
      // Arrange
      const logoutRequest = UserTestFixture.createLogoutRequest();
      const user = UserTestFixture.createUserEntity();
      user.setRefreshTokens([]);

      vi.spyOn(mockUserRepository, "findOneAndUpdate").mockResolvedValue(user);

      // Act
      await userService.logoutUser(user.getId(), logoutRequest);

      // Assert
      expect(mockUserRepository.findOneAndUpdate).toHaveBeenCalledWith(
        {
          "refreshTokens.token": UserTestFixture.REFRESH_TOKEN,
          "refreshTokens.deviceId": UserTestFixture.DEVICE_ID,
        },
        {
          $pull: {
            refreshTokens: {
              token: UserTestFixture.REFRESH_TOKEN,
              deviceId: UserTestFixture.DEVICE_ID,
            },
          },
        }
      );
    });

    it("should throw 404 error if user is not found", async () => {
      // Arrange
      const logoutRequest = UserTestFixture.createLogoutRequest();
      const user = UserTestFixture.createUserEntity();
      vi.spyOn(mockUserRepository, "findOneAndUpdate").mockResolvedValue(null);

      // Act & Assert
      await expect(
        userService.logoutUser(user.getId(), logoutRequest)
      ).rejects.toThrowError(APIError.NotFound(APIErrorType.UserNotFound));
    });

    it("should handle database errors", async () => {
      // Arrange
      const logoutRequest = UserTestFixture.createLogoutRequest();
      const user = UserTestFixture.createUserEntity();
      const dbError = new MongooseError.DocumentNotFoundError("User not found");

      vi.spyOn(mockUserRepository, "findOneAndUpdate").mockRejectedValueOnce(
        dbError
      );

      // Act & Assert
      await expect(
        userService.logoutUser(user.getId(), logoutRequest)
      ).rejects.toThrowError(DatabaseError.handleMongoDBError(dbError));
    });
  });

  describe("requestPasswordReset", () => {
    it("should successfully request password reset for local auth user", async () => {
      // Arrange
      const request = {
        email: "test@example.com",
      };
      const user = UserTestFixture.createUserEntity();
      const resetCode = "123456";

      vi.spyOn(mockUserRepository, "findOne").mockResolvedValue(user);
      vi.spyOn(
        userService as any,
        "generatePasswordResetCode"
      ).mockResolvedValue(resetCode);
      vi.spyOn(mockEmailService, "sendPasswordResetCode").mockResolvedValue();

      // Act
      await userService.requestPasswordReset(request);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        email: request.email,
      });
      expect(mockEmailService.sendPasswordResetCode).toHaveBeenCalledWith(
        request.email,
        resetCode,
        user.getUsername()
      );
    });

    it("should throw NotFound error when user does not exist", async () => {
      // Arrange
      const request = {
        email: "nonexistent@example.com",
      };

      vi.spyOn(mockUserRepository, "findOne").mockResolvedValue(null);

      // Act & Assert
      await expect(userService.requestPasswordReset(request)).rejects.toThrow(
        APIError.NotFound(APIErrorType.UserNotFound)
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        email: request.email,
      });
    });

    it("should throw BadRequest error when user is a Google auth user", async () => {
      // Arrange
      const request = {
        email: "google@example.com",
      };
      const user = UserTestFixture.createUserEntity();
      user.setAuthProvider("google");

      vi.spyOn(mockUserRepository, "findOne").mockResolvedValue(user);

      // Act & Assert
      await expect(userService.requestPasswordReset(request)).rejects.toThrow(
        APIError.BadRequest("Google auth users cannot reset password")
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        email: request.email,
      });
    });

    it("should throw DatabaseError when MongoDB operation fails", async () => {
      // Arrange
      const request = {
        email: "test@example.com",
      };
      const mongoError = new MongoServerError({ message: "Database error" });

      vi.spyOn(mockUserRepository, "findOne").mockRejectedValue(mongoError);

      // Act & Assert
      await expect(userService.requestPasswordReset(request)).rejects.toThrow(
        DatabaseError
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        email: request.email,
      });
    });

    it("should throw InternalServerError when email service fails", async () => {
      // Arrange
      const request = {
        email: "test@example.com",
      };
      const user = UserTestFixture.createUserEntity();
      const resetCode = "123456";
      const emailError = new Error("Email service error");

      vi.spyOn(mockUserRepository, "findOne").mockResolvedValue(user);
      vi.spyOn(
        userService as any,
        "generatePasswordResetCode"
      ).mockResolvedValue(resetCode);
      vi.spyOn(mockEmailService, "sendPasswordResetCode").mockRejectedValue(
        emailError
      );

      // Act & Assert
      await expect(userService.requestPasswordReset(request)).rejects.toThrow(
        APIError.InternalServerError("Request password reset error")
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        email: request.email,
      });
      expect(mockEmailService.sendPasswordResetCode).toHaveBeenCalledWith(
        request.email,
        resetCode,
        user.getUsername()
      );
    });

    it("should invalidate any existing reset codes before creating new one", async () => {
      // Arrange
      const request = {
        email: "test@example.com",
      };
      const user = UserTestFixture.createUserEntity();

      vi.spyOn(mockUserRepository, "findOne").mockResolvedValue(user);
      vi.spyOn(mongoose, "startSession").mockResolvedValue(mockSession);
      vi.spyOn(mockPasswordResetRepository, "deleteMany").mockResolvedValue();
      vi.spyOn(mockEmailService, "sendPasswordResetCode").mockResolvedValue();

      // Act
      await userService.requestPasswordReset(request);

      // Assert
      expect(mockPasswordResetRepository.deleteMany).toHaveBeenCalledWith(
        {
          userId: user.getId(),
          expiresAt: { $gt: expect.any(Date) },
        },
        { session: mockSession } // Add this second argument to match the actual call
      );
    });
  });

  describe("resetPasswordWithCode", () => {
    it("should successfully reset password with valid code", async () => {
      // Arrange
      const hashedPassword = "hashedPassword";
      const newResetCode = UserTestFixture.createResetCode();
      const request = UserTestFixture.createResetPasswordWithCodeRequest({
        newPassword: "newPassword123",
        resetCode: newResetCode,
      });
      const user = UserTestFixture.createUserEntity();

      const resetRequest = PasswordReset.builder()
        .setEmail(request.email)
        .setCode(request.resetCode)
        .setUserId(user.getId())
        .setExpiresAt(new Date(Date.now() + 1000 * 60 * 10)) // 10 minutes from now
        .build();

      vi.spyOn(mockPasswordResetRepository, "findOne").mockResolvedValue(
        resetRequest
      );
      vi.spyOn(mockUserRepository, "findById").mockResolvedValue(user);
      vi.spyOn(BcryptUtil, "hashPassword").mockResolvedValue(hashedPassword);

      vi.spyOn(mockUserRepository, "findByIdAndUpdate").mockResolvedValue(user);
      vi.spyOn(
        mockPasswordResetRepository,
        "findByIdAndDelete"
      ).mockResolvedValue();

      // Act
      await userService.resetPasswordWithCode(request);

      // Assert
      expect(mockPasswordResetRepository.findOne).toHaveBeenCalledWith({
        email: request.email,
        code: request.resetCode,
      });
      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        resetRequest.getUserId()
      );
      expect(BcryptUtil.hashPassword).toHaveBeenCalledWith(request.newPassword);
      expect(mockUserRepository.findByIdAndUpdate).toHaveBeenCalledWith(
        user.getId(),
        {
          password: hashedPassword,
          refreshTokens: [],
        }
      );
      expect(
        mockPasswordResetRepository.findByIdAndDelete
      ).toHaveBeenCalledWith(resetRequest.getId());
    });

    it("should throw BadRequest when reset code is invalid", async () => {
      // Arrange
      const request = UserTestFixture.createResetPasswordWithCodeRequest({
        email: "test@example.com",
        resetCode: "invalid",
        newPassword: "newPassword123",
      });

      vi.spyOn(mockPasswordResetRepository, "findOne").mockResolvedValue(null);

      // Act & Assert
      await expect(userService.resetPasswordWithCode(request)).rejects.toThrow(
        APIError.BadRequest("Invalid Code")
      );
      expect(mockPasswordResetRepository.findOne).toHaveBeenCalledWith({
        email: request.email,
        code: request.resetCode,
      });
    });

    it("should throw BadRequest when reset code is expired", async () => {
      // Arrange
      const request = UserTestFixture.createResetPasswordWithCodeRequest({
        email: "test@example.com",
        resetCode: "invalid",
        newPassword: "newPassword123",
      });
      const resetRequest = PasswordReset.builder()
        .setEmail(request.email)
        .setCode(request.resetCode)
        .setUserId(new Types.ObjectId())
        .setExpiresAt(new Date(Date.now() - 1000)) // Expired
        .build();

      vi.spyOn(mockPasswordResetRepository, "findOne").mockResolvedValue(
        resetRequest
      );
      vi.spyOn(
        mockPasswordResetRepository,
        "findByIdAndDelete"
      ).mockResolvedValue();

      // Act & Assert
      await expect(userService.resetPasswordWithCode(request)).rejects.toThrow(
        APIError.BadRequest("Expired Code")
      );
      expect(mockPasswordResetRepository.findOne).toHaveBeenCalledWith({
        email: request.email,
        code: request.resetCode,
      });
      expect(
        mockPasswordResetRepository.findByIdAndDelete
      ).toHaveBeenCalledWith(resetRequest.getId());
    });

    it("should throw 404 status code when user is not found", async () => {
      // Arrange
      const request = UserTestFixture.createResetPasswordWithCodeRequest({
        email: "test@example.com",
        resetCode: "invalid",
        newPassword: "newPassword123",
      });

      const resetRequest = PasswordReset.builder()
        .setEmail(request.email)
        .setCode(request.resetCode)
        .setUserId(new Types.ObjectId())
        .setExpiresAt(new Date(Date.now() + 1000 * 60 * 10))
        .build();

      vi.spyOn(mockPasswordResetRepository, "findOne").mockResolvedValue(
        resetRequest
      );
      vi.spyOn(mockUserRepository, "findById").mockResolvedValue(null);
      vi.spyOn(
        mockPasswordResetRepository,
        "findByIdAndDelete"
      ).mockResolvedValue();

      // Act & Assert
      await expect(userService.resetPasswordWithCode(request)).rejects.toThrow(
        APIError.NotFound(APIErrorType.UserNotFound)
      );
      expect(mockPasswordResetRepository.findOne).toHaveBeenCalledWith({
        email: request.email,
        code: request.resetCode,
      });
      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        resetRequest.getUserId()
      );
      expect(
        mockPasswordResetRepository.findByIdAndDelete
      ).toHaveBeenCalledWith(resetRequest.getId());
    });

    it("should handle database errors", async () => {
      // Arrange
      const request = UserTestFixture.createResetPasswordWithCodeRequest({
        email: "test@example.com",
        resetCode: "invalid",
        newPassword: "newPassword123",
      });
      const dbError = new MongoServerError({ message: "Database error" });

      vi.spyOn(mockPasswordResetRepository, "findOne").mockRejectedValue(
        dbError
      );

      // Act & Assert
      await expect(userService.resetPasswordWithCode(request)).rejects.toThrow(
        DatabaseError.handleMongoDBError(dbError)
      );
      expect(mockPasswordResetRepository.findOne).toHaveBeenCalledWith({
        email: request.email,
        code: request.resetCode,
      });
    });
  });
});
