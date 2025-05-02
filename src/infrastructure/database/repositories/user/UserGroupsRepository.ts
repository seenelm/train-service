import { UserGroupsDocument } from "../../models/user/userGroupsModel.js";
import { IBaseRepository } from "../BaseRepository.js";
import BaseRepository from "../BaseRepository.js";
import { Model, Types } from "mongoose";
import UserGroups from "../../entity/user/UserGroups.js";

export interface IUserGroupsRepository
  extends IBaseRepository<UserGroups, UserGroupsDocument> {}

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
}
