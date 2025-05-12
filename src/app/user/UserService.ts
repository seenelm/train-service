import JWTUtil from "../../common/utils/JWTUtil.js";
import BcryptUtil from "../../common/utils/BcryptUtil.js";
import { UserDocument } from "../../infrastructure/database/models/user/userModel.js";
import { MongooseError, Types } from "mongoose";
import User from "../../infrastructure/database/entity/user/User.js";

import {
  UserLoginRequest,
  UserResponse,
  UserRequest,
  updateUserRequest,
} from "./userDto.js";

import mongoose from "mongoose";
import { APIError } from "../../common/errors/APIError.js";
import { Logger } from "../../common/logger.js";
import { RegisterUserAPIError, LoginUserAPIError } from "../../common/enums.js";

import { DecodedIdToken } from "firebase-admin/auth";
import { MongoServerError } from "mongodb";
import { DatabaseError } from "../../common/errors/DatabaseError.js";
import { AuthError } from "../../common/errors/AuthError.js";
import { v4 as uuidv4 } from "uuid";
import { IUserRepository } from "../../infrastructure/database/repositories/user/UserRepository.js";
import { IUserProfileRepository } from "../../infrastructure/database/repositories/user/UserProfileRepository.js";
import { IUserGroupsRepository } from "../../infrastructure/database/repositories/user/UserGroupsRepository.js";
import { IFollowRepository } from "../../infrastructure/database/repositories/user/FollowRepository.js";

export interface TokenPayload {
  name: string;
  userId: Types.ObjectId;
}

export interface IUserService {
  registerUser(userRequest: UserRequest): Promise<UserResponse>;
  loginUser(userLoginRequest: UserLoginRequest): Promise<UserResponse>;
  authenticateWithGoogle(
    decodedToken: DecodedIdToken,
    providedName?: string
  ): Promise<UserResponse>;
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
      const { email, password, name } = userRequest;

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

      const userDocument = this.userRepository.toDocument(updatedUserRequest);

      return this.createUser(userDocument, name);
    } catch (error) {
      this.logger.error("Error registering user", error);
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof AuthError) {
        throw error;
      } else if (error instanceof APIError) {
        throw error;
      }

      throw APIError.InternalServerError("An error occurred while logging in", {
        error,
      });
    }
  }

  public async loginUser(
    userLoginRequest: UserLoginRequest
  ): Promise<UserResponse> {
    const { email, password } = userLoginRequest;

    try {
      const user = await this.userRepository.findOne({ email });

      if (!user) {
        this.logger.warn("Login: User not found", {
          email,
          message: LoginUserAPIError.UserNotFound,
        });
        throw APIError.NotFound(LoginUserAPIError.UserNotFound);
      }

      const isValidPassword = await BcryptUtil.comparePassword(
        password,
        user.getPassword()
      );

      if (!isValidPassword) {
        throw AuthError.HashingFailed({
          email,
          password,
        });
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

      const token = await this.generateAuthToken(
        userProfile.getName(),
        user.getId()
      );

      return this.userRepository.toResponse(user, token, userProfile.getName());
    } catch (error) {
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof AuthError) {
        throw error;
      } else if (error instanceof APIError) {
        throw error;
      }

      throw APIError.InternalServerError("An error occurred while logging in", {
        error,
      });
    }
  }

  public async authenticateWithGoogle(
    decodedToken: DecodedIdToken,
    providedName?: string
  ): Promise<UserResponse> {
    try {
      const { uid: googleId, email, name: googleName } = decodedToken;

      if (!email) {
        throw APIError.BadRequest("Email is required");
      }

      const name = providedName || googleName || email?.split("@")[0];

      let user = await this.userRepository.findOne({ googleId });

      if (user) {
        return this.loginExistingGoogleUser(user);
      }

      // TODO pass name in instead of email
      const username = this.generateUniqueUsername(email);

      user = await this.userRepository.findOne({
        $or: [{ email: email }, { username: username }],
      });

      if (user) {
        throw APIError.Conflict(
          "Account with this email/username already exists but not linked to this authentication provider",
          { email, username }
        );
      }

      const userRequest = {
        username,
        isActive: true,
        email,
        authProvider: "google",
      } as UserRequest;

      const userDocument = this.userRepository.toDocument(
        userRequest,
        googleId
      );

      return this.createUser(userDocument, name);
    } catch (error) {
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof AuthError) {
        throw error;
      } else if (error instanceof APIError) {
        throw error;
      }

      throw APIError.InternalServerError(
        "An error occurred while logging in with google",
        { error }
      );
    }
  }

  private async loginExistingGoogleUser(user: User): Promise<UserResponse> {
    try {
      const userProfile = await this.userProfileRepository.findOne({
        userId: user.getId(),
      });

      if (!userProfile) {
        throw APIError.NotFound("User profile not found", {
          userId: user.getId(),
        });
      }

      const token = await this.generateAuthToken(
        userProfile.getName(),
        user.getId()
      );

      this.logger.info("User logged in with Google", {
        username: user.getUsername(),
        userId: user.getId(),
      });

      return this.userRepository.toResponse(user, token, userProfile.getName());
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
      const token = await this.generateAuthToken(name, newUser.getId());

      this.logger.info("New user created", {
        username: newUser.getUsername(),
        userId: newUser.getId(),
        authProvider: newUser.getAuthProvider(),
      });

      return this.userRepository.toResponse(newUser, token, name);
    } catch (error) {
      this.logger.error("Error creating user", error);
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

  private async generateAuthToken(
    name: string,
    userId: Types.ObjectId
  ): Promise<string> {
    const payload: TokenPayload = {
      name,
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
      return await JWTUtil.sign(payload, secretKey, "15m");
    } catch (error) {
      // TODO: throw internal server error if not JWT error
      throw AuthError.handleJWTError(error);
    }
  }

  private generateRefreshToken() {
    return uuidv4();
  }

  public generateUniqueUsername(email: string): string {
    const username = email.split("@")[0];
    const uniqueId = uuidv4().split("-")[0]; // Generate a short unique ID
    return `${username}_${uniqueId}`;
  }
}
