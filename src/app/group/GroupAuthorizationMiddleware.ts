import { Request, Response, NextFunction } from "express";
import { APIError } from "../../common/errors/APIError.js";
import { Logger } from "../../common/logger.js";
import { IGroupRepository } from "../../infrastructure/database/repositories/group/GroupRepository.js";
import { Types } from "mongoose";
import { ProfileAccess } from "@seenelm/train-core";

export default class GroupAuthorizationMiddleware {
  private static logger = Logger.getInstance();

  public static checkGroupIsPublic = (groupRepository: IGroupRepository) => {
    return async (
      req: Request<{ groupId: string }>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const { groupId } = req.params;

        // Check if group exists and is public
        const group = await groupRepository.findById(
          new Types.ObjectId(groupId)
        );
        if (!group) {
          this.logger.warn("Group not found", { groupId });
          throw APIError.NotFound("Group not found");
        }

        if (group.getAccountType() !== ProfileAccess.Public) {
          this.logger.warn("Cannot join private group", { groupId });
          throw APIError.BadRequest("Cannot join private group");
        }

        // Pass the group to the next middleware/controller
        req.group = group;

        this.logger.info("Group is public, allowing join", { groupId });
        next();
      } catch (error) {
        next(error);
      }
    };
  };

  public static checkGroupIsPrivate = (groupRepository: IGroupRepository) => {
    return async (
      req: Request<{ groupId: string }>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const { groupId } = req.params;

        // Check if group exists and is private
        const group = await groupRepository.findById(
          new Types.ObjectId(groupId)
        );
        if (!group) {
          this.logger.warn("Group not found", { groupId });
          throw APIError.NotFound("Group not found");
        }

        if (group.getAccountType() !== ProfileAccess.Private) {
          this.logger.warn("Cannot request to join public group", { groupId });
          throw APIError.BadRequest("Cannot request to join public group");
        }

        // Pass the group to the next middleware/controller
        req.group = group;

        this.logger.info("Group is private, allowing join request", {
          groupId,
        });
        next();
      } catch (error) {
        next(error);
      }
    };
  };

  public static checkUserIsOwner = (groupRepository: IGroupRepository) => {
    return async (
      req: Request<{ groupId: string }>,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const { groupId } = req.params;
        const userId = req.user?.getId();

        if (!userId) {
          this.logger.warn("User not authenticated", { groupId });
          throw APIError.BadRequest("User not authenticated");
        }

        // Check if group exists and user is an owner
        const group = await groupRepository.findById(
          new Types.ObjectId(groupId)
        );
        if (!group) {
          this.logger.warn("Group not found", { groupId });
          throw APIError.NotFound("Group not found");
        }

        const isOwner = group.getOwners().some((id) => id.equals(userId));
        if (!isOwner) {
          this.logger.warn("User is not an owner of this group", {
            groupId,
            userId,
          });
          throw APIError.Forbidden("Only group owners can perform this action");
        }

        // Pass the group to the next middleware/controller
        req.group = group;

        this.logger.info("User is owner, allowing action", {
          groupId,
          userId,
        });
        next();
      } catch (error) {
        next(error);
      }
    };
  };
}
