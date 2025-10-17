import { UserGroupsDocument } from "../../models/user/userGroupsModel.js";
import { IBaseRepository, BaseRepository } from "../BaseRepository.js";
import { Model, Types } from "mongoose";
import UserGroups from "../../entity/user/UserGroups.js";
import { GroupResponse } from "@seenelm/train-core";

export interface IUserGroupsRepository
  extends IBaseRepository<UserGroups, UserGroupsDocument> {
  getUserGroupsWithDetails(userId: Types.ObjectId): Promise<GroupResponse[]>;
}

export default class UserGroupsRepository
  extends BaseRepository<UserGroups, UserGroupsDocument>
  implements IUserGroupsRepository
{
  private userGroupsModel: Model<UserGroupsDocument>;

  constructor(userGroupsModel: Model<UserGroupsDocument>) {
    super(userGroupsModel);
    this.userGroupsModel = userGroupsModel;
  }

  toEntity(doc: UserGroupsDocument): UserGroups {
    return UserGroups.builder()
      .setId(doc._id as Types.ObjectId)
      .setUserId(doc.userId as Types.ObjectId)
      .setGroups(doc.groups as Types.ObjectId[])
      .setCreatedAt(doc.createdAt)
      .setUpdatedAt(doc.updatedAt)
      .build();
  }

  public async getUserGroupsWithDetails(
    userId: Types.ObjectId
  ): Promise<GroupResponse[]> {
    try {
      // First check if user groups document exists
      const userGroupsDoc = await this.userGroupsModel
        .findOne({ userId })
        .exec();
      if (!userGroupsDoc) {
        return []; // Return empty array if no user groups document exists
      }

      // Aggregation pipeline to join UserGroups with Groups in a single query
      const pipeline: any[] = [
        {
          $match: { userId },
        },
        {
          $unwind: "$groups", // Deconstruct the groups array
        },
        {
          $lookup: {
            from: "groups", // Collection name for groups
            localField: "groups",
            foreignField: "_id",
            as: "groupDetails",
          },
        },
        {
          $unwind: "$groupDetails", // Unwind the groupDetails array
        },
        {
          $replaceRoot: { newRoot: "$groupDetails" }, // Replace root with group details
        },
        {
          $sort: { name: 1 }, // Sort by group name
        },
      ];

      const groupDocs = await this.userGroupsModel.aggregate(pipeline).exec();

      // Convert to GroupResponse format
      return groupDocs.map((doc) => ({
        id: doc._id.toString(),
        name: doc.name,
        description: doc.description || "",
        location: doc.location || "",
        tags: doc.tags || [],
        owners: doc.owners?.map((id: any) => id.toString()) || [],
        members: doc.members?.map((id: any) => id.toString()) || [],
        requests: doc.requests?.map((id: any) => id.toString()) || [],
        accountType: doc.accountType,
      }));
    } catch (error) {
      throw error;
    }
  }
}
