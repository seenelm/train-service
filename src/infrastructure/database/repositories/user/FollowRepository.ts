import { FollowDocument } from "../../models/user/followModel.js";
import Follow from "../../entity/user/Follow.js";
import { IBaseRepository, BaseRepository } from "../BaseRepository.js";
import { Model, Types } from "mongoose";
import { FollowUserInfo } from "../../../../app/userProfile/followDto.js";
import { CursorUtils } from "../../../../common/utils/cursorUtils.js";
import { IUserProfileRepository } from "./UserProfileRepository.js";

export interface IFollowRepository
  extends IBaseRepository<Follow, FollowDocument> {
  // Fast count queries
  getFollowersCount(userId: Types.ObjectId): Promise<number>;
  getFollowingCount(userId: Types.ObjectId): Promise<number>;

  // Cursor-based pagination
  getFollowersPaginated(
    userId: Types.ObjectId,
    limit: number,
    cursor?: string
  ): Promise<{
    users: FollowUserInfo[];
    nextCursor?: string;
    hasNextPage: boolean;
  }>;

  getFollowingPaginated(
    userId: Types.ObjectId,
    limit: number,
    cursor?: string
  ): Promise<{
    users: FollowUserInfo[];
    nextCursor?: string;
    hasNextPage: boolean;
  }>;

  // Search within followers/following
  searchFollowers(
    userId: Types.ObjectId,
    searchTerm: string,
    limit: number,
    cursor?: string
  ): Promise<{
    users: FollowUserInfo[];
    nextCursor?: string;
    hasNextPage: boolean;
  }>;

  searchFollowing(
    userId: Types.ObjectId,
    searchTerm: string,
    limit: number,
    cursor?: string
  ): Promise<{
    users: FollowUserInfo[];
    nextCursor?: string;
    hasNextPage: boolean;
  }>;
}

export default class FollowRepository
  extends BaseRepository<Follow, FollowDocument>
  implements IFollowRepository
{
  private followModel: Model<FollowDocument>;

  constructor(followModel: Model<FollowDocument>) {
    super(followModel);
    this.followModel = followModel;
  }

  toEntity(doc: FollowDocument): Follow {
    return Follow.builder()
      .setId(doc._id as Types.ObjectId)
      .setUserId(doc.userId as Types.ObjectId)
      .setFollowing(doc.following as Types.ObjectId[])
      .setFollowers(doc.followers as Types.ObjectId[])
      .setRequests(doc.requests as Types.ObjectId[])
      .setCreatedAt(doc.createdAt)
      .setUpdatedAt(doc.updatedAt)
      .build();
  }

  async getFollowersCount(userId: Types.ObjectId): Promise<number> {
    const follow = await this.findOne({ userId });
    return follow ? follow.getFollowers().length : 0;
  }

  async getFollowingCount(userId: Types.ObjectId): Promise<number> {
    const follow = await this.findOne({ userId });
    return follow ? follow.getFollowing().length : 0;
  }

  async getFollowersPaginated(
    userId: Types.ObjectId,
    limit: number,
    cursor?: string
  ): Promise<{
    users: FollowUserInfo[];
    nextCursor?: string;
    hasNextPage: boolean;
  }> {
    try {
      // Build aggregation pipeline for followers with user profile data
      const pipeline: any[] = [
        { $match: { userId } },
        {
          $lookup: {
            from: "users",
            localField: "followers",
            foreignField: "_id",
            as: "followerUsers",
          },
        },
        { $unwind: "$followerUsers" },
        {
          $lookup: {
            from: "userprofiles",
            localField: "followerUsers._id",
            foreignField: "userId",
            as: "followerProfiles",
          },
        },
        { $unwind: "$followerProfiles" },
        {
          $replaceRoot: { newRoot: "$followerProfiles" },
        },
        {
          $project: {
            _id: 1,
            username: 1,
            name: 1,
            profilePicture: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1, _id: 1 } },
      ];

      // Add cursor-based filtering if cursor provided
      if (cursor) {
        try {
          const decodedCursor = CursorUtils.decodeCursor(cursor);
          const cursorDate = new Date(decodedCursor.timestamp);
          const cursorUserId = new Types.ObjectId(decodedCursor.userId);

          pipeline.push({
            $match: {
              $or: [
                { createdAt: { $lt: cursorDate } },
                {
                  createdAt: cursorDate,
                  _id: { $lt: cursorUserId },
                },
              ],
            },
          });
        } catch (error) {
          // Invalid cursor, return empty result
          return { users: [], hasNextPage: false };
        }
      }

      // Add limit + 1 to check if there are more results
      pipeline.push({ $limit: limit + 1 });

      const results = await this.followModel.aggregate(pipeline);

      const hasNextPage = results.length > limit;
      const users = results.slice(0, limit).map((user: any) => ({
        userId: user._id.toString(),
        username: user.username,
        name: user.name,
        profilePicture: user.profilePicture,
      }));

      let nextCursor: string | undefined;
      if (hasNextPage && users.length > 0) {
        const lastUser = results[limit - 1];
        nextCursor = CursorUtils.createCursor(lastUser._id, lastUser.createdAt);
      }

      return {
        users,
        nextCursor,
        hasNextPage,
      };
    } catch (error) {
      console.error("Error in getFollowersPaginated:", error);
      return { users: [], hasNextPage: false };
    }
  }

  async getFollowingPaginated(
    userId: Types.ObjectId,
    limit: number,
    cursor?: string
  ): Promise<{
    users: FollowUserInfo[];
    nextCursor?: string;
    hasNextPage: boolean;
  }> {
    try {
      // Build aggregation pipeline for following with user profile data
      const pipeline: any[] = [
        { $match: { userId } },
        {
          $lookup: {
            from: "users",
            localField: "following",
            foreignField: "_id",
            as: "followingUsers",
          },
        },
        { $unwind: "$followingUsers" },
        {
          $lookup: {
            from: "userprofiles",
            localField: "followingUsers._id",
            foreignField: "userId",
            as: "followingProfiles",
          },
        },
        { $unwind: "$followingProfiles" },
        {
          $replaceRoot: { newRoot: "$followingProfiles" },
        },
        {
          $project: {
            _id: 1,
            username: 1,
            name: 1,
            profilePicture: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1, _id: 1 } },
      ];

      // Add cursor-based filtering if cursor provided
      if (cursor) {
        try {
          const decodedCursor = CursorUtils.decodeCursor(cursor);
          const cursorDate = new Date(decodedCursor.timestamp);
          const cursorUserId = new Types.ObjectId(decodedCursor.userId);

          pipeline.push({
            $match: {
              $or: [
                { createdAt: { $lt: cursorDate } },
                {
                  createdAt: cursorDate,
                  _id: { $lt: cursorUserId },
                },
              ],
            },
          });
        } catch (error) {
          // Invalid cursor, return empty result
          return { users: [], hasNextPage: false };
        }
      }

      // Add limit + 1 to check if there are more results
      pipeline.push({ $limit: limit + 1 });

      const results = await this.followModel.aggregate(pipeline);

      const hasNextPage = results.length > limit;
      const users = results.slice(0, limit).map((user: any) => ({
        userId: user._id.toString(),
        username: user.username,
        name: user.name,
        profilePicture: user.profilePicture,
      }));

      let nextCursor: string | undefined;
      if (hasNextPage && users.length > 0) {
        const lastUser = results[limit - 1];
        nextCursor = CursorUtils.createCursor(lastUser._id, lastUser.createdAt);
      }

      return {
        users,
        nextCursor,
        hasNextPage,
      };
    } catch (error) {
      console.error("Error in getFollowingPaginated:", error);
      return { users: [], hasNextPage: false };
    }
  }

  async searchFollowers(
    userId: Types.ObjectId,
    searchTerm: string,
    limit: number,
    cursor?: string
  ): Promise<{
    users: FollowUserInfo[];
    nextCursor?: string;
    hasNextPage: boolean;
  }> {
    try {
      // Build aggregation pipeline for searching followers
      const pipeline: any[] = [
        { $match: { userId } },
        {
          $lookup: {
            from: "users",
            localField: "followers",
            foreignField: "_id",
            as: "followerUsers",
          },
        },
        { $unwind: "$followerUsers" },
        {
          $lookup: {
            from: "userprofiles",
            localField: "followerUsers._id",
            foreignField: "userId",
            as: "followerProfiles",
          },
        },
        { $unwind: "$followerProfiles" },
        {
          $replaceRoot: { newRoot: "$followerProfiles" },
        },
        {
          $match: {
            $or: [
              { username: { $regex: searchTerm, $options: "i" } },
              { name: { $regex: searchTerm, $options: "i" } },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            username: 1,
            name: 1,
            profilePicture: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1, _id: 1 } },
      ];

      // Add cursor-based filtering if cursor provided
      if (cursor) {
        try {
          const decodedCursor = CursorUtils.decodeCursor(cursor);
          const cursorDate = new Date(decodedCursor.timestamp);
          const cursorUserId = new Types.ObjectId(decodedCursor.userId);

          pipeline.push({
            $match: {
              $or: [
                { createdAt: { $lt: cursorDate } },
                {
                  createdAt: cursorDate,
                  _id: { $lt: cursorUserId },
                },
              ],
            },
          });
        } catch (error) {
          // Invalid cursor, return empty result
          return { users: [], hasNextPage: false };
        }
      }

      // Add limit + 1 to check if there are more results
      pipeline.push({ $limit: limit + 1 });

      const results = await this.followModel.aggregate(pipeline);

      const hasNextPage = results.length > limit;
      const users = results.slice(0, limit).map((user: any) => ({
        userId: user._id.toString(),
        username: user.username,
        name: user.name,
        profilePicture: user.profilePicture,
      }));

      let nextCursor: string | undefined;
      if (hasNextPage && users.length > 0) {
        const lastUser = results[limit - 1];
        nextCursor = CursorUtils.createCursor(lastUser._id, lastUser.createdAt);
      }

      return {
        users,
        nextCursor,
        hasNextPage,
      };
    } catch (error) {
      console.error("Error in searchFollowers:", error);
      return { users: [], hasNextPage: false };
    }
  }

  async searchFollowing(
    userId: Types.ObjectId,
    searchTerm: string,
    limit: number,
    cursor?: string
  ): Promise<{
    users: FollowUserInfo[];
    nextCursor?: string;
    hasNextPage: boolean;
  }> {
    try {
      // Build aggregation pipeline for searching following
      const pipeline: any[] = [
        { $match: { userId } },
        {
          $lookup: {
            from: "users",
            localField: "following",
            foreignField: "_id",
            as: "followingUsers",
          },
        },
        { $unwind: "$followingUsers" },
        {
          $lookup: {
            from: "userprofiles",
            localField: "followingUsers._id",
            foreignField: "userId",
            as: "followingProfiles",
          },
        },
        { $unwind: "$followingProfiles" },
        {
          $replaceRoot: { newRoot: "$followingProfiles" },
        },
        {
          $match: {
            $or: [
              { username: { $regex: searchTerm, $options: "i" } },
              { name: { $regex: searchTerm, $options: "i" } },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            username: 1,
            name: 1,
            profilePicture: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1, _id: 1 } },
      ];

      // Add cursor-based filtering if cursor provided
      if (cursor) {
        try {
          const decodedCursor = CursorUtils.decodeCursor(cursor);
          const cursorDate = new Date(decodedCursor.timestamp);
          const cursorUserId = new Types.ObjectId(decodedCursor.userId);

          pipeline.push({
            $match: {
              $or: [
                { createdAt: { $lt: cursorDate } },
                {
                  createdAt: cursorDate,
                  _id: { $lt: cursorUserId },
                },
              ],
            },
          });
        } catch (error) {
          // Invalid cursor, return empty result
          return { users: [], hasNextPage: false };
        }
      }

      // Add limit + 1 to check if there are more results
      pipeline.push({ $limit: limit + 1 });

      const results = await this.followModel.aggregate(pipeline);

      const hasNextPage = results.length > limit;
      const users = results.slice(0, limit).map((user: any) => ({
        userId: user._id.toString(),
        username: user.username,
        name: user.name,
        profilePicture: user.profilePicture,
      }));

      let nextCursor: string | undefined;
      if (hasNextPage && users.length > 0) {
        const lastUser = results[limit - 1];
        nextCursor = CursorUtils.createCursor(lastUser._id, lastUser.createdAt);
      }

      return {
        users,
        nextCursor,
        hasNextPage,
      };
    } catch (error) {
      console.error("Error in searchFollowing:", error);
      return { users: [], hasNextPage: false };
    }
  }
}
