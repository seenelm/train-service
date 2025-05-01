import UserRepository from "../../infrastructure/database/repositories/user/UserRepository.js";
import JWTUtil from "../../common/utils/JWTUtil.js";
import BcryptUtil from "../../common/utils/BcryptUtil.js";
import { UserDocument } from "../../infrastructure/database/models/user/userModel.js";
import UserProfileRepository from "../../infrastructure/database/repositories/user/UserProfileRepository.js";
import UserGroupsRepository from "../../infrastructure/database/repositories/user/UserGroupsRepository.js";
import FollowRepository from "../../infrastructure/database/repositories/user/FollowRepository.js";
import { MongooseError, Types } from "mongoose";
import User from "../../infrastructure/database/entity/user/User.js";

import { UserLoginRequest, UserResponse } from "./dto/userDto.js";

import mongoose from "mongoose";
import { APIError } from "../../common/errors/APIError.js";
import { Logger } from "../../common/logger.js";

import { DecodedIdToken } from "firebase-admin/auth";
import { MongoServerError } from "mongodb";
import { DatabaseError } from "../../common/errors/DatabaseError.js";
import { AuthError } from "../../common/errors/AuthError.js";
import { v4 as uuidv4 } from "uuid";
import UserRequest from "./dto/UserRequest.js";

export interface TokenPayload {
  name: string;
  userId: Types.ObjectId;
}

export default class UserService {
  private userRepository: UserRepository;
  private userProfileRepository: UserProfileRepository;
  private userGroupsRepository: UserGroupsRepository;
  private followRepository: FollowRepository;
  private logger: Logger;

  constructor(
    userRepository: UserRepository,
    userProfileRepository: UserProfileRepository,
    userGroupsRepository: UserGroupsRepository,
    followRepository: FollowRepository
  ) {
    this.userRepository = userRepository;
    this.userProfileRepository = userProfileRepository;
    this.userGroupsRepository = userGroupsRepository;
    this.followRepository = followRepository;
    this.logger = Logger.getInstance();
  }

  public async registerUser(userRequest: UserRequest): Promise<UserResponse> {
    try {
      const email = userRequest.getEmail();

      const username = this.generateUniqueUsername(userRequest.getEmail());

      const user = await this.userRepository.findOne({
        $or: [{ email }, { username }],
      });

      if (user) {
        throw APIError.Conflict(
          "Account with this email/username already exists",
          { email, username }
        );
      }

      const hash = await BcryptUtil.hashPassword(userRequest.getPassword());

      userRequest.setUsername(username);
      userRequest.setIsActive(true);
      userRequest.setPassword(hash);

      const userDocument = this.userRepository.toDocument(userRequest);

      return this.createUser(userDocument, userRequest.getName());
    } catch (error) {
      throw error;
    }
  }

  public async loginUser(
    userLoginRequest: UserLoginRequest
  ): Promise<UserResponse> {
    const { email, password } = userLoginRequest;

    try {
      const user = await this.userRepository.findOne({ email });

      if (!user) {
        throw APIError.NotFound("User not found", { email });
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
        throw APIError.NotFound("User profile not found", {
          userId: user.getId(),
        });
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

      const userRequest = UserRequest.builder()
        .setUsername(username)
        .setIsActive(true)
        .setEmail(email)
        .setAuthProvider("google")
        .build();

      const userDocument = this.userRepository.toDocument(
        userRequest,
        googleId
      );

      return this.createUser(userDocument, name);
    } catch (error) {
      this.logger.error("Error logging in with Google", error);
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

  public async generateAuthToken(
    name: string,
    userId: Types.ObjectId
  ): Promise<string> {
    const payload: TokenPayload = {
      name,
      userId,
    };
    try {
      if (!process.env.SECRET_CODE) {
        throw new Error('SECRET_CODE environment variable is not defined');
      }
      return await JWTUtil.sign(payload, process.env.SECRET_CODE);
    } catch (error) {
      // TODO: throw internal server error if not JWT error
      throw AuthError.handleJWTError(error);
    }
  }

  public generateUniqueUsername(email: string): string {
    const username = email.split("@")[0];
    const uniqueId = uuidv4().split("-")[0]; // Generate a short unique ID
    return `${username}_${uniqueId}`;
  }

}
