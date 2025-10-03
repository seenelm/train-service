import JWTUtil from "../../common/utils/JWTUtil.js";
import BcryptUtil from "../../common/utils/BcryptUtil.js";
import {
  UserDocument,
  IRefreshToken,
} from "../../infrastructure/database/models/user/userModel.js";
import { MongooseError, Types } from "mongoose";
import User from "../../infrastructure/database/entity/user/User.js";

import {
  UserRequest,
  UserResponse,
  updateUserRequest,
  GoogleAuthRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RequestPasswordResetRequest,
  ResetPasswordWithCodeRequest,
  LogoutRequest,
  UserLoginRequest,
} from "@seenelm/train-core";

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
import { IPasswordResetRepository } from "../../infrastructure/database/repositories/user/PasswordResetRepository.js";
import { TokenPayload } from "../../common/middleware/AuthMiddleware.js";
import { IEmailService } from "../../infrastructure/EmailService.js";
import crypto from "crypto";

export interface IUserService {
  registerUser(userRequest: UserRequest): Promise<UserResponse>;
  loginUser(userLoginRequest: UserLoginRequest): Promise<UserResponse>;
  authenticateWithGoogle(
    decodedToken: DecodedIdToken,
    googleAuthRequest: GoogleAuthRequest
  ): Promise<UserResponse>;
  refreshTokens(
    refreshTokens: RefreshTokenRequest
  ): Promise<RefreshTokenResponse>;
  requestPasswordReset(request: RequestPasswordResetRequest): Promise<void>;
  resetPasswordWithCode(request: ResetPasswordWithCodeRequest): Promise<void>;
  logoutUser(
    userId: Types.ObjectId,
    logoutRequest: LogoutRequest
  ): Promise<void>;
  expireRefreshToken(refreshTokenRequest: RefreshTokenRequest): Promise<void>;
  getResetCode(userId: string): Promise<string | null>;
}

export default class UserService implements IUserService {
  private userRepository: IUserRepository;
  private userProfileRepository: IUserProfileRepository;
  private userGroupsRepository: IUserGroupsRepository;
  private followRepository: IFollowRepository;
  private passwordResetRepository: IPasswordResetRepository;
  private emailService: IEmailService;
  private logger: Logger;

  constructor(
    userRepository: IUserRepository,
    userProfileRepository: IUserProfileRepository,
    userGroupsRepository: IUserGroupsRepository,
    followRepository: IFollowRepository,
    passwordResetRepository: IPasswordResetRepository,
    emailService: IEmailService
  ) {
    this.userRepository = userRepository;
    this.userProfileRepository = userProfileRepository;
    this.userGroupsRepository = userGroupsRepository;
    this.followRepository = followRepository;
    this.passwordResetRepository = passwordResetRepository;
    this.emailService = emailService;
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

      const newUser = await this.createUser(userDocument, name);

      const accessToken = await this.generateAccessToken(
        newUser.getUsername(),
        newUser.getId()
      );

      return this.userRepository.toResponse(
        newUser,
        accessToken,
        name,
        refreshToken.token
      );
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
        throw AuthError.InvalidPassword(LoginUserAPIError.InvalidPassword);
      }

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

      let refreshTokenDoc = user
        .getRefreshTokens()
        .find((token) => token.deviceId === deviceId);
      if (refreshTokenDoc) {
        refreshTokenDoc = await this.rotateRefreshToken(
          user.getId(),
          refreshTokenDoc.token,
          deviceId
        );
      } else {
        refreshTokenDoc = this.createRefreshToken(deviceId);
        await this.userRepository.updateOne(
          { _id: user.getId() },
          { $push: { refreshTokens: refreshTokenDoc } }
        );
      }

      const accessToken = await this.generateAccessToken(
        user.getUsername(),
        user.getId()
      );

      return this.userRepository.toResponse(
        user,
        accessToken,
        userProfile.getName(),
        refreshTokenDoc.token
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

      const newUser = await this.createUser(userDocument, name);
      const accessToken = await this.generateAccessToken(
        newUser.getUsername(),
        newUser.getId()
      );

      return this.userRepository.toResponse(
        newUser,
        accessToken,
        name,
        refreshToken.token
      );
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
    refreshTokensRequest: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    const { refreshToken, deviceId } = refreshTokensRequest;

    try {
      const user = await this.userRepository.findOne({
        "refreshTokens.token": refreshToken,
        "refreshTokens.deviceId": deviceId,
      });

      this.logger.info("Refresh Token User: ", user);

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
        await this.userRepository.updateOne(
          { _id: user.getId() },
          {
            $pull: {
              refreshTokens: { token: refreshToken, deviceId },
            },
          }
        );

        this.logger.warn(AuthErrorType.RefreshTokenExpired, {
          deviceId,
          userId: user.getId(),
          email: user.getEmail(),
          username: user.getUsername(),
        });
        throw AuthError.Forbidden(AuthErrorType.InvalidRefreshToken);
      }

      const newRefreshToken = await this.rotateRefreshToken(
        user.getId(),
        refreshToken,
        deviceId
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

  public async requestPasswordReset(
    request: RequestPasswordResetRequest
  ): Promise<void> {
    const { email } = request;

    try {
      // Put in check for provider
      const user = await this.userRepository.findOne({ email });

      if (!user) {
        // FIX THIS
        this.logger.warn("Password reset: User not found", {
          email,
          message: APIErrorType.UserNotFound,
        });
        throw APIError.NotFound(APIErrorType.UserNotFound);
      }

      if (user.getAuthProvider() !== "local") {
        throw APIError.BadRequest("Google auth users cannot reset password");
      }

      const resetCode = await this.generatePasswordResetCode(user);

      await this.emailService.sendPasswordResetCode(
        email,
        resetCode,
        user.getUsername()
      );
    } catch (error) {
      this.logger.error("Request password reset error", {
        error,
        email: request.email,
      });
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof AuthError) {
        throw error;
      } else if (error instanceof APIError) {
        throw error;
      }

      throw APIError.InternalServerError("Request password reset error");
    }
  }

  public async resetPasswordWithCode(
    request: ResetPasswordWithCodeRequest
  ): Promise<void> {
    const { email, resetCode, newPassword } = request;

    try {
      const resetRequestDoc = await this.passwordResetRepository.findOne({
        email: email,
        code: resetCode,
      });

      if (!resetRequestDoc) {
        this.logger.warn("Invalid Code", {
          email,
          providedCode: resetCode,
        });
        throw APIError.BadRequest("Invalid Code");
      }

      if (resetRequestDoc.getExpiresAt() < new Date()) {
        this.logger.warn("Expired Code", {
          email,
          providedCode: resetCode,
        });

        await this.passwordResetRepository.findByIdAndDelete(
          resetRequestDoc.getId()
        );

        throw APIError.BadRequest("Expired Code");
      }

      const user = await this.userRepository.findById(
        resetRequestDoc.getUserId()
      );
      if (!user) {
        this.logger.error("User not found for a valid reset request.", {
          userId: resetRequestDoc.getUserId(),
          email,
        });
        await this.passwordResetRepository.findByIdAndDelete(
          resetRequestDoc.getId()
        );
        throw APIError.NotFound(APIErrorType.UserNotFound);
      }

      const newHashedPassword = await BcryptUtil.hashPassword(newPassword);

      await this.userRepository.findByIdAndUpdate(user.getId(), {
        password: newHashedPassword,
        refreshTokens: [], // Invalidate all existing refresh tokens
      });

      // Single Use: Delete the used reset token
      await this.passwordResetRepository.findByIdAndDelete(
        resetRequestDoc.getId()
      );

      this.logger.info("Password successfully reset.", {
        userId: user.getId(),
        email,
      });
    } catch (error) {
      this.logger.error("Error resetting password with code", { error, email });
      if (error instanceof APIError) throw error;
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      }
      throw APIError.InternalServerError(
        "An error occurred while resetting the password."
      );
    }
  }

  public async logoutUser(
    userId: Types.ObjectId,
    logoutRequest: LogoutRequest
  ): Promise<void> {
    const { refreshToken, deviceId } = logoutRequest;

    try {
      const result = await this.userRepository.findOneAndUpdate(
        {
          _id: userId,
          "refreshTokens.token": refreshToken,
          "refreshTokens.deviceId": deviceId,
        },
        {
          $pull: {
            refreshTokens: { token: refreshToken, deviceId },
          },
        }
      );

      if (!result) {
        this.logger.warn(
          "Logout attempt with invalid or expired refresh token",
          {
            deviceId,
          }
        );

        return;
      }

      this.logger.info("User logged out successfully", {
        userId: result.getId().toString(),
        deviceId,
      });
    } catch (error) {
      this.logger.error("Logout error", {
        error,
        deviceId,
      });
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      }
      if (error instanceof APIError || error instanceof AuthError) {
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

      let refreshTokenDoc = user
        .getRefreshTokens()
        .find((token) => token.deviceId === deviceId);
      if (refreshTokenDoc) {
        refreshTokenDoc = await this.rotateRefreshToken(
          user.getId(),
          refreshTokenDoc.token,
          deviceId
        );
      } else {
        refreshTokenDoc = this.createRefreshToken(deviceId);
        await this.userRepository.updateOne(
          { _id: user.getId() },
          { $push: { refreshTokens: refreshTokenDoc } }
        );
      }

      const accessToken = await this.generateAccessToken(
        user.getUsername(),
        user.getId()
      );

      this.logger.info("User logged in with Google", {
        username: user.getUsername(),
        userId: user.getId(),
        deviceId,
      });

      return this.userRepository.toResponse(
        user,
        accessToken,
        userProfile.getName(),
        refreshTokenDoc.token
      );
    } catch (error) {
      throw error;
    }
  }

  private async createUser(
    userDocument: Partial<UserDocument>,
    name: string
  ): Promise<User> {
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

      // // Generate JWT token
      // const accessToken = await this.generateAccessToken(
      //   newUser.getUsername(),
      //   newUser.getId()
      // );
      // const refreshToken = newUser.getRefreshTokens()[0].token;

      this.logger.info("New user created", {
        username: newUser.getUsername(),
        userId: newUser.getId(),
        authProvider: newUser.getAuthProvider(),
      });

      // return this.userRepository.toResponse(
      //   newUser,
      //   accessToken,
      //   name,
      //   refreshToken
      // );
      return newUser;
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
      const expiresAt = process.env.ACCESS_TOKEN_EXPIRY || "15m";
      return await JWTUtil.sign(payload, secretKey, expiresAt);
    } catch (error) {
      // TODO: throw internal server error if not JWT error
      throw AuthError.handleJWTError(error);
    }
  }

  private createRefreshToken(deviceId: string): IRefreshToken {
    const refreshToken: string = uuidv4();
    const days = parseInt(process.env.REFRESH_TOKEN_EXPIRY || "30", 10);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000); // 30 days

    const refreshTokenDocument: IRefreshToken = {
      token: refreshToken,
      deviceId,
      expiresAt,
    };

    return refreshTokenDocument;
  }

  private async rotateRefreshToken(
    userId: Types.ObjectId,
    oldToken: string,
    deviceId: string
  ): Promise<IRefreshToken> {
    try {
      const newRefreshToken = this.createRefreshToken(deviceId);

      await this.userRepository.updateOne(
        { _id: userId },
        {
          $pull: { refreshTokens: { token: oldToken, deviceId } },
        }
      );

      await this.userRepository.updateOne(
        { _id: userId },
        {
          $push: { refreshTokens: newRefreshToken },
        }
      );

      return newRefreshToken;
    } catch (error) {
      this.logger.error("Error rotating refresh token", {
        error,
        userId,
        oldToken,
        deviceId,
      });
      throw error;
    }
  }

  private async generatePasswordResetCode(user: User): Promise<string> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const resetCode = crypto.randomInt(100000, 999999).toString(); // 6-digit code
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Code expires in 10 minutes

      // Invalidate any previous active reset codes for this user
      await this.passwordResetRepository.deleteMany(
        {
          userId: user.getId(),
          expiresAt: { $gt: new Date() },
        },
        { session }
      );

      await this.passwordResetRepository.create(
        {
          userId: user.getId(),
          email: user.getEmail(),
          code: resetCode,
          expiresAt: expiresAt,
        },
        { session }
      );

      await session.commitTransaction();
      return resetCode;
    } catch (error) {
      await session.abortTransaction();
      this.logger.error("Error generating password reset code", {
        error,
        userId: user.getId(),
        email: user.getEmail(),
      });
      throw error;
    } finally {
      session.endSession();
    }
  }

  public generateUniqueUsername(email: string): string {
    const username = email.split("@")[0];
    const uniqueId = uuidv4().split("-")[0]; // Generate a short unique ID
    return `${username}_${uniqueId}`;
  }

  public async expireRefreshToken(
    refreshTokenRequest: RefreshTokenRequest
  ): Promise<void> {
    const { refreshToken, deviceId } = refreshTokenRequest;

    // if (process.env.NODE_ENV !== "test") {
    //   throw APIError.Forbidden("This endpoint is only available in test mode");
    // }

    try {
      const user = await this.userRepository.findOne({
        "refreshTokens.token": refreshToken,
        "refreshTokens.deviceId": deviceId,
      });

      if (!user) {
        this.logger.warn("User not found", {
          deviceId,
        });
        throw APIError.NotFound(APIErrorType.UserNotFound);
      }

      await this.userRepository.updateOne(
        {
          _id: user.getId(),
          "refreshTokens.token": refreshToken,
          "refreshTokens.deviceId": deviceId,
        },
        {
          $set: {
            "refreshTokens.$.expiresAt": new Date(),
          },
        }
      );
    } catch (error) {
      this.logger.error("Error expiring refresh token", {
        error,
        deviceId,
      });
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      }

      throw APIError.InternalServerError(
        "An error occurred while expiring refresh token"
      );
    }
  }

  public async getResetCode(userId: string): Promise<string | null> {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("getResetCode is only available in test environment");
    }

    const resetCode = await this.passwordResetRepository.findOne({
      userId,
      expiresAt: { $gt: new Date() },
    });

    return resetCode?.getCode() || null;
  }
}
