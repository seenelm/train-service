import { IUserProfileService } from "./UserProfileService.js";
import { NextFunction, Request, Response } from "express";
import { UserProfileRequest } from "@seenelm/train-core";
import { StatusCodes as HttpStatusCode } from "http-status-codes";

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
}
