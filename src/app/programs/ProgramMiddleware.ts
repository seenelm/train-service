import { Request, Response, NextFunction } from "express";
import {
  programRequestSchema,
  workoutRequestSchema,
  mealRequestSchema,
  workoutLogRequestSchema,
  blockLogSchema,
  mealLogRequestSchema,
  noteRequestSchema,
} from "./ProgramSchema.js";
import { Logger } from "../../common/logger.js";
import { ValidationErrorResponse } from "../../common/errors/ValidationErrorResponse.js";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { IProgramRepository } from "../../infrastructure/database/repositories/programs/ProgramRepository.js";
import { Types } from "mongoose";
import { APIError } from "../../common/errors/APIError.js";

export default class ProgramMiddleware {
  private logger: Logger;
  private programRepository: IProgramRepository;

  constructor(programRepository: IProgramRepository) {
    this.logger = Logger.getInstance();
    this.programRepository = programRepository;
  }

  static validateCreateProgram = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = programRequestSchema.safeParse(req.body);
      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          message: "Create program validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };

  static validateWorkoutRequest = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = workoutRequestSchema.safeParse(req.body);
      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          message: "Create workout validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };

  static validateWorkoutLogRequest = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = workoutLogRequestSchema.safeParse(req.body);
      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          message: "Workout log validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };

  static validateMealRequest = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = mealRequestSchema.safeParse(req.body);
      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          message: "Create meal validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };

  static validateMealLogRequest = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = mealLogRequestSchema.safeParse(req.body);
      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          message: "Meal log validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };

  static validateNoteRequest = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = noteRequestSchema.safeParse(req.body);
      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          message: "Note validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };

  public checkAdminAuthorization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const programId = req.params.programId;
      const userId = req.user.getId();

      if (!programId) {
        throw APIError.BadRequest("Program ID is required");
      }

      const program = await this.programRepository.findById(
        new Types.ObjectId(programId)
      );

      if (!program) {
        throw APIError.NotFound("Program not found");
      }

      const isAdmin = program
        .getAdmins()
        .some((adminId) => adminId.equals(new Types.ObjectId(userId)));

      if (!isAdmin) {
        // TODO: Should log this error. Should not return this to client.
        throw APIError.Forbidden(
          "Access denied. Only program administrators can perform this action",
          {
            programId,
            userId,
          }
        );
      }

      this.logger.info("Admin authorization successful", {
        programId,
        userId,
      });

      req.program = program;
      next();
    } catch (error) {
      this.logger.error("Admin authorization failed", {
        programId: req.params.programId,
        userId: req.user.getId().toString(),
        error: error instanceof Error ? error.message : error,
      });
      next(error);
    }
  };

  public checkMemberOrAdminAuthorization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const programId = req.params.programId;
      const userId = req.user.getId();

      if (!programId) {
        throw APIError.BadRequest("Program ID is required");
      }

      const program = await this.programRepository.findById(
        new Types.ObjectId(programId)
      );

      if (!program) {
        throw APIError.NotFound("Program not found");
      }

      const userIdObj = new Types.ObjectId(userId);

      // Check if user is an admin
      const isAdmin = program
        .getAdmins()
        .some((adminId) => adminId.equals(userIdObj));

      // Check if user is a member
      const isMember =
        program.getMembers()?.some((memberId) => memberId.equals(userIdObj)) ||
        false;

      if (!isAdmin && !isMember) {
        this.logger.warn("Access denied: User is neither admin nor member", {
          programId,
          userId,
          isAdmin,
          isMember,
        });
        throw APIError.Forbidden(
          "Access denied. Only program administrators or members can access this resource",
          {
            programId,
            userId,
          }
        );
      }

      this.logger.info("Member or admin authorization successful", {
        programId,
        userId,
        isAdmin,
        isMember,
      });

      req.program = program;
      next();
    } catch (error) {
      this.logger.error("Member or admin authorization failed", {
        programId: req.params.programId,
        userId: req.user.getId().toString(),
        error: error instanceof Error ? error.message : error,
      });
      next(error);
    }
  };

  static validateBlockLogRequest = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = blockLogSchema.safeParse(req.body);
      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          message: "Block log request validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}
