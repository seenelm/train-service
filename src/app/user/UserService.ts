import JWTUtil from "../../common/utils/JWTUtil.js";
import BcryptUtil from "../../common/utils/BcryptUtil.js";
import {
  UserDocument,
  IRefreshToken,
} from "../../infrastructure/database/models/user/userModel.js";
import { MongooseError, Types } from "mongoose";
import User from "../../infrastructure/database/entity/user/User.js";

import {
  UserLoginRequest,
  UserResponse,
  UserRequest,
  updateUserRequest,
  GoogleAuthRequest,
  RefreshTokenResponse,
} from "./userDto.js";

import mongoose from "mongoose";
import { APIError } from "../../common/errors/APIError.js";
import { Logger } from "../../common/logger.js";
import {
  RegisterUserAPIError,
  LoginUserAPIError,
  GoogleAuthAPIError,
  AuthErrorType,
  APIErrorType,
} from "../../common/enums.js";

import { DecodedIdToken } from "firebase-admin/auth";
import { MongoServerError } from "mongodb";
import { DatabaseError } from "../../common/errors/DatabaseError.js";
import { AuthError } from "../../common/errors/AuthError.js";
import { v4 as uuidv4 } from "uuid";
import { IUserRepository } from "../../infrastructure/database/repositories/user/UserRepository.js";
import { IUserProfileRepository } from "../../infrastructure/database/repositories/user/UserProfileRepository.js";
import { IUserGroupsRepository } from "../../infrastructure/database/repositories/user/UserGroupsRepository.js";
import { IFollowRepository } from "../../infrastructure/database/repositories/user/FollowRepository.js";
import { TokenPayload } from "../../common/middleware/AuthMiddleware.js";

export interface IUserService {
  registerUser(userRequest: UserRequest): Promise<UserResponse>;
  loginUser(userLoginRequest: UserLoginRequest): Promise<UserResponse>;
  authenticateWithGoogle(
    decodedToken: DecodedIdToken,
    googleAuthRequest: GoogleAuthRequest
  ): Promise<UserResponse>;
  refreshTokens(
    refreshToken: string,
    deviceId: string
  ): Promise<RefreshTokenResponse>;
  logoutUser(refreshToken: string, deviceId: string): Promise<void>;
}

export default class UserService implements IUserService {
  private userRepository: IUserRepository;
  private userProfileRepository: IUserProfileRepository;
  private userGroupsRepository: IUserGroupsRepository;
  private followRepository: IFollowRepository;
  private logger: Logger;

  constructor(
    userRepository: IUserRepository,
    userProfileRepository: IUserProfileRepository,
    userGroupsRepository: IUserGroupsRepository,
    followRepository: IFollowRepository
  ) {
    this.userRepository = userRepository;
    this.userProfileRepository = userProfileRepository;
    this.userGroupsRepository = userGroupsRepository;
    this.followRepository = followRepository;
    this.logger = Logger.getInstance();
  }

  public async registerUser(userRequest: UserRequest): Promise<UserResponse> {
    try {
      const { email, password, name, deviceId } = userRequest;

      const username = this.generateUniqueUsername(email);

      const user = await this.userRepository.findOne({
        $or: [{ email }, { username }],
      });

      if (user) {
        this.logger.warn("User registration conflict", {
          email,
          username,
          userId: user.getId(),
          message: RegisterUserAPIError.UserAlreadyExists,
        });
        throw APIError.Conflict(RegisterUserAPIError.UserAlreadyExists);
      }

      const hash = await BcryptUtil.hashPassword(password);

      const updatedUserRequest: UserRequest = updateUserRequest(userRequest, {
        username,
        password: hash,
        isActive: true,
      });

      const refreshToken = this.createRefreshToken(deviceId);

      const userDocument = this.userRepository.toDocument(
        updatedUserRequest,
        refreshToken
      );

      return this.createUser(userDocument, name);
    } catch (error) {
      this.logger.error("User registration error", {
        error,
        email: userRequest.email,
        name: userRequest.name,
        deviceId: userRequest.deviceId,
      });
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof AuthError) {
        throw error;
      } else if (error instanceof APIError) {
        throw error;
      }

      throw APIError.InternalServerError("User registration error");
    }
  }

  public async loginUser(
    userLoginRequest: UserLoginRequest
  ): Promise<UserResponse> {
    const { email, password, deviceId } = userLoginRequest;

    try {
      const user = await this.userRepository.findOne({ email });

      if (!user) {
        this.logger.warn("Login: User not found", {
          email,
          message: LoginUserAPIError.UserNotFound,
          deviceId,
        });
        throw APIError.NotFound(LoginUserAPIError.UserNotFound);
      }

      const isValidPassword = await BcryptUtil.comparePassword(
        password,
        user.getPassword()
      );

      if (!isValidPassword) {
        this.logger.warn(LoginUserAPIError.InvalidPassword, {
          email,
          userId: user.getId(),
          deviceId,
        });
        throw AuthError.HashingFailed(LoginUserAPIError.InvalidPassword);
      }

      const refreshToken = await this.generateRefreshToken(user, deviceId);

      const userProfile = await this.userProfileRepository.findOne({
        userId: user.getId(),
      });

      if (!userProfile) {
        this.logger.warn("Login: User profile not found", {
          userId: user.getId(),
          message: LoginUserAPIError.UserProfileNotFound,
        });
        throw APIError.NotFound(LoginUserAPIError.UserProfileNotFound);
      }

      const accessToken = await this.generateAccessToken(
        user.getUsername(),
        user.getId()
      );

      return this.userRepository.toResponse(
        user,
        accessToken,
        userProfile.getName(),
        refreshToken
      );
    } catch (error) {
      this.logger.error("User login error", {
        error,
        email: userLoginRequest.email,
        deviceId: userLoginRequest.deviceId,
      });
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof AuthError) {
        throw error;
      } else if (error instanceof APIError) {
        throw error;
      }

      throw APIError.InternalServerError("User login error");
    }
  }

  public async authenticateWithGoogle(
    decodedToken: DecodedIdToken,
    googleAuthRequest: GoogleAuthRequest
  ): Promise<UserResponse> {
    try {
      const { uid: googleId, email, name: googleName } = decodedToken;
      const { name: providedName, deviceId } = googleAuthRequest;

      if (!email) {
        throw APIError.BadRequest("Email is required");
      }

      const name = providedName || googleName || email?.split("@")[0];

      let user = await this.userRepository.findOne({ googleId });

      if (user) {
        this.logger.info("Logging in existing user with Google", {
          username: user.getUsername(),
          email: email,
          deviceId: deviceId,
          userId: user.getId(),
          authProvider: user.getAuthProvider(),
        });
        return this.loginExistingGoogleUser(user, deviceId);
      }

      // TODO pass name in instead of email
      const username = this.generateUniqueUsername(email);

      user = await this.userRepository.findOne({
        $or: [{ email: email }, { username: username }],
      });

      // TODO: look this over.
      if (user) {
        this.logger.warn("Google Auth registration conflict", {
          email,
          username,
          userId: user.getId(),
          message: GoogleAuthAPIError.UserAlreadyExists,
        });
        throw APIError.Conflict(GoogleAuthAPIError.UserAlreadyExists);
      }

      const userRequest = {
        username,
        isActive: true,
        email,
        authProvider: "google",
      } as UserRequest;

      const refreshToken = this.createRefreshToken(deviceId);

      const userDocument = this.userRepository.toDocument(
        userRequest,
        refreshToken,
        googleId
      );

      return this.createUser(userDocument, name);
    } catch (error) {
      this.logger.error("User login error", {
        error,
        email: decodedToken.email,
        deviceId: googleAuthRequest.deviceId,
        googleId: decodedToken.uid,
        name: googleAuthRequest.name,
      });
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof AuthError) {
        throw error;
      } else if (error instanceof APIError) {
        throw error;
      }

      throw APIError.InternalServerError("Google Auth login error");
    }
  }

  public async refreshTokens(
    refreshToken: string,
    deviceId: string
  ): Promise<RefreshTokenResponse> {
    try {
      const user = await this.userRepository.findOne({
        "refreshTokens.token": refreshToken,
        "refreshTokens.deviceId": deviceId,
      });

      if (!user) {
        // Add logging
        this.logger.warn(AuthErrorType.InvalidRefreshToken, {
          deviceId,
        });
        throw AuthError.Forbidden(AuthErrorType.InvalidRefreshToken);
      }

      const refreshTokenDocument = user
        .getRefreshTokens()
        .find(
          (token) => token.token === refreshToken && token.deviceId === deviceId
        );

      if (
        !refreshTokenDocument ||
        refreshTokenDocument.expiresAt < new Date()
      ) {
        await this.userRepository.findByIdAndUpdate(user.getId(), {
          $pull: {
            refreshTokens: { token: refreshToken, deviceId: deviceId },
          },
        });

        this.logger.warn(AuthErrorType.RefreshTokenExpired, {
          deviceId,
          userId: user.getId(),
          email: user.getEmail(),
          username: user.getUsername(),
        });
        throw AuthError.Forbidden(AuthErrorType.RefreshTokenExpired);
      }

      // Generate new refresh token
      const newRefreshToken = this.createRefreshToken(deviceId);
      const updatedUser = await this.userRepository.findOneAndUpdate(
        {
          _id: user.getId(),
          "refreshTokens.token": refreshToken,
          "refreshTokens.deviceId": deviceId,
        },
        {
          $pull: { refreshTokens: { token: refreshToken, deviceId: deviceId } },
          $push: { refreshTokens: newRefreshToken },
        },
        { new: true } // Return the modified document
      );

      const newAccessToken = await this.generateAccessToken(
        user.getUsername(),
        user.getId()
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken.token,
      };
    } catch (error) {
      this.logger.error("Error refreshing tokens", {
        error,
        deviceId,
      });
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof AuthError) {
        throw error;
      } else if (error instanceof APIError) {
        throw error;
      }

      throw APIError.InternalServerError(
        "An error occurred while refreshing tokens"
      );
    }
  }

  public async logoutUser(
    refreshToken: string,
    deviceId: string
  ): Promise<void> {
    try {
      const user = await this.userRepository.findOneAndUpdate(
        {
          "refreshTokens.token": refreshToken,
          "refreshTokens.deviceId": deviceId,
        },
        {
          $pull: {
            refreshTokens: { token: refreshToken, deviceId: deviceId },
          },
        }
      );

      if (!user) {
        this.logger.warn(
          "Logout: Refresh token/device ID not found or already removed.",
          {
            deviceId,
          }
        );

        throw APIError.NotFound(APIErrorType.UserNotFound);
      }

      this.logger.info(
        "User logged out successfully by removing refresh token",
        {
          userId: user.getId().toString(),
          deviceId,
        }
      );
    } catch (error) {
      this.logger.error("Logout error", {
        error,
        deviceId,
      });
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError || error instanceof AuthError) {
        throw error;
      }
      throw APIError.InternalServerError("An error occurred during logout.");
    }
  }

  private async loginExistingGoogleUser(
    user: User,
    deviceId: string
  ): Promise<UserResponse> {
    try {
      const userProfile = await this.userProfileRepository.findOne({
        userId: user.getId(),
      });

      if (!userProfile) {
        throw APIError.NotFound(APIErrorType.UserProfileNotFound);
      }

      const refreshToken = await this.generateRefreshToken(user, deviceId);

      const token = await this.generateAccessToken(
        userProfile.getName(),
        user.getId()
      );

      this.logger.info("User logged in with Google", {
        username: user.getUsername(),
        userId: user.getId(),
        deviceId,
      });

      return this.userRepository.toResponse(
        user,
        token,
        userProfile.getName(),
        refreshToken
      );
    } catch (error) {
      throw error;
    }
  }

  private async createUser(
    userDocument: Partial<UserDocument>,
    name: string
  ): Promise<UserResponse> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      this.logger.info("Creating new user", { name });

      const newUser = await this.userRepository.create(userDocument, {
        session,
      });

      await Promise.all([
        this.userProfileRepository.create(
          {
            userId: newUser.getId(),
            name,
            username: newUser.getUsername(),
          },
          { session }
        ),
        this.userGroupsRepository.create(
          {
            userId: newUser.getId(),
          },
          { session }
        ),
        this.followRepository.create(
          {
            userId: newUser.getId(),
          },
          { session }
        ),
      ]);

      await session.commitTransaction();

      // Generate JWT token
      const accessToken = await this.generateAccessToken(name, newUser.getId());
      const refreshToken = newUser.getRefreshTokens()[0].token;

      this.logger.info("New user created", {
        username: newUser.getUsername(),
        userId: newUser.getId(),
        authProvider: newUser.getAuthProvider(),
      });

      return this.userRepository.toResponse(
        newUser,
        accessToken,
        name,
        refreshToken
      );
    } catch (error) {
      this.logger.error("Error creating user", {
        error,
        name,
        email: userDocument.email,
        username: userDocument.username,
      });
      if (session) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  private async generateAccessToken(
    username: string,
    userId: Types.ObjectId
  ): Promise<string> {
    const payload: TokenPayload = {
      username,
      userId,
    };
    const secretKey = process.env.SECRET_CODE;
    if (!secretKey) {
      this.logger.error("SECRET_CODE environment variable is not defined");
      throw APIError.InternalServerError(
        "Authentication service configuration error"
      );
    }
    try {
      const expiresAt = process.env.ACCESS_TOKEN_EXPIRY;
      return await JWTUtil.sign(payload, secretKey, expiresAt);
    } catch (error) {
      // TODO: throw internal server error if not JWT error
      throw AuthError.handleJWTError(error);
    }
  }

  private async generateRefreshToken(
    user: User,
    deviceId: string
  ): Promise<string> {
    const refreshToken: string = uuidv4();
    const expiresAtNum = process.env.REFRESH_TOKEN_EXPIRY as unknown as number;
    const expiresAt = new Date(Date.now() + expiresAtNum * 24 * 60 * 60 * 1000); // 30 days

    const refreshTokenDocument: IRefreshToken = {
      token: refreshToken,
      deviceId,
      expiresAt,
    };

    const updatedUserDocument = this.userRepository.toDocumentFromEntity(
      user,
      refreshTokenDocument
    );

    try {
      await this.userRepository.findByIdAndUpdate(
        user.getId(),
        updatedUserDocument
      );
      return refreshToken;
    } catch (error) {
      throw error;
    }
  }

  private createRefreshToken(deviceId: string): IRefreshToken {
    const refreshToken: string = uuidv4();
    const expiresAtNum = process.env.REFRESH_TOKEN_EXPIRY as unknown as number;
    const expiresAt = new Date(Date.now() + expiresAtNum * 24 * 60 * 60 * 1000); // 30 days

    const refreshTokenDocument: IRefreshToken = {
      token: refreshToken,
      deviceId,
      expiresAt,
    };

    return refreshTokenDocument;
  }

  public generateUniqueUsername(email: string): string {
    const username = email.split("@")[0];
    const uniqueId = uuidv4().split("-")[0]; // Generate a short unique ID
    return `${username}_${uniqueId}`;
  }
}
