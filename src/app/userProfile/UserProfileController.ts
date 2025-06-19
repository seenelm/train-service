import { IUserProfileService } from "./UserProfileService.js";
import { NextFunction, Request, Response } from "express";
import { UserProfileRequest } from "@seenelm/train-core";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { CustomSectionRequest } from "@seenelm/train-core";
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
}
