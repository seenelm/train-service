import { IUserProfileRepository } from "../../infrastructure/database/repositories/user/UserProfileRepository.js";
import { IFollowRepository } from "../../infrastructure/database/repositories/user/FollowRepository.js";
import { UserProfileRequest } from "@seenelm/train-core";
import { APIError } from "../../common/errors/APIError.js";
import { MongooseError } from "mongoose";
import { MongoServerError } from "mongodb";
import { DatabaseError } from "../../common/errors/DatabaseError.js";
import { Logger } from "../../common/logger.js";
import { Types } from "mongoose";

export interface IUserProfileService {
  updateUserProfile(userProfileRequest: UserProfileRequest): Promise<void>;
}

export default class UserProfileService implements IUserProfileService {
  private userProfileRepository: IUserProfileRepository;
  private followRepository: IFollowRepository;
  private logger: Logger;

  constructor(
    userProfileRepository: IUserProfileRepository,
    followRepository: IFollowRepository
  ) {
    this.userProfileRepository = userProfileRepository;
    this.followRepository = followRepository;
    this.logger = Logger.getInstance();
  }

  public async updateUserProfile(
    userProfileRequest: UserProfileRequest
  ): Promise<void> {
    try {
      const userId = new Types.ObjectId(userProfileRequest.userId);
      const userProfile = await this.userProfileRepository.findOne({
        userId,
      });

      if (!userProfile) {
        this.logger.warn("User profile not found", {
          userId: userProfileRequest.userId,
        });
        throw APIError.NotFound("User profile not found");
      }

      const userProfileDocument =
        this.userProfileRepository.toDocument(userProfileRequest);

      await this.userProfileRepository.updateOne(
        { userId },
        userProfileDocument
      );

      this.logger.info("User profile updated successfully", {
        userId,
      });
    } catch (error) {
      this.logger.error("Failed to update user profile", {
        error,
      });
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to update user profile");
      }
    }
  }
}
