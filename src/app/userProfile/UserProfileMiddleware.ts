import {
  CustomSectionRequest,
  CustomSectionType,
  BasicUserProfileInfoRequest,
} from "@seenelm/train-core";
import { NextFunction, Request, Response } from "express";
import { APIError } from "../../common/errors/APIError.js";
import { CreateValidator } from "../../common/utils/requestValidation.js";
import UserProfileRequestRules from "./UserProfileRequestRules.js";
import { Logger } from "../../common/logger.js";

export default class UserProfileMiddleware {
  private static logger = Logger.getInstance();

  public static validateBasicProfileUpdate = (
    req: Request<{ userId: string }, {}, BasicUserProfileInfoRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const errors = CreateValidator.validate(
        req,
        UserProfileRequestRules.basicProfileUpdateRules
      );

      if (errors.length > 0) {
        throw APIError.BadRequest("Validation failed", errors);
      }

      this.logger.info("Basic profile update validation successful");
      next();
    } catch (error) {
      next(error);
    }
  };

  public static validateGetCustomSections = (
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const errors = CreateValidator.validate(
        req,
        UserProfileRequestRules.getCustomSectionsRules
      );

      if (errors.length > 0) {
        throw APIError.BadRequest("Validation failed", errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  public static validateCreateCustomSection = (
    req: Request<{ userId: string }, {}, CustomSectionRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const errors = CreateValidator.validate(
        req,
        UserProfileRequestRules.customSectionRules
      );

      if (errors.length > 0) {
        throw APIError.BadRequest("Validation failed", errors);
      }

      this.logger.info("Custom section validation successful");
      next();
    } catch (error) {
      console.log("ValidateCreateCustomSection error", error);
      next(error);
    }
  };

  public static validateUpdateCustomSection = (
    req: Request<{ userId: string }, {}, CustomSectionRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const errors = CreateValidator.validate(
        req,
        UserProfileRequestRules.customSectionRules
      );

      if (errors.length > 0) {
        throw APIError.BadRequest("Validation failed", errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  public static validateDeleteCustomSection = (
    req: Request<{ userId: string; sectionTitle: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const errors = CreateValidator.validate(
        req,
        UserProfileRequestRules.deleteCustomSectionRules
      );

      if (errors.length > 0) {
        throw APIError.BadRequest("Validation failed", errors);
      }

      this.logger.info("Delete custom section validation successful");
      next();
    } catch (error) {
      console.log("ValidateDeleteCustomSection error", error);
      next(error);
    }
  };
}
