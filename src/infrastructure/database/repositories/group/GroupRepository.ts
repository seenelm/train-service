import { GroupDocument } from "../../models/group/groupModel.js";
import Group from "../../entity/group/Group.js";
import { IBaseRepository, BaseRepository } from "../BaseRepository.js";
import { Model, Types } from "mongoose";
import { ProfileAccess } from "@seenelm/train-core";
import { GroupResponse } from "../../../../app/group/groupDto.js";

export interface IGroupRepository
  extends IBaseRepository<Group, GroupDocument> {
  toDocument(
    groupName: string,
    bio: string,
    owners: Types.ObjectId[],
    members: Types.ObjectId[],
    requests: Types.ObjectId[],
    accountType: ProfileAccess
  ): Partial<GroupDocument>;

  toDocumentFromEntity(group: Group): Partial<GroupDocument>;

  toResponse(group: Group): GroupResponse;
}

export default class GroupRepository
  extends BaseRepository<Group, GroupDocument>
  implements IGroupRepository
{
  private groupModel: Model<GroupDocument>;

  constructor(groupModel: Model<GroupDocument>) {
    super(groupModel);
    this.groupModel = groupModel;
  }

  toDocument(
    groupName: string,
    bio: string,
    owners: Types.ObjectId[],
    members: Types.ObjectId[],
    requests: Types.ObjectId[],
    accountType: ProfileAccess
  ): Partial<GroupDocument> {
    return {
      groupName,
      bio,
      owners,
      members,
      requests,
      accountType,
    };
  }

  toDocumentFromEntity(group: Group): Partial<GroupDocument> {
    return {
      groupName: group.getGroupName(),
      bio: group.getBio(),
      owners: group.getOwners(),
      members: group.getMembers(),
      requests: group.getRequests(),
      accountType: group.getAccountType(),
    };
  }

  toEntity(doc: GroupDocument): Group {
    return Group.builder()
      .setId(doc._id as Types.ObjectId)
      .setGroupName(doc.groupName)
      .setBio(doc.bio)
      .setOwners(doc.owners)
      .setMembers(doc.members)
      .setRequests(doc.requests)
      .setAccountType(doc.accountType)
      .build();
  }

  toResponse(group: Group): GroupResponse {
    return {
      id: group.getId().toString(),
      groupName: group.getGroupName(),
      bio: group.getBio(),
      owners: group.getOwners().map((id) => id.toString()),
      members: group.getMembers().map((id) => id.toString()),
      requests: group.getRequests().map((id) => id.toString()),
      accountType: group.getAccountType(),
    };
  }
}
