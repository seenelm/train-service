import { CustomSectionRequest, CustomSectionType } from "@seenelm/train-core";
import { NextFunction, Request, Response } from "express";
import { APIError } from "../../common/errors/APIError.js";
import { CreateValidator } from "../../common/utils/requestValidation.js";
import UserProfileRequestRules from "./UserProfileRequestRules.js";

export default class UserProfileMiddleware {
  public static validateCreateCustomSection = (
    req: Request<{ userId: string }, {}, CustomSectionRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const errors = CreateValidator.validate(
        req,
        UserProfileRequestRules.createCustomSectionRules
      );

      if (errors.length > 0) {
        throw APIError.BadRequest("Validation failed", errors);
      }

      next();
    } catch (error) {
      console.log("ValidateCreateCustomSection error", error);
      next(error);
    }
  };

  // public static validateUpdateCustomSection = (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) => {
  //   try {
  //     const { userId } = req.params;
  //     const section = req.body;

  //     // Validate userId parameter
  //     if (!userId) {
  //       throw APIError.BadRequest("User ID is required");
  //     }

  //     if (!Types.ObjectId.isValid(userId)) {
  //       throw APIError.BadRequest("Invalid user ID format");
  //     }

  //     // Validate request body
  //     if (!section || typeof section !== "object") {
  //       throw APIError.BadRequest(
  //         "Request body is required and must be an object"
  //       );
  //     }

  //     // Validate custom section
  //     if (!this.validateCustomSection(section)) {
  //       throw APIError.BadRequest("Invalid custom section format");
  //     }

  //     next();
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  // public static validateUpdateRequest = (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) => {
  //   try {
  //     const { customSections } = req.body;

  //     if (customSections) {
  //       if (!Array.isArray(customSections)) {
  //         throw APIError.BadRequest("Custom sections must be an array");
  //       }

  //       const invalidSections = customSections.filter(
  //         (section) => !this.validateCustomSection(section)
  //       );

  //       if (invalidSections.length > 0) {
  //         throw APIError.BadRequest(
  //           `Invalid custom section format: ${JSON.stringify(
  //             invalidSections[0]
  //           )}`
  //         );
  //       }
  //     }

  //     next();
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}
