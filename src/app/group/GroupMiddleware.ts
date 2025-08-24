import { Request, Response, NextFunction } from "express";
import {
  groupProfileSchema,
  joinGroupSchema,
  requestToJoinGroupSchema,
  acceptJoinRequestSchema,
  rejectJoinGroupRequestSchema,
  leaveGroupSchema,
  removeMemberFromGroupSchema,
  deleteGroupSchema,
  updateGroupProfileSchema,
} from "./GroupSchema.js";
import { ValidationErrorResponse } from "../../common/errors/ValidationErrorResponse.js";
import { Logger } from "../../common/logger.js";

export default class GroupMiddleware {
  private static logger = Logger.getInstance();

  public static validateCreateGroup = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = groupProfileSchema.safeParse(req.body);

      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );

        return res.status(400).json({
          message: "Create group validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }

      this.logger.info("Create group validation successful");
      next();
    } catch (error) {
      next(error);
    }
  };

  public static validateJoinGroup = (
    req: Request<{ groupId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = joinGroupSchema.safeParse({
        params: req.params,
      });

      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );

        return res.status(400).json({
          message: "Join group validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }

      this.logger.info("Join group validation successful");
      next();
    } catch (error) {
      next(error);
    }
  };

  public static validateRequestToJoinGroup = (
    req: Request<{ groupId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = requestToJoinGroupSchema.safeParse({
        params: req.params,
      });

      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );

        return res.status(400).json({
          message: "Request to join group validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }

      this.logger.info("Request to join group validation successful");
      next();
    } catch (error) {
      next(error);
    }
  };

  public static validateAcceptJoinRequest = (
    req: Request<{ groupId: string; requesterId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = acceptJoinRequestSchema.safeParse({
        params: req.params,
      });

      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );

        return res.status(400).json({
          message: "Accept join request validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }

      this.logger.info("Accept join request validation successful");
      next();
    } catch (error) {
      next(error);
    }
  };

  public static validateRejectJoinGroupRequest = (
    req: Request<{ groupId: string; requesterId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = rejectJoinGroupRequestSchema.safeParse({
        params: req.params,
      });

      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );

        return res.status(400).json({
          message: "Reject join request validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }

      this.logger.info("Reject join request validation successful");
      next();
    } catch (error) {
      next(error);
    }
  };

  public static validateLeaveGroup = (
    req: Request<{ groupId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = leaveGroupSchema.safeParse({
        params: req.params,
      });

      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );

        return res.status(400).json({
          message: "Leave group validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }

      this.logger.info("Leave group validation successful");
      next();
    } catch (error) {
      next(error);
    }
  };

  public static validateRemoveMemberFromGroup = (
    req: Request<{ groupId: string; memberId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = removeMemberFromGroupSchema.safeParse({
        params: req.params,
      });

      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );

        return res.status(400).json({
          message: "Remove member from group validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }

      this.logger.info("Remove member from group validation successful");
      next();
    } catch (error) {
      next(error);
    }
  };

  public static validateDeleteGroup = (
    req: Request<{ groupId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = deleteGroupSchema.safeParse({
        params: req.params,
      });

      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );

        return res.status(400).json({
          message: "Delete group validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }

      this.logger.info("Delete group validation successful");
      next();
    } catch (error) {
      next(error);
    }
  };

  public static validateUpdateGroupProfile = (
    req: Request<{ groupId: string }, {}, any>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = updateGroupProfileSchema.safeParse({
        params: req.params,
        body: req.body,
      });

      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );

        return res.status(400).json({
          message: "Update group profile validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }

      this.logger.info("Update group profile validation successful");
      next();
    } catch (error) {
      next(error);
    }
  };
}
