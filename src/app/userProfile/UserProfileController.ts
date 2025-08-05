import { IUserProfileService } from "./UserProfileService.js";
import { NextFunction, Request, Response } from "express";
import { UserProfileRequest } from "@seenelm/train-core";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { APIError } from "../../common/errors/APIError.js";
import {
  CustomSectionRequest,
  CustomSectionType,
  BasicUserProfileInfoRequest,
} from "@seenelm/train-core";
import { Types } from "mongoose";

export default class UserProfileController {
  private userProfileService: IUserProfileService;

  constructor(userProfileService: IUserProfileService) {
    this.userProfileService = userProfileService;
  }

  public updateUserProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userProfileRequest: UserProfileRequest = req.body;
      await this.userProfileService.updateUserProfile(userProfileRequest);

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public updateBasicUserProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const basicProfileRequest: BasicUserProfileInfoRequest = req.body;
      const userId = new Types.ObjectId(req.params.userId);

      await this.userProfileService.updateBasicUserProfileInfo(
        userId,
        basicProfileRequest
      );

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public getCustomSections = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params;

      const customSections = await this.userProfileService.getCustomSections(
        new Types.ObjectId(userId)
      );

      res.status(HttpStatusCode.OK).json(customSections);
    } catch (error) {
      next(error);
    }
  };

  public createCustomSection = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params;
      const section: CustomSectionRequest = req.body;

      await this.userProfileService.createCustomSection(
        new Types.ObjectId(userId),
        section
      );

      res.status(HttpStatusCode.CREATED).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public updateCustomSection = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params;
      const customSectionRequest: CustomSectionRequest = req.body;

      await this.userProfileService.updateCustomSection(
        new Types.ObjectId(userId),
        customSectionRequest
      );

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public deleteCustomSection = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId, sectionTitle } = req.params;

      await this.userProfileService.deleteCustomSection(
        new Types.ObjectId(userId),
        sectionTitle as CustomSectionType
      );

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public followUser = async (
    req: Request<{ followeeId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { followeeId } = req.params;
      const followerId = req.user?.getId();

      if (!followerId) {
        throw APIError.BadRequest("User not authenticated");
      }

      await this.userProfileService.followUser(
        followerId,
        new Types.ObjectId(followeeId)
      );

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public requestToFollowUser = async (
    req: Request<{ followeeId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { followeeId } = req.params;
      const followerId = req.user?.getId();

      if (!followerId) {
        throw APIError.BadRequest("User not authenticated");
      }

      await this.userProfileService.requestToFollowUser(
        followerId,
        new Types.ObjectId(followeeId)
      );

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Follow request sent successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public acceptFollowRequest = async (
    req: Request<{ followerId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { followerId } = req.params;
      const followeeId = req.user?.getId();

      if (!followeeId) {
        throw APIError.BadRequest("User not authenticated");
      }

      await this.userProfileService.acceptFollowRequest(
        followeeId,
        new Types.ObjectId(followerId)
      );

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Follow request accepted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public rejectFollowRequest = async (
    req: Request<{ followerId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { followerId } = req.params;
      const followeeId = req.user?.getId();

      if (!followeeId) {
        throw APIError.BadRequest("User not authenticated");
      }

      await this.userProfileService.rejectFollowRequest(
        followeeId,
        new Types.ObjectId(followerId)
      );

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Follow request rejected successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public unfollowUser = async (
    req: Request<{ followeeId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { followeeId } = req.params;
      const followerId = req.user?.getId();

      if (!followerId) {
        throw APIError.BadRequest("User not authenticated");
      }

      await this.userProfileService.unfollowUser(
        followerId,
        new Types.ObjectId(followeeId)
      );

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "User unfollowed successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public removeFollower = async (
    req: Request<{ followerId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { followerId } = req.params;
      const followeeId = req.user?.getId();

      if (!followeeId) {
        throw APIError.BadRequest("User not authenticated");
      }

      await this.userProfileService.removeFollower(
        followeeId,
        new Types.ObjectId(followerId)
      );

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: "Follower removed successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public fetchUserGroups = async (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params;

      const userGroups = await this.userProfileService.fetchUserGroups(
        new Types.ObjectId(userId)
      );

      res.status(HttpStatusCode.OK).json(userGroups);
    } catch (error) {
      next(error);
    }
  };
}
