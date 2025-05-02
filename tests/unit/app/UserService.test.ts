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
} from "../../mocks/userMocks";
import UserService from "../../../src/app/user/UserService";
import { ClientSession } from "mongoose";
import mongoose from "mongoose";
import UserTestFixture from "../../fixtures/UserTestFixture";
import { UserRequest } from "../../../src/app/user/userDto";
import User from "../../../src/infrastructure/database/entity/user/User";
import BcryptUtil from "../../../src/common/utils/BcryptUtil";
import JWTUtil from "../../../src/common/utils/JWTUtil";
import { APIError } from "../../../src/common/errors/APIError";

describe("UserService", () => {
  let userService: UserService;
  let mockSession: MockedObject<ClientSession>;

  beforeEach(() => {
    userService = new UserService(
      mockUserRepository,
      mockUserProfileRepository,
      mockUserGroupsRepository,
      mockFollowRepository
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

      vi.spyOn(JWTUtil, "sign").mockResolvedValueOnce(UserTestFixture.TOKEN);
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
          username: expect.any(String),
          password: mockPasswordHash,
          isActive: true,
          email: userRequest.email,
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
        UserTestFixture.TOKEN,
        userRequest.name
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
        APIError.Conflict("Account with this email/username already exists", {
          email,
          username: expectedUsername,
        })
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        $or: [{ email: userRequest.email }, { username: expect.any(String) }],
      });
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
      vi.spyOn(JWTUtil, "sign").mockResolvedValueOnce(UserTestFixture.TOKEN);
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
        UserTestFixture.TOKEN,
        userProfile.getName()
      );
    });
  });

  describe("authenticateWithGoogle", () => {
    it("should successfully authenticate a new user with Google", async () => {
      // Arrange
      const decodedToken = UserTestFixture.createDecodedIdToken();
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
      vi.spyOn(JWTUtil, "sign").mockResolvedValueOnce(UserTestFixture.TOKEN);
      vi.spyOn(mockUserRepository, "toResponse").mockReturnValueOnce(
        expectedUserResponse
      );

      // Act
      const result = await userService.authenticateWithGoogle(
        decodedToken,
        UserTestFixture.NAME
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
        decodedToken.uid
      );
      expect(mockUserRepository.toResponse).toHaveBeenCalledWith(
        user,
        UserTestFixture.TOKEN,
        UserTestFixture.NAME
      );
    });

    it("should successfully authenticate an existing user with Google", async () => {
      // Arrange
      const decodedToken = UserTestFixture.createDecodedIdToken();
      const user = UserTestFixture.createUserEntity();
      const userProfile = UserTestFixture.createUserProfile();
      const expectedUserResponse = UserTestFixture.createUserResponse({
        name: userProfile.getName(),
      });

      vi.spyOn(mockUserRepository, "findOne").mockResolvedValueOnce(user);
      vi.spyOn(mockUserProfileRepository, "findOne").mockResolvedValueOnce(
        userProfile
      );
      vi.spyOn(JWTUtil, "sign").mockResolvedValueOnce(UserTestFixture.TOKEN);
      vi.spyOn(mockUserRepository, "toResponse").mockReturnValueOnce(
        expectedUserResponse
      );

      // Act
      const result = await userService.authenticateWithGoogle(decodedToken);

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
        UserTestFixture.TOKEN,
        userProfile.getName()
      );
    });
  });
});
