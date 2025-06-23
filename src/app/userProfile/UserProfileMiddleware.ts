import { CustomSectionRequest, CustomSectionType } from "@seenelm/train-core";
import { NextFunction, Request, Response } from "express";
import { APIError } from "../../common/errors/APIError.js";
import { CreateValidator } from "../../common/utils/requestValidation.js";
import UserProfileRequestRules from "./UserProfileRequestRules.js";
import { Logger } from "../../common/logger.js";

export default class UserProfileMiddleware {
  private static logger = Logger.getInstance();

  public static validateCreateCustomSection = (
    req: Request<{ userId: string }, {}, CustomSectionRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Log the incoming request for debugging
      this.logger.info("Validating custom section request", {
        userId: req.params.userId,
        requestBody: JSON.stringify(req.body)
      });

      // Check available CustomSectionType values
      this.logger.info("Available CustomSectionType values", {
        types: Object.values(CustomSectionType)
      });

      const errors = CreateValidator.validate(
        req,
        UserProfileRequestRules.createCustomSectionRules
      );

      if (errors.length > 0) {
        // Log detailed validation errors
        this.logger.error("Custom section validation failed", {
          errors,
          userId: req.params.userId,
          requestBody: JSON.stringify(req.body)
        });

        // Check specific validation issues and log them
        if (!req.params.userId) {
          this.logger.error("User ID is missing");
        } else if (!/^[0-9a-fA-F]{24}$/.test(req.params.userId)) {
          this.logger.error("Invalid user ID format", { userId: req.params.userId });
        }

        if (!req.body.title) {
          this.logger.error("Custom section title is missing");
        } else if (!Object.values(CustomSectionType).includes(req.body.title)) {
          this.logger.error("Invalid custom section title", { 
            providedTitle: req.body.title,
            validTitles: Object.values(CustomSectionType)
          });
        }

        if (!Array.isArray(req.body.details) || req.body.details.length === 0) {
          this.logger.error("Invalid details array", { details: req.body.details });
        } else {
          // Log details of each item in the array
          req.body.details.forEach((item, index) => {
            if (typeof item !== 'object') {
              this.logger.error(`Item at index ${index} is not an object`, { item });
            } else {
              this.logger.info(`Item at index ${index}`, { item });
            }
          });
        }

        throw APIError.BadRequest("Validation failed", errors);
      }

      this.logger.info("Custom section validation successful");
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
