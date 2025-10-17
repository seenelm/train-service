import { NextFunction, Request, Response } from "express";
import { APIError } from "../../common/errors/APIError.js";
import { Logger } from "../../common/logger.js";
import { Types } from "mongoose";
import { ProfileAccess } from "@seenelm/train-core";
import { ErrorMessage } from "../../common/enums.js";
import UserProfileRepository from "../../infrastructure/database/repositories/user/UserProfileRepository.js";
import { UserProfileModel } from "../../infrastructure/database/models/userProfile/userProfileModel.js";

export default class FollowMiddleware {
  private static logger = Logger.getInstance();
  private static userProfileRepository = new UserProfileRepository(
    UserProfileModel
  );

  public static checkAccountIsPublic = async (
    req: Request<{ followeeId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { followeeId } = req.params;

      // Get the followee's profile to check account type
      const followeeProfile = await this.userProfileRepository.findOne({
        userId: new Types.ObjectId(followeeId),
      });

      if (!followeeProfile) {
        this.logger.warn(ErrorMessage.FOLLOWEE_NOT_FOUND, { followeeId });
        throw APIError.NotFound(ErrorMessage.FOLLOWEE_NOT_FOUND);
      }

      // Check if the account is private
      if (followeeProfile.getAccountType() === ProfileAccess.Private) {
        this.logger.warn(ErrorMessage.PRIVATE_ACCOUNT_FOLLOW_REQUEST, {
          followeeId,
          accountType: followeeProfile.getAccountType(),
        });
        throw APIError.BadRequest(ErrorMessage.PRIVATE_ACCOUNT_FOLLOW_REQUEST);
      }

      this.logger.info("Account is public, allowing follow request");
      next();
    } catch (error) {
      next(error);
    }
  };

  public static checkAccountIsPrivate = async (
    req: Request<{ followeeId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { followeeId } = req.params;

      // Get the followee's profile to check account type
      const followeeProfile = await this.userProfileRepository.findOne({
        userId: new Types.ObjectId(followeeId),
      });

      if (!followeeProfile) {
        this.logger.warn(ErrorMessage.FOLLOWEE_NOT_FOUND, { followeeId });
        throw APIError.NotFound(ErrorMessage.FOLLOWEE_NOT_FOUND);
      }

      // Check if the account is private (required for follow request)
      if (followeeProfile.getAccountType() !== ProfileAccess.Private) {
        this.logger.warn("Cannot request to follow public account", {
          followeeId,
          accountType: followeeProfile.getAccountType(),
        });
        throw APIError.BadRequest("Cannot request to follow public account");
      }

      this.logger.info("Account is private, allowing follow request");
      next();
    } catch (error) {
      next(error);
    }
  };
}
