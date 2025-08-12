import { IUserProfileRepository } from "../../infrastructure/database/repositories/user/UserProfileRepository.js";
import { IFollowRepository } from "../../infrastructure/database/repositories/user/FollowRepository.js";
import { IUserGroupsRepository } from "../../infrastructure/database/repositories/user/UserGroupsRepository.js";
import { UserProfileRequest } from "@seenelm/train-core";
import { APIError } from "../../common/errors/APIError.js";
import { MongooseError } from "mongoose";
import { MongoServerError } from "mongodb";
import { DatabaseError } from "../../common/errors/DatabaseError.js";
import { Logger } from "../../common/logger.js";
import { Types } from "mongoose";
import mongoose from "mongoose";
import { CustomSectionRequest } from "@seenelm/train-core";
import { ErrorMessage } from "../../common/enums.js";
import { CustomSection } from "../../infrastructure/database/models/userProfile/userProfileModel.js";
import {
  CustomSectionResponse,
  CustomSectionType,
  BasicUserProfileInfoRequest,
  ProfileAccess,
  GroupResponse,
  UserGroupsResponse,
  UserProfileResponse,
} from "@seenelm/train-core";

import {
  CursorPaginationRequest,
  FollowStatsResponse,
  FollowersResponse,
  FollowingResponse,
  FollowSearchRequest,
  FollowSearchResponse,
} from "./followDto.js";

export interface IUserProfileService {
  getUserProfile(userId: Types.ObjectId): Promise<UserProfileResponse>;
  updateUserProfile(userProfileRequest: UserProfileRequest): Promise<void>;
  updateCustomSection(
    userId: Types.ObjectId,
    customSectionRequest: CustomSectionRequest
  ): Promise<void>;
  updateBasicUserProfileInfo(
    userId: Types.ObjectId,
    basicProfileRequest: BasicUserProfileInfoRequest
  ): Promise<void>;
  createCustomSection(
    userId: Types.ObjectId,
    customSectionRequest: CustomSectionRequest
  ): Promise<void>;
  getCustomSections(userId: Types.ObjectId): Promise<CustomSectionResponse[]>;
  deleteCustomSection(
    userId: Types.ObjectId,
    sectionTitle: CustomSectionType
  ): Promise<void>;
  followUser(
    followerId: Types.ObjectId,
    followeeId: Types.ObjectId
  ): Promise<void>;
  requestToFollowUser(
    followerId: Types.ObjectId,
    followeeId: Types.ObjectId
  ): Promise<void>;
  acceptFollowRequest(
    followeeId: Types.ObjectId,
    followerId: Types.ObjectId
  ): Promise<void>;
  rejectFollowRequest(
    followeeId: Types.ObjectId,
    followerId: Types.ObjectId
  ): Promise<void>;
  unfollowUser(
    followerId: Types.ObjectId,
    followeeId: Types.ObjectId
  ): Promise<void>;
  removeFollower(
    followeeId: Types.ObjectId,
    followerId: Types.ObjectId
  ): Promise<void>;
  fetchUserGroups(userId: Types.ObjectId): Promise<UserGroupsResponse>;

  // Cursor-based pagination methods
  getFollowStats(userId: Types.ObjectId): Promise<FollowStatsResponse>;
  getFollowers(
    userId: Types.ObjectId,
    pagination: CursorPaginationRequest
  ): Promise<FollowersResponse>;
  getFollowing(
    userId: Types.ObjectId,
    pagination: CursorPaginationRequest
  ): Promise<FollowingResponse>;
  searchFollowers(
    userId: Types.ObjectId,
    searchTerm: string,
    pagination: CursorPaginationRequest
  ): Promise<FollowSearchResponse>;
  searchFollowing(
    userId: Types.ObjectId,
    searchTerm: string,
    pagination: CursorPaginationRequest
  ): Promise<FollowSearchResponse>;
}

export default class UserProfileService implements IUserProfileService {
  private userProfileRepository: IUserProfileRepository;
  private followRepository: IFollowRepository;
  private userGroupsRepository: IUserGroupsRepository;
  private logger: Logger;

  constructor(
    userProfileRepository: IUserProfileRepository,
    followRepository: IFollowRepository,
    userGroupsRepository: IUserGroupsRepository
  ) {
    this.userProfileRepository = userProfileRepository;
    this.followRepository = followRepository;
    this.userGroupsRepository = userGroupsRepository;
    this.logger = Logger.getInstance();
  }

  public async getUserProfile(
    userId: Types.ObjectId
  ): Promise<UserProfileResponse> {
    try {
      const userProfile = await this.userProfileRepository.findOne({
        userId,
      });

      if (!userProfile) {
        this.logger.warn("User profile not found", {
          userId: userId.toString(),
        });
        throw APIError.NotFound("User profile not found");
      }

      this.logger.info("User profile retrieved successfully", {
        userId: userId.toString(),
        username: userProfile.getUsername(),
      });

      return this.userProfileRepository.toResponse(userProfile);
    } catch (error) {
      this.logger.error("Failed to get user profile", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: userId.toString(),
      });

      if (error instanceof APIError) {
        throw error;
      } else if (
        error instanceof MongooseError ||
        error instanceof MongoServerError
      ) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to get user profile");
      }
    }
  }

  private toCustomSectionResponse(
    customSections: CustomSection[]
  ): CustomSectionResponse[] {
    return customSections.map((section) => ({
      title: section.title,
      details: section.details,
    }));
  }

  public async getCustomSections(
    userId: Types.ObjectId
  ): Promise<CustomSectionResponse[]> {
    try {
      const userProfile = await this.userProfileRepository.findOne({
        userId,
      });

      if (!userProfile) {
        this.logger.warn(ErrorMessage.USER_PROFILE_NOT_FOUND, { userId });
        throw APIError.NotFound(ErrorMessage.USER_PROFILE_NOT_FOUND);
      }

      const customSections = userProfile.getCustomSections() || [];

      this.logger.info("Custom sections retrieved successfully", {
        userId,
        sectionCount: customSections.length,
      });

      return this.toCustomSectionResponse(customSections);
    } catch (error) {
      this.logger.error("Failed to get custom sections", {
        error,
        userId,
      });

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to get custom sections");
      }
    }
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
        this.logger.warn(ErrorMessage.USER_PROFILE_NOT_FOUND, {
          userId: userProfileRequest.userId,
        });
        throw APIError.NotFound(ErrorMessage.USER_PROFILE_NOT_FOUND);
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

  public async updateBasicUserProfileInfo(
    userId: Types.ObjectId,
    basicProfileRequest: BasicUserProfileInfoRequest
  ): Promise<void> {
    try {
      const userProfile = await this.userProfileRepository.findOne({
        userId,
      });

      if (!userProfile) {
        this.logger.warn(ErrorMessage.USER_PROFILE_NOT_FOUND, {
          userId,
          username: basicProfileRequest.username,
        });
        throw APIError.NotFound(ErrorMessage.USER_PROFILE_NOT_FOUND);
      }

      const updateData = {
        username: basicProfileRequest.username,
        name: basicProfileRequest.name,
        bio: basicProfileRequest.bio,
        accountType: basicProfileRequest.accountType,
        profilePicture: basicProfileRequest.profilePicture,
        role: basicProfileRequest.role,
        location: basicProfileRequest.location,
      };

      await this.userProfileRepository.updateOne({ userId }, updateData);

      this.logger.info(
        `Basic profile updated for user: ${basicProfileRequest.username}`
      );
    } catch (error) {
      this.logger.error("Failed to update basic user profile info", {
        error,
      });
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError(
          "Failed to update basic user profile info"
        );
      }
    }
  }

  public async createCustomSection(
    userId: Types.ObjectId,
    customSectionRequest: CustomSectionRequest
  ): Promise<void> {
    try {
      const userProfile = await this.userProfileRepository.findOne({
        userId: new Types.ObjectId(userId),
      });

      if (!userProfile) {
        this.logger.warn(ErrorMessage.USER_PROFILE_NOT_FOUND, { userId });
        throw APIError.NotFound(ErrorMessage.USER_PROFILE_NOT_FOUND);
      }

      const existingSections = userProfile.getCustomSections() || [];
      const sectionExists = existingSections.some(
        (section) => section.title === customSectionRequest.title
      );

      if (sectionExists) {
        this.logger.warn(ErrorMessage.CUSTOM_SECTION_ALREADY_EXISTS, {
          userId,
          sectionTitle: customSectionRequest.title,
        });
        throw APIError.Conflict(ErrorMessage.CUSTOM_SECTION_ALREADY_EXISTS);
      }

      await this.userProfileRepository.updateOne(
        { userId },
        {
          $push: {
            customSections: {
              title: customSectionRequest.title,
              details: customSectionRequest.details,
            },
          },
        }
      );

      this.logger.info("Custom section created successfully", {
        userId,
        sectionTitle: customSectionRequest.title,
      });
    } catch (error) {
      this.logger.error("Failed to create custom section", {
        error,
        userId,
        sectionTitle: customSectionRequest.title,
      });

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to create custom section");
      }
    }
  }

  public async updateCustomSection(
    userId: Types.ObjectId,
    customSectionRequest: CustomSectionRequest
  ): Promise<void> {
    try {
      const userProfile = await this.userProfileRepository.findOne({
        userId: new Types.ObjectId(userId),
      });

      if (!userProfile) {
        this.logger.warn(ErrorMessage.USER_PROFILE_NOT_FOUND, { userId });
        throw APIError.NotFound(ErrorMessage.USER_PROFILE_NOT_FOUND);
      }

      const existingSections = userProfile.getCustomSections() || [];
      const sectionExists = existingSections.some(
        (section) => section.title === customSectionRequest.title
      );

      if (!sectionExists) {
        this.logger.warn(ErrorMessage.CUSTOM_SECTION_NOT_FOUND, {
          userId,
          sectionTitle: customSectionRequest.title,
        });
        throw APIError.NotFound(ErrorMessage.CUSTOM_SECTION_NOT_FOUND);
      }

      await this.userProfileRepository.updateOne(
        {
          userId,
          "customSections.title": customSectionRequest.title,
        },
        {
          $set: {
            "customSections.$.details": customSectionRequest.details,
          },
        }
      );
    } catch (error) {
      this.logger.error("Failed to update custom section", {
        error,
        userId,
        sectionTitle: customSectionRequest.title,
      });

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to update custom section");
      }
    }
  }

  public async deleteCustomSection(
    userId: Types.ObjectId,
    sectionTitle: CustomSectionType
  ): Promise<void> {
    try {
      const userProfile = await this.userProfileRepository.findOne({
        userId,
      });

      if (!userProfile) {
        this.logger.warn(ErrorMessage.USER_PROFILE_NOT_FOUND, { userId });
        throw APIError.NotFound(ErrorMessage.USER_PROFILE_NOT_FOUND);
      }

      const existingSections = userProfile.getCustomSections() || [];
      const sectionExists = existingSections.some(
        (section) => section.title === sectionTitle
      );

      if (!sectionExists) {
        this.logger.warn(ErrorMessage.CUSTOM_SECTION_NOT_FOUND, {
          userId,
          sectionTitle,
        });
        throw APIError.NotFound(ErrorMessage.CUSTOM_SECTION_NOT_FOUND);
      }

      await this.userProfileRepository.updateOne(
        { userId },
        {
          $pull: {
            customSections: {
              title: sectionTitle,
            },
          },
        }
      );

      this.logger.info("Custom section deleted successfully", {
        userId,
        sectionTitle,
      });
    } catch (error) {
      this.logger.error("Failed to delete custom section", {
        error,
        userId,
        sectionTitle,
      });

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to delete custom section");
      }
    }
  }

  public async followUser(
    followerId: Types.ObjectId,
    followeeId: Types.ObjectId
  ): Promise<void> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Check if follower exists and get their follow document
      const follower = await this.followRepository.findOne({
        userId: followerId,
      });
      if (!follower) {
        this.logger.warn(ErrorMessage.FOLLOWER_NOT_FOUND, { followerId });
        throw APIError.NotFound(ErrorMessage.FOLLOWER_NOT_FOUND);
      }

      // Check if followee exists and get their follow document
      const followee = await this.followRepository.findOne({
        userId: followeeId,
      });
      if (!followee) {
        this.logger.warn(ErrorMessage.FOLLOWEE_NOT_FOUND, { followeeId });
        throw APIError.NotFound(ErrorMessage.FOLLOWEE_NOT_FOUND);
      }

      // Check if already following
      const isAlreadyFollowing = follower
        .getFollowing()
        .some((id) => id.equals(followeeId));
      if (isAlreadyFollowing) {
        this.logger.warn(ErrorMessage.ALREADY_FOLLOWING, {
          followerId,
          followeeId,
        });
        throw APIError.Conflict(ErrorMessage.ALREADY_FOLLOWING);
      }

      // Add followee to follower's following list
      await this.followRepository.updateOne(
        { userId: followerId },
        { $addToSet: { following: followeeId } },
        { session }
      );

      // Add follower to followee's followers list
      await this.followRepository.updateOne(
        { userId: followeeId },
        { $addToSet: { followers: followerId } },
        { session }
      );

      await session.commitTransaction();

      this.logger.info("User followed successfully", {
        followerId,
        followeeId,
      });
    } catch (error) {
      this.logger.error("Failed to follow user", {
        error,
        followerId,
        followeeId,
      });

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to follow user");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  public async requestToFollowUser(
    followerId: Types.ObjectId,
    followeeId: Types.ObjectId
  ): Promise<void> {
    try {
      // Check if follower exists and get their follow document
      const follower = await this.followRepository.findOne({
        userId: followerId,
      });
      if (!follower) {
        this.logger.warn(ErrorMessage.FOLLOWER_NOT_FOUND, { followerId });
        throw APIError.NotFound(ErrorMessage.FOLLOWER_NOT_FOUND);
      }

      // Check if followee exists and get their follow document
      const followee = await this.followRepository.findOne({
        userId: followeeId,
      });
      if (!followee) {
        this.logger.warn(ErrorMessage.FOLLOWEE_NOT_FOUND, { followeeId });
        throw APIError.NotFound(ErrorMessage.FOLLOWEE_NOT_FOUND);
      }

      // Check if already following
      const isAlreadyFollowing = follower
        .getFollowing()
        .some((id) => id.equals(followeeId));
      if (isAlreadyFollowing) {
        this.logger.warn(ErrorMessage.ALREADY_FOLLOWING, {
          followerId,
          followeeId,
        });
        throw APIError.Conflict(ErrorMessage.ALREADY_FOLLOWING);
      }

      // Check if already requested
      const isAlreadyRequested = followee!
        .getRequests()
        .some((id) => id.equals(followerId));
      if (isAlreadyRequested) {
        this.logger.warn(ErrorMessage.FOLLOW_REQUEST_ALREADY_SENT, {
          followerId,
          followeeId,
        });
        throw APIError.Conflict(ErrorMessage.FOLLOW_REQUEST_ALREADY_SENT);
      }

      // Add follower to followee's requests list
      await this.followRepository.updateOne(
        { userId: followeeId },
        { $addToSet: { requests: followerId } }
      );

      this.logger.info("Follow request sent successfully", {
        followerId,
        followeeId,
      });
    } catch (error) {
      this.logger.error("Failed to send follow request", {
        error,
        followerId,
        followeeId,
      });

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to send follow request");
      }
    }
  }

  public async acceptFollowRequest(
    followeeId: Types.ObjectId,
    followerId: Types.ObjectId
  ): Promise<void> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Check if followee exists and get their follow document
      const followee = await this.followRepository.findOne({
        userId: followeeId,
      });
      if (!followee) {
        this.logger.warn(ErrorMessage.FOLLOWEE_NOT_FOUND, { followeeId });
        throw APIError.NotFound(ErrorMessage.FOLLOWEE_NOT_FOUND);
      }

      // Check if follower exists and get their follow document
      const follower = await this.followRepository.findOne({
        userId: followerId,
      });
      if (!follower) {
        this.logger.warn(ErrorMessage.FOLLOWER_NOT_FOUND, { followerId });
        throw APIError.NotFound(ErrorMessage.FOLLOWER_NOT_FOUND);
      }

      // Check if the request exists
      const hasRequest = followee
        .getRequests()
        .some((id) => id.equals(followerId));
      if (!hasRequest) {
        this.logger.warn(ErrorMessage.FOLLOW_REQUEST_NOT_FOUND, {
          followeeId,
          followerId,
        });
        throw APIError.NotFound(ErrorMessage.FOLLOW_REQUEST_NOT_FOUND);
      }

      // Check if already following
      const isAlreadyFollowing = follower
        .getFollowing()
        .some((id) => id.equals(followeeId));
      if (isAlreadyFollowing) {
        this.logger.warn(ErrorMessage.ALREADY_FOLLOWING, {
          followerId,
          followeeId,
        });
        throw APIError.Conflict(ErrorMessage.ALREADY_FOLLOWING);
      }

      // Remove follower from followee's requests list
      await this.followRepository.updateOne(
        { userId: followeeId },
        {
          $addToSet: { followers: followerId },
          $pull: { requests: followerId },
        },
        { session }
      );

      // Add followee to follower's following list
      await this.followRepository.updateOne(
        { userId: followerId },
        { $addToSet: { following: followeeId } },
        { session }
      );

      await session.commitTransaction();

      this.logger.info("Follow request accepted successfully", {
        followeeId,
        followerId,
      });
    } catch (error) {
      this.logger.error("Failed to accept follow request", {
        error,
        followeeId,
        followerId,
      });

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to accept follow request");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  public async rejectFollowRequest(
    followeeId: Types.ObjectId,
    followerId: Types.ObjectId
  ): Promise<void> {
    try {
      // Check if followee exists and get their follow document
      const followee = await this.followRepository.findOne({
        userId: followeeId,
      });
      if (!followee) {
        this.logger.warn(ErrorMessage.FOLLOWEE_NOT_FOUND, { followeeId });
        throw APIError.NotFound(ErrorMessage.FOLLOWEE_NOT_FOUND);
      }

      // Check if follower exists and get their follow document
      const follower = await this.followRepository.findOne({
        userId: followerId,
      });
      if (!follower) {
        this.logger.warn(ErrorMessage.FOLLOWER_NOT_FOUND, { followerId });
        throw APIError.NotFound(ErrorMessage.FOLLOWER_NOT_FOUND);
      }

      // Check if the request exists
      const hasRequest = followee
        .getRequests()
        .some((id) => id.equals(followerId));
      if (!hasRequest) {
        this.logger.warn(ErrorMessage.FOLLOW_REQUEST_NOT_FOUND, {
          followeeId,
          followerId,
        });
        throw APIError.NotFound(ErrorMessage.FOLLOW_REQUEST_NOT_FOUND);
      }

      // Remove follower from followee's requests list
      await this.followRepository.updateOne(
        { userId: followeeId },
        { $pull: { requests: followerId } }
      );

      this.logger.info("Follow request rejected successfully", {
        followeeId,
        followerId,
      });
    } catch (error) {
      this.logger.error("Failed to reject follow request", {
        error,
        followeeId,
        followerId,
      });

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to reject follow request");
      }
    }
  }

  public async unfollowUser(
    followerId: Types.ObjectId,
    followeeId: Types.ObjectId
  ): Promise<void> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Check if follower exists and get their follow document
      const follower = await this.followRepository.findOne({
        userId: followerId,
      });
      if (!follower) {
        this.logger.warn(ErrorMessage.FOLLOWER_NOT_FOUND, { followerId });
        throw APIError.NotFound(ErrorMessage.FOLLOWER_NOT_FOUND);
      }

      // Check if followee exists and get their follow document
      const followee = await this.followRepository.findOne({
        userId: followeeId,
      });
      if (!followee) {
        this.logger.warn(ErrorMessage.FOLLOWEE_NOT_FOUND, { followeeId });
        throw APIError.NotFound(ErrorMessage.FOLLOWEE_NOT_FOUND);
      }

      // Check if currently following
      const isCurrentlyFollowing = follower
        .getFollowing()
        .some((id) => id.equals(followeeId));
      if (!isCurrentlyFollowing) {
        this.logger.warn(ErrorMessage.NOT_CURRENTLY_FOLLOWING, {
          followerId,
          followeeId,
        });
        throw APIError.BadRequest(ErrorMessage.NOT_CURRENTLY_FOLLOWING);
      }

      // Remove followee from follower's following list
      await this.followRepository.updateOne(
        { userId: followerId },
        { $pull: { following: followeeId } },
        { session }
      );

      // Remove follower from followee's followers list
      await this.followRepository.updateOne(
        { userId: followeeId },
        { $pull: { followers: followerId } },
        { session }
      );

      await session.commitTransaction();

      this.logger.info("User unfollowed successfully", {
        followerId,
        followeeId,
      });
    } catch (error) {
      this.logger.error("Failed to unfollow user", {
        error,
        followerId,
        followeeId,
      });

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to unfollow user");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  public async removeFollower(
    followeeId: Types.ObjectId,
    followerId: Types.ObjectId
  ): Promise<void> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Check if followee exists and get their follow document
      const followee = await this.followRepository.findOne({
        userId: followeeId,
      });
      if (!followee) {
        this.logger.warn(ErrorMessage.FOLLOWEE_NOT_FOUND, { followeeId });
        throw APIError.NotFound(ErrorMessage.FOLLOWEE_NOT_FOUND);
      }

      // Check if follower exists and get their follow document
      const follower = await this.followRepository.findOne({
        userId: followerId,
      });
      if (!follower) {
        this.logger.warn(ErrorMessage.FOLLOWER_NOT_FOUND, { followerId });
        throw APIError.NotFound(ErrorMessage.FOLLOWER_NOT_FOUND);
      }

      // Check if follower is currently following the followee
      const isCurrentlyFollowing = followee
        .getFollowers()
        .some((id) => id.equals(followerId));
      if (!isCurrentlyFollowing) {
        this.logger.warn(ErrorMessage.FOLLOWER_NOT_CURRENTLY_FOLLOWING, {
          followeeId,
          followerId,
        });
        throw APIError.BadRequest(
          ErrorMessage.FOLLOWER_NOT_CURRENTLY_FOLLOWING
        );
      }

      // Remove follower from followee's followers list
      await this.followRepository.updateOne(
        { userId: followeeId },
        { $pull: { followers: followerId } },
        { session }
      );

      // Remove followee from follower's following list
      await this.followRepository.updateOne(
        { userId: followerId },
        { $pull: { following: followeeId } },
        { session }
      );

      await session.commitTransaction();

      this.logger.info("Follower removed successfully", {
        followeeId,
        followerId,
      });
    } catch (error) {
      this.logger.error("Failed to remove follower", {
        error,
        followeeId,
        followerId,
      });

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to remove follower");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  public async fetchUserGroups(
    userId: Types.ObjectId
  ): Promise<UserGroupsResponse> {
    try {
      const groups = await this.userGroupsRepository.getUserGroupsWithDetails(
        userId
      );

      this.logger.info("User groups fetched successfully", {
        userId: userId.toString(),
        groupCount: groups.length,
      });

      return {
        userId: userId.toString(),
        groups,
      };
    } catch (error) {
      this.logger.error("Failed to fetch user groups", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: userId.toString(),
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to fetch user groups");
      }
    }
  }

  // Cursor-based pagination methods
  async getFollowStats(userId: Types.ObjectId): Promise<FollowStatsResponse> {
    try {
      const [followersCount, followingCount] = await Promise.all([
        this.followRepository.getFollowersCount(userId),
        this.followRepository.getFollowingCount(userId),
      ]);

      this.logger.info("Follow stats retrieved", {
        userId,
        followersCount,
        followingCount,
      });

      return {
        userId: userId.toString(),
        followersCount,
        followingCount,
      };
    } catch (error) {
      this.logger.error("Failed to get follow stats", { error, userId });
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to get follow stats");
      }
    }
  }

  async getFollowers(
    userId: Types.ObjectId,
    pagination: CursorPaginationRequest
  ): Promise<FollowersResponse> {
    try {
      const { limit, cursor } = pagination;

      const result = await this.followRepository.getFollowersPaginated(
        userId,
        limit,
        cursor
      );

      this.logger.info("Followers retrieved", {
        userId,
        count: result.users.length,
        hasNextPage: result.hasNextPage,
      });

      return {
        data: result.users,
        pagination: {
          hasNextPage: result.hasNextPage,
          hasPreviousPage: !!cursor,
          nextCursor: result.nextCursor,
          previousCursor: cursor,
        },
      };
    } catch (error) {
      this.logger.error("Failed to get followers", { error, userId });
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to get followers");
      }
    }
  }

  async getFollowing(
    userId: Types.ObjectId,
    pagination: CursorPaginationRequest
  ): Promise<FollowingResponse> {
    try {
      const { limit, cursor } = pagination;

      const result = await this.followRepository.getFollowingPaginated(
        userId,
        limit,
        cursor
      );

      this.logger.info("Following retrieved", {
        userId,
        count: result.users.length,
        hasNextPage: result.hasNextPage,
      });

      return {
        data: result.users,
        pagination: {
          hasNextPage: result.hasNextPage,
          hasPreviousPage: !!cursor,
          nextCursor: result.nextCursor,
          previousCursor: cursor,
        },
      };
    } catch (error) {
      this.logger.error("Failed to get following", { error, userId });
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to get following");
      }
    }
  }

  async searchFollowers(
    userId: Types.ObjectId,
    searchTerm: string,
    pagination: CursorPaginationRequest
  ): Promise<FollowSearchResponse> {
    try {
      const { limit, cursor } = pagination;

      const result = await this.followRepository.searchFollowers(
        userId,
        searchTerm,
        limit,
        cursor
      );

      this.logger.info("Followers search completed", {
        userId,
        searchTerm,
        count: result.users.length,
        hasNextPage: result.hasNextPage,
      });

      return {
        data: result.users,
        pagination: {
          hasNextPage: result.hasNextPage,
          hasPreviousPage: !!cursor,
          nextCursor: result.nextCursor,
          previousCursor: cursor,
        },
      };
    } catch (error) {
      this.logger.error("Failed to search followers", {
        error,
        userId,
        searchTerm,
      });
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to search followers");
      }
    }
  }

  async searchFollowing(
    userId: Types.ObjectId,
    searchTerm: string,
    pagination: CursorPaginationRequest
  ): Promise<FollowSearchResponse> {
    try {
      const { limit, cursor } = pagination;

      const result = await this.followRepository.searchFollowing(
        userId,
        searchTerm,
        limit,
        cursor
      );

      this.logger.info("Following search completed", {
        userId,
        searchTerm,
        count: result.users.length,
        hasNextPage: result.hasNextPage,
      });

      return {
        data: result.users,
        pagination: {
          hasNextPage: result.hasNextPage,
          hasPreviousPage: !!cursor,
          nextCursor: result.nextCursor,
          previousCursor: cursor,
        },
      };
    } catch (error) {
      this.logger.error("Failed to search following", {
        error,
        userId,
        searchTerm,
      });
      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to search following");
      }
    }
  }
}
