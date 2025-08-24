import { Request, Response, NextFunction } from "express";
import { IGroupService } from "./GroupService.js";
import { GroupRequest } from "@seenelm/train-core";
import { APIError } from "../../common/errors/APIError.js";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { Types } from "mongoose";

export default class GroupController {
  private groupService: IGroupService;

  constructor(groupService: IGroupService) {
    this.groupService = groupService;
  }

  public addGroup = async (
    req: Request<{}, {}, GroupRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupRequest: GroupRequest = req.body;
      const creatorId = req.user.getId();

      const groupResponse = await this.groupService.createGroup(
        groupRequest,
        creatorId
      );

      res.status(HttpStatusCode.CREATED).json(groupResponse);
    } catch (error) {
      next(error);
    }
  };

  public joinGroup = async (
    req: Request<{ groupId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.getId();

      if (!userId) {
        throw APIError.BadRequest("User not authenticated");
      }

      const group = req.group;

      await this.groupService.joinGroup(group, userId);

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public requestToJoinGroup = async (
    req: Request<{ groupId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.getId();

      if (!userId) {
        throw APIError.BadRequest("User not authenticated");
      }

      const group = req.group;

      await this.groupService.requestToJoinGroup(group, userId);

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public acceptJoinGroupRequest = async (
    req: Request<{ groupId: string; requesterId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { requesterId } = req.params;
      const ownerId = req.user.getId();

      const group = req.group;

      await this.groupService.acceptJoinGroupRequest(
        group,
        new Types.ObjectId(requesterId),
        ownerId
      );

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public rejectJoinGroupRequest = async (
    req: Request<{ groupId: string; requesterId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { requesterId } = req.params;
      const ownerId = req.user.getId();

      const group = req.group;

      await this.groupService.rejectJoinGroupRequest(
        group,
        new Types.ObjectId(requesterId),
        ownerId
      );

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public leaveGroup = async (
    req: Request<{ groupId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { groupId } = req.params;
      const userId = req.user.getId();

      await this.groupService.leaveGroup(new Types.ObjectId(groupId), userId);

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public removeMemberFromGroup = async (
    req: Request<{ groupId: string; memberId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { memberId } = req.params;
      const ownerId = req.user.getId();

      // Group is already validated and passed from middleware
      const group = req.group;

      await this.groupService.removeMemberFromGroup(
        group,
        new Types.ObjectId(memberId),
        ownerId
      );

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public deleteGroup = async (
    req: Request<{ groupId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const ownerId = req.user.getId();

      // Group is already validated and passed from middleware
      const group = req.group;

      await this.groupService.deleteGroup(group, ownerId);

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public updateGroupProfile = async (
    req: Request<{ groupId: string }, {}, GroupRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupRequest = req.body;
      const ownerId = req.user.getId();

      const group = req.group;

      await this.groupService.updateGroupProfile(group, groupRequest, ownerId);

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };
}
