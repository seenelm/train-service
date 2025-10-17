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
import {
  followUserSchema,
  requestToFollowUserSchema,
  acceptFollowRequestSchema,
  rejectFollowRequestSchema,
  unfollowUserSchema,
  removeFollowerSchema,
  cursorPaginationSchema,
  searchWithCursorSchema,
  userProfileRequestSchema,
} from "./UserProfileSchema.js";
import { ValidationErrorResponse } from "../../common/errors/ValidationErrorResponse.js";
import { z } from "zod";
import { StatusCodes as HttpStatusCode } from "http-status-codes";

export default class UserProfileMiddleware {
  private static logger = Logger.getInstance();

  static validateUserProfileRequest = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = userProfileRequestSchema.safeParse(req.body);
      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          message: "User profile request validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }

      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };

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

  public static validateFollowUser = (
    req: Request<{ followeeId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = followUserSchema.safeParse({
        params: req.params,
      });

      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );

        return res.status(400).json({
          message: "Follow user validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }

      // Check if user is trying to follow themselves
      if (req.user?.getId().toString() === req.params.followeeId) {
        return res.status(400).json({
          message: "Follow user validation failed",
          errors: [
            {
              field: "followeeId",
              message: "Cannot follow yourself",
            },
          ],
        });
      }

      this.logger.info("Follow user validation successful");
      next();
    } catch (error) {
      next(error);
    }
  };

  public static validateRequestToFollowUser = (
    req: Request<{ followeeId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = requestToFollowUserSchema.safeParse({
        params: req.params,
      });

      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );

        return res.status(400).json({
          message: "Request to follow validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }

      // Check if user is trying to request to follow themselves
      if (req.user?.getId().toString() === req.params.followeeId) {
        return res.status(400).json({
          message: "Request to follow validation failed",
          errors: [
            {
              field: "followeeId",
              message: "Cannot request to follow yourself",
            },
          ],
        });
      }

      this.logger.info("Request to follow validation successful");
      next();
    } catch (error) {
      next(error);
    }
  };

  public static validateAcceptFollowRequest = (
    req: Request<{ followerId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = acceptFollowRequestSchema.safeParse({
        params: req.params,
      });

      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );

        return res.status(400).json({
          message: "Accept follow request validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }

      // Check if user is trying to accept their own request
      if (req.user?.getId().toString() === req.params.followerId) {
        return res.status(400).json({
          message: "Accept follow request validation failed",
          errors: [
            {
              field: "followerId",
              message: "Cannot accept your own follow request",
            },
          ],
        });
      }

      this.logger.info("Accept follow request validation successful");
      next();
    } catch (error) {
      next(error);
    }
  };

  public static validateRejectFollowRequest = (
    req: Request<{ followerId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = rejectFollowRequestSchema.safeParse({
        params: req.params,
      });

      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );

        return res.status(400).json({
          message: "Reject follow request validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }

      // Check if user is trying to reject their own request
      if (req.user?.getId().toString() === req.params.followerId) {
        return res.status(400).json({
          message: "Reject follow request validation failed",
          errors: [
            {
              field: "followerId",
              message: "Cannot reject your own follow request",
            },
          ],
        });
      }

      this.logger.info("Reject follow request validation successful");
      next();
    } catch (error) {
      next(error);
    }
  };

  public static validateUnfollowUser = (
    req: Request<{ followeeId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = unfollowUserSchema.safeParse({
        params: req.params,
      });

      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );

        return res.status(400).json({
          message: "Unfollow user validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }

      // Check if user is trying to unfollow themselves
      if (req.user?.getId().toString() === req.params.followeeId) {
        return res.status(400).json({
          message: "Unfollow user validation failed",
          errors: [
            {
              field: "followeeId",
              message: "Cannot unfollow yourself",
            },
          ],
        });
      }

      this.logger.info("Unfollow user validation successful");
      next();
    } catch (error) {
      next(error);
    }
  };

  public static validateRemoveFollower = (
    req: Request<{ followerId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = removeFollowerSchema.safeParse({
        params: req.params,
      });

      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );

        return res.status(400).json({
          message: "Remove follower validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }

      // Check if user is trying to remove themselves as a follower
      if (req.user?.getId().toString() === req.params.followerId) {
        return res.status(400).json({
          message: "Remove follower validation failed",
          errors: [
            {
              field: "followerId",
              message: "Cannot remove yourself as a follower",
            },
          ],
        });
      }

      this.logger.info("Remove follower validation successful");
      next();
    } catch (error) {
      next(error);
    }
  };

  static validateCursorPagination = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validatedData = cursorPaginationSchema.parse(req.query);
      // Store validated data in req.body for controller access
      (req as any).validatedPagination = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage =
          (error as any).errors[0]?.message || "Invalid pagination parameters";
        next(APIError.BadRequest(errorMessage));
      } else {
        next(APIError.BadRequest("Invalid pagination parameters"));
      }
    }
  };

  static validateSearchWithCursor = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validatedData = searchWithCursorSchema.parse(req.query);
      // Store validated data in req.body for controller access
      (req as any).validatedSearch = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage =
          (error as any).errors[0]?.message || "Invalid search parameters";
        next(APIError.BadRequest(errorMessage));
      } else {
        next(APIError.BadRequest("Invalid search parameters"));
      }
    }
  };
}
