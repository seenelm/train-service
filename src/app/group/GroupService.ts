import { IGroupRepository } from "../../infrastructure/database/repositories/group/GroupRepository.js";

import {
  CreateGroupRequest,
  GroupResponse,
  UpdateGroupProfileRequest,
} from "@seenelm/train-core";
import Group from "../../infrastructure/database/entity/group/Group.js";
import { APIError } from "../../common/errors/APIError.js";
import { MongooseError } from "mongoose";
import { MongoServerError } from "mongodb";
import { DatabaseError } from "../../common/errors/DatabaseError.js";
import { Logger } from "../../common/logger.js";
import { Types } from "mongoose";
import mongoose from "mongoose";
import { ProfileAccess } from "@seenelm/train-core";
import { IUserGroupsRepository } from "../../infrastructure/database/repositories/user/UserGroupsRepository.js";

export interface IGroupService {
  createGroup(
    createGroupRequest: CreateGroupRequest,
    creatorId: Types.ObjectId
  ): Promise<GroupResponse>;
  joinGroup(group: Group, userId: Types.ObjectId): Promise<void>;
  requestToJoinGroup(group: Group, userId: Types.ObjectId): Promise<void>;
  acceptJoinGroupRequest(
    group: Group,
    requesterId: Types.ObjectId,
    ownerId: Types.ObjectId
  ): Promise<void>;
  rejectJoinGroupRequest(
    group: Group,
    requesterId: Types.ObjectId,
    ownerId: Types.ObjectId
  ): Promise<void>;
  leaveGroup(groupId: Types.ObjectId, userId: Types.ObjectId): Promise<void>;
  removeMemberFromGroup(
    group: Group,
    memberId: Types.ObjectId,
    ownerId: Types.ObjectId
  ): Promise<void>;
  deleteGroup(group: Group, ownerId: Types.ObjectId): Promise<void>;
  updateGroupProfile(
    group: Group,
    updateRequest: UpdateGroupProfileRequest,
    ownerId: Types.ObjectId
  ): Promise<void>;
}

export default class GroupService implements IGroupService {
  private groupRepository: IGroupRepository;
  private userGroupsRepository: IUserGroupsRepository;
  private logger: Logger;

  constructor(
    groupRepository: IGroupRepository,
    userGroupsRepository: IUserGroupsRepository
  ) {
    this.groupRepository = groupRepository;
    this.userGroupsRepository = userGroupsRepository;
    this.logger = Logger.getInstance();
  }

  public async createGroup(
    createGroupRequest: CreateGroupRequest,
    creatorId: Types.ObjectId
  ): Promise<GroupResponse> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Create group document with creator as the only owner
      const groupDoc = this.groupRepository.toDocumentFromCreateRequest(
        createGroupRequest,
        creatorId
      );

      // Create the group
      const group = await this.groupRepository.create(groupDoc, { session });

      // Add the group to the creator's userGroups
      await this.userGroupsRepository.updateOne(
        { userId: creatorId },
        { $addToSet: { groups: group.getId() } },
        { session }
      );

      await session.commitTransaction();

      this.logger.info("Group created successfully", {
        groupId: group.getId(),
        groupName: group.getName(),
        creatorId,
      });

      return this.groupRepository.toResponse(group);
    } catch (error) {
      this.logger.error("Failed to create group", {
        error,
        createGroupRequest,
        creatorId,
      });

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to create group");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  public async joinGroup(group: Group, userId: Types.ObjectId): Promise<void> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Check if user is already a member or owner
      const isAlreadyMember = group
        .getMembers()
        .some((id) => id.equals(userId));
      const isAlreadyOwner = group.getOwners().some((id) => id.equals(userId));

      if (isAlreadyMember || isAlreadyOwner) {
        this.logger.warn("User is already part of this group", {
          groupId: group.getId(),
          userId,
        });
        throw APIError.Conflict("User is already part of this group");
      }

      // Add user to group's members list
      await this.groupRepository.updateOne(
        { _id: group.getId() },
        { $addToSet: { members: userId } },
        { session }
      );

      // Add group to user's groups list
      await this.userGroupsRepository.updateOne(
        { userId },
        { $addToSet: { groups: group.getId() } },
        { session }
      );

      await session.commitTransaction();

      this.logger.info("User joined group successfully", {
        groupId: group.getId(),
        userId,
      });
    } catch (error) {
      this.logger.error("Failed to join group", {
        error,
        groupId: group.getId(),
        userId,
      });

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to join group");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  public async requestToJoinGroup(
    group: Group,
    userId: Types.ObjectId
  ): Promise<void> {
    try {
      // Check if user is already a member or owner
      const isAlreadyMember = group
        .getMembers()
        .some((id) => id.equals(userId));
      const isAlreadyOwner = group.getOwners().some((id) => id.equals(userId));

      if (isAlreadyMember || isAlreadyOwner) {
        this.logger.warn("User is already part of this group", {
          groupId: group.getId(),
          userId,
        });
        throw APIError.Conflict("User is already part of this group");
      }

      // Check if user has already requested to join
      const hasAlreadyRequested = group
        .getRequests()
        .some((id) => id.equals(userId));
      if (hasAlreadyRequested) {
        this.logger.warn("User has already requested to join this group", {
          groupId: group.getId(),
          userId,
        });
        throw APIError.Conflict(
          "User has already requested to join this group"
        );
      }

      // Add user to group's requests list
      await this.groupRepository.updateOne(
        { _id: group.getId() },
        { $addToSet: { requests: userId } }
      );

      this.logger.info("Join request sent successfully", {
        groupId: group.getId(),
        userId,
      });
    } catch (error) {
      this.logger.error("Failed to send join request", {
        error,
        groupId: group.getId(),
        userId,
      });

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to send join request");
      }
    }
  }

  public async acceptJoinGroupRequest(
    group: Group,
    requesterId: Types.ObjectId,
    ownerId: Types.ObjectId
  ): Promise<void> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Check if the requester has a pending request
      const hasRequest = group
        .getRequests()
        .some((id) => id.equals(requesterId));
      if (!hasRequest) {
        this.logger.warn("User has no pending join request", {
          groupId: group.getId(),
          requesterId,
        });
        throw APIError.NotFound("User has no pending join request");
      }

      // Add user to group's members and remove from requests
      await this.groupRepository.updateOne(
        { _id: group.getId() },
        {
          $addToSet: { members: requesterId },
          $pull: { requests: requesterId },
        },
        { session }
      );

      // Add group to user's groups
      await this.userGroupsRepository.updateOne(
        { userId: requesterId },
        { $addToSet: { groups: group.getId() } },
        { session }
      );

      await session.commitTransaction();

      this.logger.info("Join request accepted successfully", {
        groupId: group.getId(),
        requesterId,
        ownerId,
      });
    } catch (error) {
      this.logger.error("Failed to accept join request", {
        error,
        groupId: group.getId(),
        requesterId,
        ownerId,
      });

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to accept join request");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  public async rejectJoinGroupRequest(
    group: Group,
    requesterId: Types.ObjectId,
    ownerId: Types.ObjectId
  ): Promise<void> {
    try {
      // Check if the requester has a pending request
      const hasRequest = group
        .getRequests()
        .some((id) => id.equals(requesterId));
      if (!hasRequest) {
        this.logger.warn("User has no pending join request", {
          groupId: group.getId(),
          requesterId,
        });
        throw APIError.NotFound("User has no pending join request");
      }

      // Remove user from group's requests
      await this.groupRepository.updateOne(
        { _id: group.getId() },
        { $pull: { requests: requesterId } }
      );

      this.logger.info("Join request rejected successfully", {
        groupId: group.getId(),
        requesterId,
        ownerId,
      });
    } catch (error) {
      this.logger.error("Failed to reject join request", {
        error,
        groupId: group.getId(),
        requesterId,
        ownerId,
      });

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to reject join request");
      }
    }
  }

  public async leaveGroup(
    groupId: Types.ObjectId,
    userId: Types.ObjectId
  ): Promise<void> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Check if group exists
      const group = await this.groupRepository.findById(groupId);
      if (!group) {
        this.logger.warn("Group not found", { groupId });
        throw APIError.NotFound("Group not found");
      }

      // Check if user is a member of the group
      const isMember = group.getMembers().some((id) => id.equals(userId));
      if (!isMember) {
        this.logger.warn("User is not a member of this group", {
          groupId: group.getId(),
          userId,
        });
        throw APIError.NotFound("User is not a member of this group");
      }

      // Check if user is an owner (owners cannot leave, they must transfer ownership or delete group)
      const isOwner = group.getOwners().some((id) => id.equals(userId));
      if (isOwner) {
        this.logger.warn("Group owners cannot leave the group", {
          groupId: group.getId(),
          userId,
        });
        throw APIError.BadRequest("Group owners cannot leave the group");
      }

      // Remove user from group's members
      await this.groupRepository.updateOne(
        { _id: group.getId() },
        { $pull: { members: userId } },
        { session }
      );

      // Remove group from user's groups
      await this.userGroupsRepository.updateOne(
        { userId },
        { $pull: { groups: group.getId() } },
        { session }
      );

      await session.commitTransaction();

      this.logger.info("User left group successfully", {
        groupId: group.getId(),
        userId,
      });
    } catch (error) {
      this.logger.error("Failed to leave group", {
        error,
        groupId,
        userId,
      });

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to leave group");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  public async removeMemberFromGroup(
    group: Group,
    memberId: Types.ObjectId,
    ownerId: Types.ObjectId
  ): Promise<void> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Check if the member is actually a member of the group
      const isMember = group.getMembers().some((id) => id.equals(memberId));
      if (!isMember) {
        this.logger.warn("User is not a member of this group", {
          groupId: group.getId(),
          memberId,
        });
        throw APIError.NotFound("User is not a member of this group");
      }

      // Check if trying to remove an owner (owners cannot be removed this way)
      const isOwnerBeingRemoved = group
        .getOwners()
        .some((id) => id.equals(memberId));
      if (isOwnerBeingRemoved) {
        this.logger.warn("Cannot remove group owner", {
          groupId: group.getId(),
          memberId,
        });
        throw APIError.BadRequest("Cannot remove group owner");
      }

      // Remove member from group's members
      await this.groupRepository.updateOne(
        { _id: group.getId() },
        { $pull: { members: memberId } },
        { session }
      );

      // Remove group from member's groups
      await this.userGroupsRepository.updateOne(
        { userId: memberId },
        { $pull: { groups: group.getId() } },
        { session }
      );

      await session.commitTransaction();

      this.logger.info("Member removed from group successfully", {
        groupId: group.getId(),
        memberId,
        ownerId,
      });
    } catch (error) {
      this.logger.error("Failed to remove member from group", {
        error,
        groupId: group.getId(),
        memberId,
        ownerId,
      });

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError(
          "Failed to remove member from group"
        );
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  public async deleteGroup(
    group: Group,
    ownerId: Types.ObjectId
  ): Promise<void> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Get all members and owners to remove the group from their userGroups
      const allGroupMembers = [...group.getMembers(), ...group.getOwners()];

      // Remove group from all members' and owners' userGroups
      if (allGroupMembers.length > 0) {
        await this.userGroupsRepository.updateMany(
          { userId: { $in: allGroupMembers } },
          { $pull: { groups: group.getId() } },
          { session }
        );
      }

      // Delete the group
      await this.groupRepository.findByIdAndDelete(group.getId(), { session });

      await session.commitTransaction();

      this.logger.info("Group deleted successfully", {
        groupId: group.getId(),
        groupName: group.getName(),
        ownerId,
        membersRemoved: allGroupMembers.length,
      });
    } catch (error) {
      this.logger.error("Failed to delete group", {
        error,
        groupId: group.getId(),
        ownerId,
      });

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to delete group");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  public async updateGroupProfile(
    group: Group,
    updateRequest: UpdateGroupProfileRequest,
    ownerId: Types.ObjectId
  ): Promise<void> {
    try {
      await this.groupRepository.updateOne(
        { _id: group.getId() },
        updateRequest
      );

      this.logger.info("Group profile updated successfully", {
        groupId: group.getId(),
        updateRequest,
      });
    } catch (error) {
      this.logger.error("Failed to update group profile", {
        error,
        groupId: group.getId(),
        ownerId,
      });

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to update group profile");
      }
    }
  }
}
