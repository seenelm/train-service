import { GroupDocument } from "../../models/group/groupModel.js";
import Group from "../../entity/group/Group.js";
import { IBaseRepository, BaseRepository } from "../BaseRepository.js";
import { Model, Types } from "mongoose";
import { ProfileAccess } from "@seenelm/train-core";
import { GroupResponse, GroupRequest } from "@seenelm/train-core";

export interface IGroupRepository
  extends IBaseRepository<Group, GroupDocument> {
  toDocumentFromCreateRequest(
    request: GroupRequest,
    creatorId: Types.ObjectId
  ): Partial<GroupDocument>;

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

  toDocumentFromCreateRequest(
    request: GroupRequest,
    creatorId: Types.ObjectId
  ): Partial<GroupDocument> {
    return {
      name: request.name,
      description: request.description || "",
      location: request.location || "",
      tags: request.tags || [],
      accountType: request.accountType || ProfileAccess.Public,
      owners: [creatorId],
      members: [],
      requests: [],
    };
  }

  toEntity(doc: GroupDocument): Group {
    return Group.builder()
      .setId(doc._id as Types.ObjectId)
      .setName(doc.name)
      .setDescription(doc.description)
      .setLocation(doc.location)
      .setTags(doc.tags)
      .setOwners(doc.owners)
      .setMembers(doc.members)
      .setRequests(doc.requests)
      .setAccountType(doc.accountType)
      .build();
  }

  toResponse(group: Group): GroupResponse {
    return {
      id: group.getId().toString(),
      name: group.getName(),
      description: group.getDescription() || "",
      location: group.getLocation() || "",
      tags: group.getTags() || [],
      owners: group.getOwners().map((id) => id.toString()),
      members: group.getMembers().map((id) => id.toString()),
      requests: group.getRequests().map((id) => id.toString()),
      accountType: group.getAccountType(),
    };
  }
}
