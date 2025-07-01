import { IUserProfileService } from "./UserProfileService.js";
import { NextFunction, Request, Response } from "express";
import { UserProfileRequest } from "@seenelm/train-core";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
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
}
